from django.contrib import admin

from .models import SystemSettings


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    """Admin configuration for SystemSettings."""

    fieldsets = (
        (
            "Branding",
            {
                "fields": ("app_name", "church_name", "tagline"),
            },
        ),
        (
            "Images",
            {
                "fields": ("logo", "banner", "favicon", "login_background"),
            },
        ),
        (
            "About",
            {
                "fields": ("mission", "vision", "history", "statement_of_faith"),
            },
        ),
        (
            "Contact",
            {
                "fields": ("address", "phone", "email", "service_schedule"),
            },
        ),
        (
            "Social Media",
            {
                "fields": ("facebook_url", "youtube_url", "instagram_url"),
            },
        ),
        (
            "Metadata",
            {
                "fields": ("updated_at", "updated_by"),
                "classes": ("collapse",),
            },
        ),
    )

    readonly_fields = ("updated_at", "updated_by")

    def has_add_permission(self, request):
        """Prevent creating multiple instances."""
        return not SystemSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of settings."""
        return False

    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
