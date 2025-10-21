from django.db import models
from django.contrib.auth import get_user_model

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
