from django.contrib import admin

from .models import Attendance, AttendanceSheet


@admin.register(AttendanceSheet)
class AttendanceSheetAdmin(admin.ModelAdmin):
    list_display = [
        "event",
        "date",
        "total_attended",
        "total_expected",
        "attendance_rate",
        "created_at",
    ]
    list_filter = ["date", "event__event_type"]
    search_fields = ["event__title", "notes"]
    date_hierarchy = "date"
    ordering = ["-date"]
    readonly_fields = [
        "total_attended",
        "total_expected",
        "attendance_rate",
        "created_at",
        "updated_at",
    ]


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ["member", "sheet", "attended", "check_in_time", "created_at"]
    list_filter = ["attended", "sheet__date", "sheet__event__event_type"]
    search_fields = ["member__first_name", "member__last_name", "sheet__event__title"]
    date_hierarchy = "sheet__date"
    ordering = ["-sheet__date", "member__last_name"]
    readonly_fields = ["created_at", "updated_at"]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("member", "sheet__event")
