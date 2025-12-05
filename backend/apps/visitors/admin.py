from django.contrib import admin

from .models import Visitor, VisitorAttendance


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "phone",
        "email",
        "status",
        "follow_up_status",
        "is_first_time",
        "visit_count",
        "date_added",
    ]
    list_filter = ["status", "follow_up_status", "is_first_time"]
    search_fields = ["full_name", "phone", "email"]
    readonly_fields = ["date_added", "updated_at", "converted_to_member"]

    fieldsets = (
        ("Contact Info", {"fields": ("full_name", "phone", "email")}),
        (
            "Status & Follow-up",
            {"fields": ("status", "follow_up_status", "is_first_time")},
        ),
        ("Conversion", {"fields": ("converted_to_member",)}),
        ("Notes", {"fields": ("notes",)}),
        (
            "Timestamps",
            {"fields": ("date_added", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def visit_count(self, obj):
        return obj.visit_count

    visit_count.short_description = "Visits"


@admin.register(VisitorAttendance)
class VisitorAttendanceAdmin(admin.ModelAdmin):
    list_display = ["visitor", "service_date", "checked_in_at", "added_by"]
    list_filter = ["service_date"]
    search_fields = ["visitor__full_name", "visitor__phone"]
    readonly_fields = ["checked_in_at"]
