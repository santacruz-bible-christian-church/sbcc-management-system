from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class SystemSettings(models.Model):
    """
    Singleton model for system-wide configuration.
    PRD: Settings / System Config
    """

    # Branding
    app_name = models.CharField(
        max_length=255,
        default="SBCC Management System",
        help_text="Application/Church name displayed throughout the system",
    )
    church_name = models.CharField(
        max_length=255,
        default="Santa Cruz Bible Christian Church",
        help_text="Full church name",
    )
    tagline = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="Church tagline or slogan",
    )

    # Logo and branding images
    logo = models.ImageField(
        upload_to="settings/logos/",
        blank=True,
        null=True,
        help_text="Church logo (recommended: 200x200px PNG)",
    )
    banner = models.ImageField(
        upload_to="settings/banners/",
        blank=True,
        null=True,
        help_text="Church banner for headers (recommended: 1200x300px)",
    )
    favicon = models.ImageField(
        upload_to="settings/favicons/",
        blank=True,
        null=True,
        help_text="Favicon for browser tab (recommended: 32x32px ICO/PNG)",
    )
    login_background = models.ImageField(
        upload_to="settings/backgrounds/",
        blank=True,
        null=True,
        help_text="Background image for login page",
    )

    # About page content
    mission = models.TextField(
        blank=True,
        default="",
        help_text="Church mission statement",
    )
    vision = models.TextField(
        blank=True,
        default="",
        help_text="Church vision statement",
    )
    history = models.TextField(
        blank=True,
        default="",
        help_text="Brief church history",
    )
    statement_of_faith = models.TextField(
        blank=True,
        default="",
        help_text="Church statement of faith / beliefs",
    )

    # Contact information
    address = models.TextField(
        blank=True,
        default="",
        help_text="Church physical address",
    )
    phone = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Primary contact number",
    )
    email = models.EmailField(
        blank=True,
        default="",
        help_text="Primary contact email",
    )

    # Social media links
    facebook_url = models.URLField(blank=True, default="")
    youtube_url = models.URLField(blank=True, default="")
    instagram_url = models.URLField(blank=True, default="")

    # Service schedule
    service_schedule = models.TextField(
        blank=True,
        default="",
        help_text="Church service schedule (e.g., Sunday 9:00 AM)",
    )

    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="settings_updates",
    )

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def __str__(self):
        return f"System Settings (Updated: {self.updated_at})"

    def save(self, *args, **kwargs):
        """Ensure only one instance exists (singleton pattern)."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance."""
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
