from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

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
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
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

    queryset = MinistryMember.objects.select_related("user", "ministry").all()
    serializer_class = MinistryMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ministry", "role", "is_active"]
    search_fields = ["user__first_name", "user__last_name", "user__email"]
    ordering_fields = ["created_at", "role"]
    ordering = ["-created_at"]


class ShiftViewSet(viewsets.ModelViewSet):
    """ViewSet for Shift model"""

    queryset = Shift.objects.select_related("ministry").all()
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Remove 'role' from filterset_fields
    filterset_fields = ["ministry", "date"]

    # Remove 'role' from search_fields
    search_fields = ["ministry__name", "notes"]

    ordering_fields = ["date", "start_time"]
    ordering = ["date", "start_time"]


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment model"""

    queryset = Assignment.objects.select_related("shift__ministry", "user").all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Update filterset_fields - remove notified, reminded, shift__role
    filterset_fields = ["shift__ministry", "user", "attended"]

    # Update search_fields - remove shift__role
    search_fields = ["user__first_name", "user__last_name", "shift__ministry__name"]

    ordering_fields = ["assigned_at"]
    ordering = ["-assigned_at"]
