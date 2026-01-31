from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""

    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ["id", "type", "title", "message", "link", "read", "created_at", "time_ago"]
        read_only_fields = ["id", "type", "title", "message", "link", "created_at"]

    def get_time_ago(self, obj):
        """Human-readable time ago."""
        delta = timezone.now() - obj.created_at

        if delta < timedelta(minutes=1):
            return "Just now"
        elif delta < timedelta(hours=1):
            minutes = int(delta.total_seconds() / 60)
            return f"{minutes}m ago"
        elif delta < timedelta(days=1):
            hours = int(delta.total_seconds() / 3600)
            return f"{hours}h ago"
        elif delta < timedelta(days=7):
            days = delta.days
            return f"{days}d ago"
        else:
            return obj.created_at.strftime("%b %d")
