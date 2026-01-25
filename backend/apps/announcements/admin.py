from django.contrib import admin
from django.utils.html import format_html

from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "audience_display",
        "ministry",
        "publish_status",
        "sent",
        "publish_at",
        "created_at",
        "photo",
    ]
    list_filter = ["audience", "is_active", "sent", "ministry", "publish_at"]
    search_fields = ["title", "body"]
    readonly_fields = ["sent", "created_at", "updated_at", "created_by"]
    date_hierarchy = "publish_at"

    fieldsets = (
        ("Content", {"fields": ("title", "body", "photo")}),
        ("Targeting (Group-Specific)", {"fields": ("audience", "ministry")}),
        ("Scheduling", {"fields": ("publish_at", "expire_at", "is_active")}),
        (
            "Metadata",
            {
                "fields": ("sent", "created_by", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def audience_display(self, obj):
        if obj.audience == "ministry" and obj.ministry:
            return f"Ministry: {obj.ministry.name}"
        return obj.get_audience_display()

    audience_display.short_description = "Audience"

    def publish_status(self, obj):
        if obj.is_published():
            return format_html('<span style="color: green;">● Published</span>')
        return format_html('<span style="color: gray;">○ Scheduled</span>')

    publish_status.short_description = "Status"

    def save_model(self, request, obj, form, change):
        if not change:  # Only set creator on new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
