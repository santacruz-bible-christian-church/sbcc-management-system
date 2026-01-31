from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for user notifications."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete"]

    def get_queryset(self):
        """Return notifications for current user only."""
        return Notification.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Block direct creation - notifications are created via services only."""
        return Response(
            {"detail": "Direct notification creation is not allowed."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = self.get_queryset().filter(read=False).count()
        return Response({"unread_count": count})

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        notification.read = True
        notification.save(update_fields=["read"])
        return Response({"status": "marked as read"})

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        updated = self.get_queryset().filter(read=False).update(read=True)
        return Response({"status": "all marked as read", "count": updated})
