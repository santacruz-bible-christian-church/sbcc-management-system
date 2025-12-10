import uuid
from datetime import datetime

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models

User = get_user_model()


class MeetingMinutes(models.Model):
    """
    Meeting Minutes model for recording church meeting records.
    Supports categorization, version control, and file attachments.
    """

    CATEGORY_CHOICES = [
        ("general", "General"),
        ("finance", "Finance"),
        ("worship", "Worship"),
        ("youth", "Youth"),
        ("outreach", "Outreach"),
        ("administrative", "Administrative"),
    ]

    # Basic Information
    title = models.CharField(max_length=200)
    meeting_date = models.DateField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="general")
    content = models.TextField(help_text="Meeting notes and decisions")
    attendees = models.TextField(blank=True, help_text="List of attendees")

    # Relationships
    ministry = models.ForeignKey(
        "ministries.Ministry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="meeting_minutes",
        help_text="Ministry this meeting belongs to (optional for general meetings)",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_meeting_minutes",
        help_text="User who created this record",
    )

    # Metadata
    is_active = models.BooleanField(default=True, help_text="Soft delete flag")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "meeting_minutes"
        ordering = ["-meeting_date", "-created_at"]
        verbose_name = "Meeting Minutes"
        verbose_name_plural = "Meeting Minutes"
        indexes = [
            models.Index(fields=["category", "meeting_date"]),
            models.Index(fields=["ministry", "meeting_date"]),
            models.Index(fields=["is_active", "meeting_date"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.meeting_date})"

    def clean(self):
        """Validate required fields."""
        if not self.title:
            raise ValidationError({"title": "Title is required."})
        if not self.meeting_date:
            raise ValidationError({"meeting_date": "Meeting date is required."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class MeetingMinutesAttachment(models.Model):
    """
    Attachments for meeting minutes.
    Stores files in R2 and supports text extraction for search.
    """

    def upload_to_path(instance, filename):
        """Generate organized file path."""
        import os

        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        date = datetime.now()
        return f"meeting_minutes/{date.year}/{date.month:02d}/{instance.meeting_minutes_id}/{unique_filename}"

    meeting_minutes = models.ForeignKey(
        MeetingMinutes,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="meeting_uploads",
    )

    # File storage
    file = models.FileField(upload_to=upload_to_path, max_length=500)

    # Metadata
    file_name = models.CharField(max_length=255, help_text="Original filename")
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    file_type = models.CharField(max_length=50, help_text="File extension")

    # Text extraction for search
    extracted_text = models.TextField(
        blank=True,
        help_text="Extracted text content for full-text search",
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "meeting_minutes_attachments"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.file_name} - {self.meeting_minutes.title}"

    @property
    def file_size_mb(self):
        """Return file size in MB."""
        return round(self.file_size / (1024 * 1024), 2)

    def delete(self, *args, **kwargs):
        """Delete file from storage when model is deleted."""
        if self.file:
            self.file.delete(save=False)
        super().delete(*args, **kwargs)


class MeetingMinutesVersion(models.Model):
    """
    Version history for meeting minutes.
    Tracks changes and allows restoration to previous versions.
    """

    meeting_minutes = models.ForeignKey(
        MeetingMinutes,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField()
    content = models.TextField(help_text="Content snapshot at this version")
    changed_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="meeting_minutes_changes",
    )
    change_summary = models.CharField(
        max_length=255,
        blank=True,
        help_text="Brief description of changes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "meeting_minutes_versions"
        ordering = ["-version_number"]
        unique_together = ["meeting_minutes", "version_number"]

    def __str__(self):
        return f"{self.meeting_minutes.title} - v{self.version_number}"
