from django.db import models
from django.utils import timezone


class AttendanceSheet(models.Model):
    """Attendance Sheet for tracking attendance"""
    date = models.DateField(default=timezone.now)
    event_title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance_sheet'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.event_title} - {self.date}"


class Attendance(models.Model):
    """Attendance tracking"""
    sheet = models.ForeignKey(
        AttendanceSheet,
        on_delete=models.CASCADE,
        related_name='attendances',
        null=True,  # Allow null for existing records
        blank=True
    )
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    member = models.ForeignKey(
        'members.Member',
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    attended = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance'
        unique_together = ['sheet', 'event', 'member']
        ordering = ['-check_in_time']
    
    def __str__(self):
        return f"{self.member} - {self.sheet.event_title}"