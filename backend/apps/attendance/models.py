from django.db import models


class Attendance(models.Model):
    """Attendance tracking"""
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
    attended = models.BooleanField(default=True)
    check_in_time = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance'
        unique_together = ['event', 'member']
        ordering = ['-check_in_time']
    
    def __str__(self):
        return f"{self.member} - {self.event.title}"