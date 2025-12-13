import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Extended User model for system operators.
    Only management roles - no member/volunteer (they don't need dashboard access).
    """

    ROLE_CHOICES = [
        ("super_admin", "Super Admin"),
        ("admin", "Admin"),
        ("pastor", "Pastor"),
        ("ministry_leader", "Ministry Leader"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="admin")
    phone = models.CharField(max_length=15, blank=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_super_admin(self):
        return self.role == "super_admin" or self.is_superuser


class PasswordResetToken(models.Model):
    """Token for password reset requests"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_reset_tokens")
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    class Meta:
        db_table = "password_reset_tokens"

    def __str__(self):
        return f"Reset token for {self.user.email}"

    @classmethod
    def create_token(cls, user, expiry_hours=24):
        """Create a new password reset token for a user."""
        # Invalidate any existing tokens for this user
        cls.objects.filter(user=user, used=False).update(used=True)

        # Generate a secure token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=expiry_hours)

        return cls.objects.create(user=user, token=token, expires_at=expires_at)

    @property
    def is_valid(self):
        """Check if token is still valid."""
        return not self.used and timezone.now() < self.expires_at
