from django.contrib import admin
from apps.visitors.models import Visitor, VisitorAttendance


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "phone",
        "email",
        "status",
        "follow_up_status",
        "is_first_time",
        "date_added",
    )
    search_fields = ("full_name", "phone", "email")
    list_filter = ("status", "follow_up_status", "is_first_time")


@admin.register(VisitorAttendance)
class VisitorAttendanceAdmin(admin.ModelAdmin):
    list_display = ("visitor", "service_date", "checked_in_at", "added_by")
    list_filter = ("service_date",)
    search_fields = ("visitor__full_name", "visitor__phone")