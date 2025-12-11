from datetime import date
from io import BytesIO

from django.contrib.auth import get_user_model
from django.db import models, transaction
from django.http import HttpResponse
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import Member
from .serializers import MemberSerializer
from .services import (
    get_demographic_statistics,
    get_ministry_demographics,
    get_upcoming_anniversaries,
    get_upcoming_birthdays,
)

User = get_user_model()


class MemberViewSet(viewsets.ModelViewSet):
    """ViewSet for Member model"""

    queryset = Member.objects.select_related("user", "ministry").all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ministry", "status", "gender"]
    search_fields = ["first_name", "last_name", "email", "phone"]
    ordering_fields = ["first_name", "last_name", "membership_date"]
    ordering = ["last_name", "first_name"]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # Generate unique username from email or name
        email = data.get("email", "")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")

        # Create username from email or name
        if email:
            username_base = email.split("@")[0]
        else:
            username_base = f"{first_name.lower()}{last_name.lower()}"

        # Make username unique
        username = username_base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{username_base}{counter}"
            counter += 1

        # Check if user with this email already exists
        existing_user = User.objects.filter(email=email).first() if email else None

        if existing_user:
            # Check if this user already has a member profile
            if hasattr(existing_user, "member_profile"):
                return Response(
                    {"detail": f"A member profile already exists for {email}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Use existing user
            data["user"] = existing_user.pk
        else:
            # Create new user with random password
            # FIX: Use Django's get_random_string instead
            from django.utils.crypto import get_random_string

            random_password = get_random_string(length=12)

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role="member",
                password=random_password,  # Use the random string
            )
            data["user"] = user.pk

        # Default status to 'active' if not provided
        if not data.get("status"):
            data["status"] = "active"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        data = request.data.copy()

        # Prevent changing the user relation
        if "user" in data:
            data.pop("user")

        # Restrict changing status to staff only
        if "status" in data and not request.user.is_staff:
            data.pop("status")

        # Update user model fields if provided
        if instance.user:
            user_updated = False
            if "first_name" in data:
                instance.user.first_name = data["first_name"]
                user_updated = True
            if "last_name" in data:
                instance.user.last_name = data["last_name"]
                user_updated = True
            if "email" in data:
                instance.user.email = data["email"]
                user_updated = True

            if user_updated:
                instance.user.save()

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def archive(self, request, pk=None):
        """Soft-archive a member (set status to 'archived', set archived_at and deactivate)."""
        member = self.get_object()
        member.status = "archived"
        member.archived_at = timezone.now()
        member.is_active = False
        member.save(update_fields=["status", "archived_at", "is_active", "updated_at"])
        return Response({"detail": "Member archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def restore(self, request, pk=None):
        """Restore a previously archived member (set status back to 'active')."""
        member = self.get_object()
        if member.status != "archived":
            return Response(
                {"detail": "Member is not archived."}, status=status.HTTP_400_BAD_REQUEST
            )
        member.status = "active"
        member.archived_at = None
        member.is_active = True
        member.save(update_fields=["status", "archived_at", "is_active", "updated_at"])
        return Response({"detail": "Member restored."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def bulk_archive(self, request):
        """
        Bulk archive members.
        Payload: { "ids": [1,2,3] }
        """
        ids = request.data.get("ids") or []
        if not isinstance(ids, (list, tuple)):
            return Response({"detail": "ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(id__in=ids).exclude(status="archived")
        now = timezone.now()
        updated = qs.update(status="archived", archived_at=now, is_active=False, updated_at=now)
        return Response({"archived_count": updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def set_status(self, request):
        """
        Set status for one or more members.
        Payload: { "ids": [1,2,3], "status": "active" }
        """
        ids = request.data.get("ids") or []
        new_status = request.data.get("status")
        if not isinstance(ids, (list, tuple)):
            return Response({"detail": "ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)
        if new_status not in dict(Member.STATUS_CHOICES):
            return Response({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(id__in=ids)
        updated = qs.update(status=new_status, updated_at=timezone.now())
        return Response({"updated_count": updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def upcoming_birthdays(self, request):
        """
        GET /api/members/upcoming_birthdays/?days=7
        Returns members with birthdays in the next `days` days (default 7).
        """
        try:
            days = int(request.query_params.get("days", 7))
        except ValueError:
            days = 7
        reminders = get_upcoming_birthdays(days=days)
        data = []
        for r in reminders:
            ser = self.get_serializer(r["member"])
            item = ser.data
            item["occurrence_date"] = r["occurrence"].isoformat()
            data.append(item)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def upcoming_anniversaries(self, request):
        """
        GET /api/members/upcoming_anniversaries/?days=7
        Returns members with anniversaries in the next `days` days (default 7).
        """
        try:
            days = int(request.query_params.get("days", 7))
        except ValueError:
            days = 7
        reminders = get_upcoming_anniversaries(days=days)
        data = []
        for r in reminders:
            ser = self.get_serializer(r["member"])
            item = ser.data
            item["occurrence_date"] = r["occurrence"].isoformat()
            data.append(item)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def demographics(self, request):
        """
        Get demographic statistics for all members
        GET /api/members/demographics/

        Similar to: attendance/views.py ministry_report action
        Returns: Gender, age group, and ministry distribution
        """
        stats = get_demographic_statistics()
        return Response(stats)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def ministry_demographics(self, request):
        """
        Get demographic statistics for a specific ministry
        GET /api/members/ministry_demographics/?ministry=5

        Query Parameters:
            ministry (int): Ministry ID

        Returns: Ministry-specific demographics
        """
        ministry_id = request.query_params.get("ministry")

        if not ministry_id:
            return Response(
                {"error": "Ministry ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ministry_id = int(ministry_id)
        except ValueError:
            return Response({"error": "Invalid ministry ID"}, status=status.HTTP_400_BAD_REQUEST)

        stats = get_ministry_demographics(ministry_id)

        if "error" in stats:
            return Response(stats, status=status.HTTP_404_NOT_FOUND)

        return Response(stats)

    @action(detail=False, methods=["get"], url_path="export-pdf")
    def export_pdf(self, request):
        """
        Export members list as PDF
        GET /api/members/export-pdf/?status=active&ministry=1&gender=male

        Supports the same filters as the list endpoint.
        """
        # Apply filters from query params
        qs = self.get_queryset()

        # Filter by status
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        else:
            # Default: exclude archived
            qs = qs.exclude(status="archived")

        # Filter by ministry
        ministry_filter = request.query_params.get("ministry")
        if ministry_filter:
            qs = qs.filter(ministry_id=ministry_filter)

        # Filter by gender
        gender_filter = request.query_params.get("gender")
        if gender_filter:
            qs = qs.filter(gender=gender_filter)

        # Search
        search = request.query_params.get("search")
        if search:
            qs = qs.filter(
                models.Q(first_name__icontains=search)
                | models.Q(last_name__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(phone__icontains=search)
            )

        qs = qs.order_by("last_name", "first_name")

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            leftMargin=1.5 * cm,
            rightMargin=1.5 * cm,
            topMargin=1.5 * cm,
            bottomMargin=1.5 * cm,
        )

        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=18,
            spaceAfter=6,
        )
        elements.append(Paragraph("SBCC Member Directory", title_style))

        # Subtitle with filters info
        filter_parts = []
        if status_filter:
            filter_parts.append(f"Status: {status_filter.title()}")
        if ministry_filter:
            ministry_name = (
                qs.first().ministry.name if qs.exists() and qs.first().ministry else "Unknown"
            )
            filter_parts.append(f"Ministry: {ministry_name}")
        if gender_filter:
            filter_parts.append(f"Gender: {gender_filter.title()}")

        subtitle = f"Generated on {date.today().strftime('%B %d, %Y')}"
        if filter_parts:
            subtitle += f" | Filters: {', '.join(filter_parts)}"
        subtitle += f" | Total: {qs.count()} members"

        elements.append(Paragraph(subtitle, styles["Normal"]))
        elements.append(Spacer(1, 0.5 * cm))

        # Table header
        table_data = [
            [
                "Name",
                "Email",
                "Phone",
                "Gender",
                "Birthday",
                "Ministry",
                "Status",
                "Member Since",
                "Attendance",
            ]
        ]

        # Table rows
        for member in qs:
            birthday = member.date_of_birth.strftime("%b %d, %Y") if member.date_of_birth else "N/A"
            ministry_name = member.ministry.name if member.ministry else "Unassigned"
            membership_date = (
                member.membership_date.strftime("%b %d, %Y") if member.membership_date else "N/A"
            )
            attendance = f"{member.attendance_rate:.0f}%" if member.attendance_rate else "0%"

            table_data.append(
                [
                    member.full_name,
                    member.email or "N/A",
                    member.phone or "N/A",
                    (member.gender or "N/A").title(),
                    birthday,
                    ministry_name,
                    (member.status or "active").title(),
                    membership_date,
                    attendance,
                ]
            )

        # Create table with column widths
        col_widths = [
            3.5 * cm,
            4.5 * cm,
            2.5 * cm,
            1.8 * cm,
            2.5 * cm,
            3 * cm,
            1.8 * cm,
            2.5 * cm,
            2 * cm,
        ]
        table = Table(table_data, colWidths=col_widths, repeatRows=1)

        table.setStyle(
            TableStyle(
                [
                    # Header styling
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FDB54A")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 9),
                    ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                    ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("TOPPADDING", (0, 0), (-1, 0), 8),
                    # Body styling
                    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 1), (-1, -1), 8),
                    ("ALIGN", (0, 1), (-1, -1), "LEFT"),
                    ("VALIGN", (0, 1), (-1, -1), "MIDDLE"),
                    ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
                    ("TOPPADDING", (0, 1), (-1, -1), 6),
                    # Grid
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    # Alternating row colors
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.HexColor("#FFF8E7")],
                    ),
                ]
            )
        )

        elements.append(table)

        # Footer
        elements.append(Spacer(1, 0.5 * cm))
        footer_style = ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontSize=8,
            textColor=colors.grey,
        )
        elements.append(
            Paragraph(
                "This document is confidential and intended for internal use only.",
                footer_style,
            )
        )

        doc.build(elements)

        pdf_value = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="sbcc_members_{date.today().isoformat()}.pdf"'
        )
        response.write(pdf_value)
        return response

    @action(detail=True, methods=["get"], url_path="export-profile-pdf")
    def export_profile_pdf(self, request, pk=None):
        """
        Export a single member's profile as PDF
        GET /api/members/{id}/export-profile-pdf/
        """
        member = self.get_object()

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=20,
            spaceAfter=6,
        )
        elements.append(Paragraph("Member Profile", title_style))
        elements.append(
            Paragraph(f"Generated on {date.today().strftime('%B %d, %Y')}", styles["Normal"])
        )
        elements.append(Spacer(1, 0.5 * cm))

        # Member name as header
        name_style = ParagraphStyle(
            "MemberName",
            parent=styles["Heading1"],
            fontSize=16,
            textColor=colors.HexColor("#FDB54A"),
        )
        elements.append(Paragraph(member.full_name, name_style))
        elements.append(Spacer(1, 0.3 * cm))

        # Personal Information Table
        personal_data = [
            ["Personal Information", ""],
            ["Email", member.email or "N/A"],
            ["Phone", member.phone or "N/A"],
            ["Gender", (member.gender or "N/A").title()],
            [
                "Date of Birth",
                member.date_of_birth.strftime("%B %d, %Y") if member.date_of_birth else "N/A",
            ],
            [
                "Baptism Date",
                member.baptism_date.strftime("%B %d, %Y") if member.baptism_date else "N/A",
            ],
        ]

        personal_table = Table(personal_data, colWidths=[5 * cm, 10 * cm])
        personal_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FDB54A")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("SPAN", (0, 0), (-1, 0)),
                    ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                    ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                    ("FONTNAME", (1, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#FFF8E7")),
                ]
            )
        )
        elements.append(personal_table)
        elements.append(Spacer(1, 0.5 * cm))

        # Membership Information Table
        membership_data = [
            ["Membership Information", ""],
            ["Status", (member.status or "active").title()],
            ["Ministry", member.ministry.name if member.ministry else "Unassigned"],
            [
                "Member Since",
                member.membership_date.strftime("%B %d, %Y") if member.membership_date else "N/A",
            ],
            ["Member ID", f"#{member.id}"],
        ]

        membership_table = Table(membership_data, colWidths=[5 * cm, 10 * cm])
        membership_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FDB54A")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("SPAN", (0, 0), (-1, 0)),
                    ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                    ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                    ("FONTNAME", (1, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#FFF8E7")),
                ]
            )
        )
        elements.append(membership_table)
        elements.append(Spacer(1, 0.5 * cm))

        # Attendance Statistics Table
        attendance_data = [
            ["Attendance Statistics", ""],
            [
                "Attendance Rate",
                f"{member.attendance_rate:.1f}%" if member.attendance_rate else "0%",
            ],
            [
                "Last Attended",
                member.last_attended.strftime("%B %d, %Y") if member.last_attended else "Never",
            ],
            ["Consecutive Absences", str(member.consecutive_absences)],
        ]

        attendance_table = Table(attendance_data, colWidths=[5 * cm, 10 * cm])
        attendance_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FDB54A")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("SPAN", (0, 0), (-1, 0)),
                    ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                    ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                    ("FONTNAME", (1, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#FFF8E7")),
                ]
            )
        )
        elements.append(attendance_table)

        # Footer
        elements.append(Spacer(1, 1 * cm))
        footer_style = ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontSize=8,
            textColor=colors.grey,
        )
        elements.append(
            Paragraph(
                "This document is confidential and intended for internal use only. | SBCC Management System",
                footer_style,
            )
        )

        doc.build(elements)

        pdf_value = buffer.getvalue()
        buffer.close()

        # Clean filename
        safe_name = member.full_name.replace(" ", "_").lower()
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="member_profile_{safe_name}_{date.today().isoformat()}.pdf"'
        )
        response.write(pdf_value)
        return response
