from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.authentication.permissions import IsAdminOrSuperAdmin

from .models import Announcement
from .serializers import AnnouncementSerializer
from .services import send_announcement_email


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for announcements.
    Pattern follows: ministries/views.py, attendance/views.py
    """

    queryset = Announcement.objects.select_related("ministry", "created_by").all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Only admins/super_admins can create, update, or delete announcements."""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrSuperAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Auto-set created_by (like in attendance/views.py)"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def published(self, request):
        """
        Get published announcements for dashboard (Feature #3)
        GET /api/announcements/published/?ministry=<id>

        Pattern similar to: members/views.py upcoming_birthdays
        """
        now = timezone.now()
        queryset = (
            Announcement.objects.select_related("ministry", "created_by")
            .filter(is_active=True, publish_at__lte=now)
            .filter(Q(expire_at__isnull=True) | Q(expire_at__gt=now))
        )

        # Filter by ministry if provided
        ministry_id = request.query_params.get("ministry")

        if ministry_id:
            queryset = queryset.filter(
                Q(audience="all") | Q(audience="ministry", ministry_id=ministry_id)
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrSuperAdmin])
    def send_now(self, request, pk=None):
        """
        Send announcement email to target audience (Feature #2)
        POST /api/announcements/{id}/send_now/

        Pattern similar to: ministries/views.py rotate_shifts action
        """
        announcement = self.get_object()

        # Send email using service (like ministries/utils.py rotation)
        result = send_announcement_email(announcement)

        if result["success"]:
            return Response(
                {
                    "message": result["message"],
                    "recipients": result["total"],
                    "sent": result["sent"],
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": result["message"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"])
    def preview_recipients(self, request, pk=None):
        """
        Preview who will receive this announcement
        GET /api/announcements/{id}/preview_recipients/

        Useful for admins before sending
        """
        announcement = self.get_object()

        from .services import get_announcement_recipients

        recipients = list(get_announcement_recipients(announcement))

        return Response(
            {
                "count": len(recipients),
                "audience": announcement.get_audience_display(),
                "ministry": announcement.ministry.name if announcement.ministry else None,
                "sample_emails": recipients[:5],  # Show first 5 as preview
            }
        )
