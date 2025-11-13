from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Event(models.Model):
    """Church events and services"""

    EVENT_TYPES = [
        ("service", "Sunday Service"),
        ("bible_study", "Bible Study"),
        ("prayer_meeting", "Prayer Meeting"),
        ("fellowship", "Fellowship"),
        ("outreach", "Outreach"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # Date & Time
    date = models.DateTimeField(help_text="Event start date and time")
    end_date = models.DateTimeField(null=True, blank=True, help_text="Event end date and time")
    location = models.CharField(max_length=200)

    # Relationships
    organizer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="organized_events",
        help_text="User organizing this event",
    )
    ministry = models.ForeignKey(
        "ministries.Ministry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
        help_text="Ministry organizing this event",
    )

    # Event Settings
    max_attendees = models.PositiveIntegerField(
        null=True, blank=True, help_text="Maximum number of attendees (leave blank for unlimited)"
    )
    is_recurring = models.BooleanField(default=False, help_text="Is this a recurring event?")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "events"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%Y-%m-%d %H:%M')}"

    @property
    def is_full(self):
        """Check if event has reached maximum capacity"""
        if not self.max_attendees:
            return False
        return self.registrations.count() >= self.max_attendees

    @property
    def available_slots(self):
        """Return number of available slots"""
        if not self.max_attendees:
            return None
        return max(0, self.max_attendees - self.registrations.count())

    @property
    def registered_count(self):
        """Number of members who registered (RSVP'd)"""
        return self.registrations.count()


class EventRegistration(models.Model):
    """
    RSVP tracking for special church events
    For attendance tracking of regular services, use the Attendance model
    """

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    member = models.ForeignKey(
        "members.Member", on_delete=models.CASCADE, related_name="event_registrations"
    )

    # Registration
    registered_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Notes about registration")

    # Attendance tracking (DEPRECATED - use Attendance model instead)
    attended = models.BooleanField(default=False, help_text="DEPRECATED: Use Attendance model")
    check_in_time = models.DateTimeField(
        null=True, blank=True, help_text="DEPRECATED: Use Attendance model"
    )

    class Meta:
        db_table = "event_registrations"
        unique_together = ("event", "member")
        ordering = ["-registered_at"]

    def __str__(self):
        return f"{self.member.full_name} - {self.event.title}"

    def mark_attended(self, check_in_time=None):
        """DEPRECATED: Use Attendance model instead"""
        from django.utils import timezone

        self.attended = True
        self.check_in_time = check_in_time or timezone.now()
        self.save()
