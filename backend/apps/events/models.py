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

    RECURRENCE_CHOICES = [
        ("none", "None"),
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("biweekly", "Every 2 Weeks"),
        ("monthly", "Monthly"),
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

    # Recurrence Settings
    recurrence_pattern = models.CharField(
        max_length=20,
        choices=RECURRENCE_CHOICES,
        default="none",
        help_text="How often this event repeats",
    )
    recurrence_end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Stop generating occurrences after this date",
    )
    parent_event = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="occurrences",
        help_text="Parent event if this is a generated occurrence",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "events"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%Y-%m-%d %H:%M')}"

    @property
    def is_recurring(self):
        """Check if this is a recurring event (computed from recurrence_pattern)."""
        return self.recurrence_pattern != "none"

    @property
    def is_occurrence(self):
        """Check if this event is a generated occurrence of a parent event."""
        return self.parent_event is not None

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

    def generate_occurrences(self, weeks_ahead=4):
        """
        Generate future occurrences for this recurring event.

        Args:
            weeks_ahead: How many weeks into the future to generate

        Returns:
            List of created Event occurrences
        """
        from datetime import timedelta

        from django.utils import timezone

        if not self.is_recurring:
            return []

        if self.parent_event is not None:
            # This is already an occurrence, don't generate from it
            return []

        created = []
        current_date = self.date
        end_limit = timezone.now() + timedelta(weeks=weeks_ahead)

        # Respect recurrence_end_date if set
        if self.recurrence_end_date:
            end_date_aware = timezone.make_aware(
                timezone.datetime.combine(self.recurrence_end_date, timezone.datetime.min.time())
            )
            end_limit = min(end_limit, end_date_aware)

        # Calculate interval based on pattern
        intervals = {
            "daily": timedelta(days=1),
            "weekly": timedelta(weeks=1),
            "biweekly": timedelta(weeks=2),
            "monthly": timedelta(days=30),  # Approximate
        }
        interval = intervals.get(self.recurrence_pattern)
        if not interval:
            return []

        # Get existing occurrence dates to avoid duplicates
        existing_dates = set(self.occurrences.values_list("date__date", flat=True))
        existing_dates.add(self.date.date())  # Include parent event date

        # Generate occurrences
        next_date = current_date + interval
        while next_date <= end_limit:
            if next_date.date() not in existing_dates:
                # Calculate end_date offset if original has one
                new_end_date = None
                if self.end_date:
                    duration = self.end_date - self.date
                    new_end_date = next_date + duration

                occurrence = Event.objects.create(
                    title=self.title,
                    description=self.description,
                    event_type=self.event_type,
                    status=self.status,
                    date=next_date,
                    end_date=new_end_date,
                    location=self.location,
                    organizer=self.organizer,
                    ministry=self.ministry,
                    max_attendees=self.max_attendees,
                    recurrence_pattern="none",  # Occurrences don't recur
                    parent_event=self,
                )
                created.append(occurrence)
                existing_dates.add(next_date.date())

            next_date += interval

        return created


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
