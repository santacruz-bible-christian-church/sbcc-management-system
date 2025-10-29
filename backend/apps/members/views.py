from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import Member
from .serializers import MemberSerializer
from .services import get_upcoming_anniversaries, get_upcoming_birthdays


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
        if not data.get("user"):
            data["user"] = request.user.pk
        # default status to 'active' if not provided
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
        # Prevent non-admins from changing the user relation
        if "user" in data and not request.user.is_staff:
            data.pop("user")
        # Restrict changing status to staff only
        if "status" in data and not request.user.is_staff:
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
        if member.status == "archived":
            return Response(
                {"detail": "Member already archived."}, status=status.HTTP_400_BAD_REQUEST
            )
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
        Set status for one or multiple members.
        Payload: { "ids": [1,2], "status": "inactive" }
        Only staff can set status.
        """
        if not request.user.is_staff:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        ids = request.data.get("ids") or []
        status_value = request.data.get("status")
        if not status_value or status_value not in dict(Member.STATUS_CHOICES):
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(ids, (list, tuple)):
            return Response({"detail": "ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(id__in=ids)
        now = timezone.now()
        if status_value == "archived":
            updated = qs.update(
                status=status_value, archived_at=now, is_active=False, updated_at=now
            )
        else:
            # clear archived_at for non-archived statuses; set is_active only for 'active'
            updated = qs.update(
                status=status_value,
                archived_at=None,
                is_active=(status_value == "active"),
                updated_at=now,
            )
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
