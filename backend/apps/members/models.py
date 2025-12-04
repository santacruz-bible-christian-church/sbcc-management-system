from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Member(models.Model):
    """Church member profiles"""

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("archived", "Archived"),
        ("pending", "Pending"),
    ]

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="member_profile")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    date_of_birth = models.DateField()
    baptism_date = models.DateField(null=True, blank=True)
    ministry = models.ForeignKey(
        "ministries.Ministry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
    )
    is_active = models.BooleanField(default=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    membership_date = models.DateField(auto_now_add=True)

    # Attendance tracking fields
    last_attended = models.DateField(null=True, blank=True, help_text="Last attendance date")
    attendance_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, help_text="Overall attendance percentage"
    )
    consecutive_absences = models.PositiveIntegerField(
        default=0, help_text="Number of consecutive absences"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "members"
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def update_attendance_stats(self):
        """Recalculate attendance statistics"""
        from apps.attendance.models import Attendance

        records = Attendance.objects.filter(member=self)
        total = records.count()

        if total == 0:
            self.attendance_rate = 0
            self.consecutive_absences = 0
            return

        attended = records.filter(attended=True).count()
        self.attendance_rate = (attended / total) * 100

        # Calculate consecutive absences from most recent records
        recent = records.order_by("-sheet__date")[:10]
        consecutive = 0
        for record in recent:
            if not record.attended:
                consecutive += 1
            else:
                break
        self.consecutive_absences = consecutive

        # Update last attended
        last = records.filter(attended=True).order_by("-sheet__date").first()
        if last:
            self.last_attended = last.sheet.date

        self.save(update_fields=["attendance_rate", "consecutive_absences", "last_attended"])
