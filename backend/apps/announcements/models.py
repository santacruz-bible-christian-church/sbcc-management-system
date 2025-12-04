from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Announcement(models.Model):
    """Church announcements with scheduling and group targeting"""

    AUDIENCE_ALL = "all"
    AUDIENCE_MINISTRY = "ministry"
    AUDIENCE_CHOICES = [
        (AUDIENCE_ALL, "All Members"),
        (AUDIENCE_MINISTRY, "Specific Ministry"),
    ]

    # Content
    title = models.CharField(max_length=255)
    body = models.TextField()

    # Targeting (Feature #2: Group-specific messages)
    audience = models.CharField(
        max_length=20,
        choices=AUDIENCE_CHOICES,
        default=AUDIENCE_ALL,
        help_text="Who should receive this announcement",
    )
    ministry = models.ForeignKey(
        "ministries.Ministry",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="announcements",
        help_text="Required if audience is 'ministry'",
    )

    # Scheduling (Feature #1: Post and schedule)
    publish_at = models.DateTimeField(
        default=timezone.now, help_text="When this announcement becomes visible"
    )
    expire_at = models.DateTimeField(
        null=True, blank=True, help_text="Optional: When this announcement expires"
    )

    # Status
    is_active = models.BooleanField(default=True)
    sent = models.BooleanField(default=False, help_text="Has email notification been sent")

    # Metadata
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_announcements"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-publish_at"]
        indexes = [
            models.Index(fields=["-publish_at"]),
            models.Index(fields=["audience", "ministry"]),
        ]

    def __str__(self):
        return self.title

    def is_published(self):
        """Check if announcement is currently published"""
        now = timezone.now()
        if not self.is_active or self.publish_at > now:
            return False
        if self.expire_at and self.expire_at < now:
            return False
        return True
