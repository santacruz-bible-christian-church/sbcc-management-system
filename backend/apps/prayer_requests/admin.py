from django.contrib import admin

from .models import PrayerRequest, PrayerRequestFollowUp


class PrayerRequestFollowUpInline(admin.TabularInline):
    model = PrayerRequestFollowUp
    extra = 0
    readonly_fields = ["created_at", "created_by"]


@admin.register(PrayerRequest)
class PrayerRequestAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "category",
        "status",
        "priority",
        "requester_display_name",
        "assigned_to",
        "submitted_at",
    ]
    list_filter = ["status", "priority", "category", "is_public", "is_private"]
    search_fields = ["title", "description", "requester_name"]
    readonly_fields = ["submitted_at", "updated_at", "assigned_at", "completed_at"]
    inlines = [PrayerRequestFollowUpInline]

    fieldsets = (
        ("Request Details", {"fields": ("title", "description", "category")}),
        ("Privacy Settings", {"fields": ("is_anonymous", "is_private", "is_public")}),
        (
            "Requester Info",
            {"fields": ("requester", "requester_name", "requester_email", "requester_phone")},
        ),
        (
            "Assignment & Status",
            {"fields": ("status", "priority", "assigned_to", "assigned_at", "assigned_by")},
        ),
        (
            "Timestamps",
            {"fields": ("submitted_at", "updated_at", "completed_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(PrayerRequestFollowUp)
class PrayerRequestFollowUpAdmin(admin.ModelAdmin):
    list_display = ["prayer_request", "action_type", "created_by", "created_at"]
    list_filter = ["action_type", "is_private"]
    search_fields = ["notes", "prayer_request__title"]
    readonly_fields = ["created_at"]
