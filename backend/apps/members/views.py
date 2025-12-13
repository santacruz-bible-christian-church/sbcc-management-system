from datetime import date, datetime
from io import BytesIO
import csv
import io
from dateutil import parser as date_parser 

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


class MemberViewSet(viewsets.ModelViewSet):
    """ViewSet for Member model"""

    queryset = Member.objects.select_related("ministry").all()  # Remove "user"
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ministry", "status", "gender"]
    search_fields = ["first_name", "last_name", "email", "phone"]
    ordering_fields = ["first_name", "last_name", "membership_date"]
    ordering = ["last_name", "first_name"]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a member - simple data record, no User account."""
        data = request.data.copy()

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

        # Restrict changing status to admin/super_admin only
        is_admin_or_above = (
            request.user.is_staff
            or request.user.is_superuser
            or request.user.role in ["super_admin", "admin"]
        )
        if "status" in data and not is_admin_or_above:
            data.pop("status")

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

    def _parse_date(self, date_str):
        """
        Parse various date formats to YYYY-MM-DD
        Handles: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, etc.
        """
        if not date_str or str(date_str).strip() == '':
            return None
        
        try:
            # Try parsing with dateutil (handles most formats)
            parsed_date = date_parser.parse(str(date_str).strip())
            # Return in Django's expected format
            return parsed_date.strftime('%Y-%m-%d')
        except (ValueError, TypeError, date_parser.ParserError):
            # If parsing fails, try manual formats
            date_formats = [
                '%Y-%m-%d',      # 2024-12-14
                '%m/%d/%Y',      # 12/14/2024
                '%d/%m/%Y',      # 14/12/2024
                '%Y/%m/%d',      # 2024/12/14
                '%m-%d-%Y',      # 12-14-2024
                '%d-%m-%Y',      # 14-12-2024
                '%B %d, %Y',     # December 14, 2024
                '%b %d, %Y',     # Dec 14, 2024
            ]
            
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(str(date_str).strip(), fmt)
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    continue
            
            # If all parsing fails, return None
            return None

    @action(detail=False, methods=["post"], url_path="import-csv")
    def import_csv(self, request):
        """Import members from CSV file"""
        import logging
        logger = logging.getLogger(__name__)
        
        if "file" not in request.FILES:
            return Response(
                {"detail": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        csv_file = request.FILES["file"]

        if not csv_file.name.endswith(".csv"):
            return Response(
                {"detail": "File must be a CSV"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            decoded_file = csv_file.read().decode("utf-8")
            csv_reader = csv.DictReader(io.StringIO(decoded_file))

            members_created = []
            errors = []
            row_number = 1

            for row in csv_reader:
                row_number += 1
                try:
                    # ✅ Parse boolean fields correctly
                    def parse_bool(value):
                        if not value or value.strip() == "":
                            return None
                        return value.lower() in ("true", "yes", "1", "t", "y")

                    # ✅ Use the new date parser for ALL date fields
                    member_data = {
                        "first_name": row.get("first_name", "").strip(),
                        "last_name": row.get("last_name", "").strip(),
                        "email": row.get("email", "").strip(),
                        "phone": row.get("phone", "").strip(),
                        "date_of_birth": self._parse_date(row.get("date_of_birth")),  # ✅ Parse date
                        "gender": row.get("gender", "").lower() if row.get("gender") else None,
                        "complete_address": row.get("complete_address") or None,
                        "occupation": row.get("occupation") or None,
                        "marital_status": row.get("marital_status", "").lower() if row.get("marital_status") else None,
                        "wedding_anniversary": self._parse_date(row.get("wedding_anniversary")),  # ✅ Parse date
                        "elementary_school": row.get("elementary_school") or None,
                        "elementary_year_graduated": self._parse_year(row.get("elementary_year_graduated")),
                        "secondary_school": row.get("secondary_school") or None,
                        "secondary_year_graduated": self._parse_year(row.get("secondary_year_graduated")),
                        "vocational_school": row.get("vocational_school") or None,
                        "vocational_year_graduated": self._parse_year(row.get("vocational_year_graduated")),
                        "college": row.get("college") or None,
                        "college_year_graduated": self._parse_year(row.get("college_year_graduated")),
                        "accepted_jesus": parse_bool(row.get("accepted_jesus")),
                        "salvation_testimony": row.get("salvation_testimony") or None,
                        "spiritual_birthday": self._parse_date(row.get("spiritual_birthday")),  # ✅ Parse date
                        "baptism_date": self._parse_date(row.get("baptism_date")),  # ✅ Parse date
                        "willing_to_be_baptized": parse_bool(row.get("willing_to_be_baptized")),
                        "previous_church": row.get("previous_church") or None,
                        "how_introduced": row.get("how_introduced") or None,
                        "began_attending_since": self._parse_date(row.get("began_attending_since")),  # ✅ Parse date
                        "is_active": parse_bool(row.get("is_active")) if row.get("is_active") else True,
                    }

                    logger.info(f"Row {row_number}: Creating {member_data['first_name']} {member_data['last_name']}")
                    logger.debug(f"Parsed dates - DOB: {member_data['date_of_birth']}, Wedding: {member_data['wedding_anniversary']}")

                    serializer = MemberSerializer(data=member_data)
                    if serializer.is_valid():
                        member = serializer.save()
                        members_created.append(serializer.data)
                        logger.info(f"✅ Success: {member.full_name}")
                    else:
                        logger.error(f"❌ Validation failed row {row_number}: {serializer.errors}")
                        errors.append({
                            "row": row_number,
                            "data": {
                                "first_name": row.get("first_name"),
                                "last_name": row.get("last_name"),
                                "email": row.get("email"),
                            },
                            "errors": serializer.errors
                        })

                except Exception as e:
                    logger.error(f"❌ Exception row {row_number}: {str(e)}", exc_info=True)
                    errors.append({
                        "row": row_number,
                        "data": row,
                        "error": str(e)
                    })

            response_data = {
                "members_created": len(members_created),
                "members": members_created,
                "errors": errors,
                "total_rows": row_number - 1
            }

            logger.info(f"Import summary: {len(members_created)} created, {len(errors)} errors")

            # ✅ Return success even if there are some errors
            if len(members_created) > 0:
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"❌ Fatal error: {str(e)}", exc_info=True)
            return Response(
                {"detail": f"Error processing CSV: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def _parse_year(self, year_str):
        """Helper to parse year from string"""
        if not year_str or str(year_str).strip() == "":
            return None
        try:
            return int(year_str)
        except (ValueError, TypeError):
            return None
