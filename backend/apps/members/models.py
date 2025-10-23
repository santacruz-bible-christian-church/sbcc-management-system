from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


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
        'ministries.Ministry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    is_active = models.BooleanField(default=True)
    archived_at = models.DateTimeField(null=True, blank=True)
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