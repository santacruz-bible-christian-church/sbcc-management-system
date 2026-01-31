from django.db import models

from apps.authentication.models import User


class Notification(models.Model):
    """In-app notification for users."""

    TYPE_CHOICES = [
        ("prayer_request", "Prayer Request"),
        ("event", "Event"),
        ("announcement", "Announcement"),
        ("attendance", "Attendance Alert"),
        ("ministry", "Ministry Assignment"),
        ("system", "System"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    link = models.CharField(
        max_length=255, blank=True, help_text="URL path to navigate when clicked"
    )
    read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "read", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.type}: {self.title} → {self.user.username}"
