from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Ministry(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    leader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='led_ministries'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ministries'
        verbose_name_plural = 'ministries'
        ordering = ['name']

    def __str__(self):
        return self.name


class MinistryMember(models.Model):
    """Link a User to a Ministry with role and availability preferences."""
    ROLE_CHOICES = [
        ('volunteer', 'Volunteer'),
        ('lead', 'Lead'),
        ('usher', 'Usher'),
        ('worship', 'Worship'),
        # extend as needed
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ministry_memberships')
    ministry = models.ForeignKey(
        Ministry,
        on_delete=models.CASCADE,
        related_name='ministry_members',
        related_query_name='ministry_member'
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='volunteer')
    is_active = models.BooleanField(default=True)
    max_consecutive_shifts = models.PositiveSmallIntegerField(default=2)
    # availability could be richer (days/times) — this is a simple example
    available_days = models.JSONField(default=list, blank=True)  # e.g. ["mon","sun"]
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'ministry')
        # Order by ministry (FK) and then user (FK). Avoid related__field lookups here.
        ordering = ['ministry', 'user']

    def __str__(self):
        # safe string representation even if username not set
        username = getattr(self.user, 'username', str(self.user))
        return f"{username} @ {self.ministry.name} ({self.role})"


class Shift(models.Model):
    """
    A shift instance that needs an assignment. Use this to represent a
    single scheduled slot (date/time) for a ministry and role.
    """
    ministry = models.ForeignKey(Ministry, on_delete=models.CASCADE, related_name='shifts')
    role = models.CharField(max_length=30)  # mirrors ROLE_CHOICES; free text for flexibility
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('ministry', 'role', 'date')
        # Order by date first, then ministry FK (id). If you need alphabetical ordering
        # by ministry name, do that via QuerySet ordering in views/queries.
        ordering = ['date', 'ministry']

    def __str__(self):
        return f"{self.ministry.name} - {self.role} on {self.date}"


class Assignment(models.Model):
    """Assign a user to a shift."""
    shift = models.OneToOneField(Shift, on_delete=models.CASCADE, related_name='assignment')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)   # did we send initial notification?
    reminded = models.BooleanField(default=False)   # did we send reminder?

    class Meta:
        # Keep ordering simple and based on local fields to avoid model-load issues.
        ordering = ['shift', 'user']

    def __str__(self):
        username = getattr(self.user, 'username', str(self.user))
        return f"{username} -> {self.shift}"