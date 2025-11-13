from django.db import models
from django.utils import timezone


class AttendanceSheet(models.Model):
    """
    Attendance tracking for REGULAR worship services and ministry meetings

    Examples: Sunday Service, Bible Study, Prayer Meeting, Ministry Gatherings
    NOT for special one-time events (use Event model for those)

    This tracks recurring services where member participation is measured
    for engagement statistics and alerts.
    """

    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        related_name="attendance_sheets",
        help_text="Link to the event type (e.g., 'Sunday Service')",
    )
    date = models.DateField(default=timezone.now)
    notes = models.TextField(blank=True, help_text="Additional notes about this session")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "attendance_sheet"
        ordering = ["-date", "-created_at"]
        unique_together = ["event", "date"]

    def __str__(self):
        return f"{self.event.title} - {self.date}"

    @property
    def total_attended(self):
        """Count of members who attended"""
        return self.attendance_records.filter(attended=True).count()

    @property
    def total_expected(self):
        """Total attendance records"""
        return self.attendance_records.count()

    @property
    def attendance_rate(self):
        """Percentage attendance rate"""
        if self.total_expected == 0:
            return 0
        return (self.total_attended / self.total_expected) * 100


class Attendance(models.Model):
    """Individual attendance record"""

    sheet = models.ForeignKey(
        AttendanceSheet, on_delete=models.CASCADE, related_name="attendance_records"
    )
    member = models.ForeignKey(
        "members.Member", on_delete=models.CASCADE, related_name="attendance_records"
    )
    attended = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Notes about this attendance record")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "attendance"
        unique_together = ["sheet", "member"]
        ordering = ["-sheet__date", "member__last_name", "member__first_name"]

    def __str__(self):
        status = "Present" if self.attended else "Absent"
        return f"{self.member.full_name} - {self.sheet} ({status})"

    def mark_present(self):
        """Mark member as present"""
        self.attended = True
        self.check_in_time = timezone.now()
        self.save()
