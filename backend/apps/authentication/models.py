from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended User model with church roles"""

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("pastor", "Pastor"),
        ("ministry_leader", "Ministry Leader"),
        ("volunteer", "Volunteer"),
        ("member", "Member"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    phone = models.CharField(max_length=15, blank=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.username} ({self.role})"
