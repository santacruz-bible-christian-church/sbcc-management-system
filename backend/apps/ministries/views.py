from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from common.permissions import IsAdminOrMinistryLeaderForMinistry, IsAdminOrMinistryLeaderForRelated

from .models import Assignment, Ministry, MinistryMember, Shift
from .serializers import (
    AssignmentSerializer,
    MinistryMemberSerializer,
    MinistrySerializer,
    ShiftSerializer,
)
from .utils import rotate_and_assign


class MinistryViewSet(viewsets.ModelViewSet):
    """ViewSet for Ministry model"""

    queryset = Ministry.objects.select_related("leader").all()
    serializer_class = MinistrySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrMinistryLeaderForMinistry]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Get ministry statistics
        GET /api/ministries/stats/

        Returns: { total_ministries, total_members, active_shifts, total_assignments }
        """
        from datetime import date

        today = date.today()

        total_ministries = Ministry.objects.count()
        total_members = MinistryMember.objects.filter(is_active=True).count()
        active_shifts = Shift.objects.filter(date__gte=today).count()
        total_assignments = Assignment.objects.count()

        return Response(
            {
                "total_ministries": total_ministries,
                "total_members": total_members,
                "active_shifts": active_shifts,
                "total_assignments": total_assignments,
            }
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsAdminOrMinistryLeaderForMinistry],
    )
    def rotate_shifts(self, request, pk=None):
        """
        Rotate and assign shifts for this ministry.
        POST /api/ministries/{id}/rotate_shifts/
        Body: { "days": 7, "dry_run": false, "notify": false, "limit_per_ministry": 0 }
        """
        ministry = self.get_object()

        data = request.data or {}
        days = int(data.get("days", 7))
        dry_run = bool(data.get("dry_run", False))
        notify = bool(data.get("notify", False))
        limit = int(data.get("limit_per_ministry", 0))

        summary = rotate_and_assign(
            ministry_ids=[ministry.pk],
            days=days,
            dry_run=dry_run,
            notify=notify,
            limit_per_ministry=limit,
        )

        status_code = status.HTTP_200_OK
        if summary.get("errors"):
            status_code = status.HTTP_207_MULTI_STATUS

        return Response(summary, status=status_code)


class MinistryMemberViewSet(viewsets.ModelViewSet):
    """ViewSet for MinistryMember model"""

    queryset = MinistryMember.objects.select_related("member", "ministry").all()
    serializer_class = MinistryMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrMinistryLeaderForRelated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ministry", "role", "is_active"]
    search_fields = ["member__first_name", "member__last_name", "member__email"]
    ordering_fields = ["created_at", "role"]
    ordering = ["-created_at"]


class ShiftViewSet(viewsets.ModelViewSet):
    """ViewSet for Shift model"""

    queryset = Shift.objects.select_related("ministry").all()
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrMinistryLeaderForRelated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ministry", "date"]
    search_fields = ["ministry__name", "notes"]
    ordering_fields = ["date", "start_time"]
    ordering = ["date", "start_time"]


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment model"""

    queryset = Assignment.objects.select_related("shift__ministry", "member").all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrMinistryLeaderForRelated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["shift__ministry", "member", "attended"]
    search_fields = ["member__first_name", "member__last_name", "shift__ministry__name"]
    ordering_fields = ["assigned_at"]
    ordering = ["-assigned_at"]
