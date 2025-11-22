from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator

class Role(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Volunteer(models.Model):
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    roles = models.ManyToManyField(Role, blank=True, related_name="volunteers")
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("last_name", "first_name")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1)], default=1)
    required_roles = models.ManyToManyField(Role, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("start",)

    def __str__(self):
        return f"{self.title} ({self.start:%Y-%m-%d %H:%M})"

    @property
    def confirmed_count(self):
        return self.assignments.filter(status=Assignment.Status.CONFIRMED).count()

class Assignment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        DECLINED = "declined", "Declined"
        CANCELLED = "cancelled", "Cancelled"

    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name="assignments")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="assignments")
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    assigned_at = models.DateTimeField(default=timezone.now)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("volunteer", "event")
        ordering = ("-assigned_at",)

    def __str__(self):
        return f"{self.volunteer} -> {self.event} [{self.status}]"

class Availability(models.Model):
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name="availability")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("date", "start_time")
        unique_together = ("volunteer", "date", "start_time", "end_time")

    def __str__(self):
        return f"{self.volunteer} available {self.date} {self.start_time}-{self.end_time}"
