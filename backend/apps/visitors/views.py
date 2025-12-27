from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.members.models import Member

from .models import Visitor, VisitorAttendance
from .serializers import VisitorAttendanceSerializer, VisitorSerializer
from .services import AttendanceService

User = get_user_model()


class VisitorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing visitors.

    Supports:
    - CRUD operations for visitors
    - Check-in for attendance
    - Convert visitor to member
    - Update follow-up status
    - Search by name, email, phone
    """

    queryset = Visitor.objects.select_related("converted_to_member").all()
    serializer_class = VisitorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "follow_up_status"]
    search_fields = ["full_name", "email", "phone"]
    ordering_fields = ["full_name", "date_added", "status"]
    ordering = ["-date_added"]

    @action(detail=True, methods=["post"])
    def check_in(self, request, pk=None):
        """
        Check in a visitor for a service.
        POST /api/visitors/{id}/check_in/
        """
        visitor = self.get_object()
        service_date = request.data.get("service_date")

        attendance, error = AttendanceService.check_in_visitor(
            visitor=visitor,
            service_date=service_date,
            user=request.user,
        )

        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            VisitorAttendanceSerializer(attendance).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def convert_to_member(self, request, pk=None):
        """
        Convert a visitor to a member.
        POST /api/visitors/{id}/convert_to_member/
        """
        visitor = self.get_object()

        # Check if already converted
        if visitor.status == "member" or visitor.converted_to_member:
            return Response(
                {"error": "Visitor has already been converted to a member"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate date_of_birth is required
        date_of_birth = request.data.get("date_of_birth")
        if not date_of_birth:
            return Response(
                {"error": "date_of_birth is required for conversion"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Use request data if provided, otherwise fall back to visitor data
            # Phone: prefer request override, then visitor phone
            phone = request.data.get("phone") or visitor.phone or ""

            # Email: prefer request override, then visitor email, then placeholder
            email = request.data.get("email") or visitor.email
            if not email:
                # Generate placeholder email for visitors without email
                safe_name = visitor.full_name.lower().replace(" ", "_")
                email = f"{safe_name}@placeholder.local"

            # Split full_name into first/last
            name_parts = visitor.full_name.strip().split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            # Create member (no User needed)
            member = Member.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                date_of_birth=date_of_birth,
                status="active",
            )

            # Update visitor
            visitor.status = "member"
            visitor.converted_to_member = member
            visitor.save(update_fields=["status", "converted_to_member", "updated_at"])

            return Response(
                {
                    "message": "Visitor converted to member successfully",
                    "member_id": member.id,
                    "visitor": VisitorSerializer(visitor).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except IntegrityError as e:
            return Response(
                {"error": f"Database integrity error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["patch"])
    def update_follow_up(self, request, pk=None):
        """
        Update follow-up status for a visitor.
        PATCH /api/visitors/{id}/update_follow_up/
        """
        visitor = self.get_object()
        follow_up_status = request.data.get("follow_up_status")

        valid_choices = dict(Visitor.FOLLOW_UP_CHOICES).keys()
        if follow_up_status not in valid_choices:
            return Response(
                {"error": f"Invalid follow_up_status. Choose from: {list(valid_choices)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visitor.follow_up_status = follow_up_status
        visitor.save(update_fields=["follow_up_status", "updated_at"])

        return Response(VisitorSerializer(visitor).data)

    @action(detail=False, methods=["get"])
    def by_follow_up_status(self, request):
        """
        Get visitors filtered by follow-up status.
        GET /api/visitors/by_follow_up_status/?status=visited_1x
        """
        follow_up_status = request.query_params.get("status")

        if follow_up_status:
            queryset = self.get_queryset().filter(follow_up_status=follow_up_status)
        else:
            queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """
        Get visitor statistics.
        GET /api/visitors/statistics/
        """
        from django.db.models import Count

        total = Visitor.objects.count()
        by_status = dict(
            Visitor.objects.values("status")
            .annotate(count=Count("id"))
            .values_list("status", "count")
        )
        by_follow_up = dict(
            Visitor.objects.values("follow_up_status")
            .annotate(count=Count("id"))
            .values_list("follow_up_status", "count")
        )

        return Response(
            {
                "total": total,
                "by_status": by_status,
                "by_follow_up": by_follow_up,
                "visitors": by_status.get("visitor", 0),
                "converted_to_members": by_status.get("member", 0),
            }
        )


class VisitorAttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing visitor attendance records."""

    queryset = VisitorAttendance.objects.select_related("visitor", "added_by").all()
    serializer_class = VisitorAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)
