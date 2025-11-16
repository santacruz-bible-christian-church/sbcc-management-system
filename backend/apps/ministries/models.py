from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Ministry(models.Model):
    """
    Represents a ministry in the church.
    Examples: Music Ministry, Usher Ministry, Worship Ministry, Youth Ministry
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    leader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="led_ministries",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "ministries"
        ordering = ["name"]

    def __str__(self):
        return self.name


class MinistryMember(models.Model):
    """
    Link a User to a Ministry with role and availability preferences.
    Role is either 'volunteer' or 'lead' (ministry coordinator).
    """

    ROLE_CHOICES = [
        ("volunteer", "Volunteer"),
        ("lead", "Lead"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ministry_memberships")
    ministry = models.ForeignKey(
        Ministry,
        on_delete=models.CASCADE,
        related_name="ministry_members",
        related_query_name="ministry_member",
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="volunteer")
    is_active = models.BooleanField(default=True)
    max_consecutive_shifts = models.PositiveSmallIntegerField(default=2)
    available_days = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "ministry")
        ordering = ["ministry__name", "user__username"]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.ministry.name} ({self.role})"


class Shift(models.Model):
    """
    A shift instance that needs an assignment.
    Represents a single scheduled slot (date/time) for a ministry.
    """

    ministry = models.ForeignKey(Ministry, on_delete=models.CASCADE, related_name="shifts")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.ministry.name} - {self.date} {self.start_time}-{self.end_time}"


class Assignment(models.Model):
    """Assign a user to a shift."""

    shift = models.OneToOneField(Shift, on_delete=models.CASCADE, related_name="assignment")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assignments")
    assigned_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.user.get_full_name()} → {self.shift}"
