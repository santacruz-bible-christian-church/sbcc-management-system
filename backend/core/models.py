from django.db import models
from django.contrib.auth import get_user_model

# Get User model dynamically (Django best practice)
User = get_user_model()


class Ministry(models.Model):
    """Church ministries/departments"""
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


class Member(models.Model):
    """Church member profiles"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField()
    baptism_date = models.DateField(null=True, blank=True)
    ministry = models.ForeignKey(
        Ministry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    is_active = models.BooleanField(default=True)
    membership_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'members'
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


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
        Ministry,
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


class Attendance(models.Model):
    """Attendance tracking"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='attendances')
    attended = models.BooleanField(default=True)
    check_in_time = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance'
        unique_together = ['event', 'member']
        ordering = ['-check_in_time']
    
    def __str__(self):
        return f"{self.member} - {self.event.title}"