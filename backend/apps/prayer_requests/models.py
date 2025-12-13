from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class PrayerRequest(models.Model):
    """
    Prayer request model for digital submission and tracking.
    Supports assignment to pastors/elders and progress tracking.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("assigned", "Assigned"),
        ("in_progress", "In Progress"),
        ("prayed", "Prayed For"),
        ("follow_up", "Needs Follow-up"),
        ("completed", "Completed"),
        ("archived", "Archived"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    CATEGORY_CHOICES = [
        ("health", "Health & Healing"),
        ("family", "Family"),
        ("financial", "Financial"),
        ("spiritual", "Spiritual Growth"),
        ("relationships", "Relationships"),
        ("work", "Work/Career"),
        ("grief", "Grief & Loss"),
        ("thanksgiving", "Thanksgiving"),
        ("guidance", "Guidance & Wisdom"),
        ("other", "Other"),
    ]

    # Submission fields
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Details of the prayer request")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    is_anonymous = models.BooleanField(
        default=False, help_text="Hide requester identity from public view"
    )
    is_private = models.BooleanField(
        default=False, help_text="Only visible to assigned pastors/elders"
    )
    is_public = models.BooleanField(
        default=False, help_text="Can be shared with congregation for prayer"
    )

    # Requester info
    requester = models.ForeignKey(
        "members.Member",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prayer_requests",
        help_text="Member who submitted the request",
    )
    requester_name = models.CharField(
        max_length=100, blank=True, help_text="Name for non-member submissions"
    )
    requester_email = models.EmailField(blank=True, help_text="Email for non-member submissions")
    requester_phone = models.CharField(
        max_length=15, blank=True, help_text="Phone for non-member submissions"
    )

    # Assignment and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_prayer_requests",
        help_text="Pastor or elder assigned to this request",
        limit_choices_to={"role__in": ["pastor", "elder", "admin"]},
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prayer_assignments_made",
    )

    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "prayer_requests"
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["assigned_to"]),
            models.Index(fields=["-submitted_at"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    def assign_to(self, user, assigned_by=None):
        """Assign this request to a pastor/elder"""
        self.assigned_to = user
        self.assigned_at = timezone.now()
        self.assigned_by = assigned_by
        if self.status == "pending":
            self.status = "assigned"
        self.save()

    def mark_completed(self):
        """Mark request as completed"""
        self.status = "completed"
        self.completed_at = timezone.now()
        self.save()

    @property
    def requester_display_name(self):
        """Get display name for requester"""
        if self.is_anonymous:
            return "Anonymous"
        if self.requester:
            return f"{self.requester.first_name} {self.requester.last_name}"
        return self.requester_name or "Unknown"


class PrayerRequestFollowUp(models.Model):
    """
    Follow-up logs for prayer requests.
    Tracks progress, notes, and actions taken.
    """

    ACTION_CHOICES = [
        ("prayed", "Prayed For"),
        ("called", "Phone Call Made"),
        ("visited", "Home Visit"),
        ("counseling", "Counseling Session"),
        ("email", "Email Sent"),
        ("text", "Text Message Sent"),
        ("meeting", "Meeting Held"),
        ("note", "Note Added"),
        ("other", "Other"),
    ]

    prayer_request = models.ForeignKey(
        PrayerRequest, on_delete=models.CASCADE, related_name="follow_ups"
    )
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES, default="note")
    notes = models.TextField(help_text="Details of the follow-up action")
    is_private = models.BooleanField(
        default=True, help_text="Private notes only visible to pastors/elders"
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="prayer_follow_ups"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "prayer_request_follow_ups"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_action_type_display()} - {self.prayer_request.title}"
