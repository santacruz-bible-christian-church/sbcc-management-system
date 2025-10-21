from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Event(models.Model):
    """Church events and services"""
    EVENT_TYPES = [
        ('service', 'Church Service'),
        ('fellowship', 'Fellowship'),
        ('conference', 'Conference'),
        ('outreach', 'Outreach'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    location = models.CharField(max_length=200)
    ministry = models.ForeignKey(
        'ministries.Ministry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='events'
    )
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'events'
        ordering = ['-start_datetime']
    
    def __str__(self):
        return self.title