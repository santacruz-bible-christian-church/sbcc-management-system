from django.contrib import admin

from .models import Assignment, Ministry, MinistryMember, Shift


@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    list_display = ["name", "leader", "created_at", "get_member_count"]
    search_fields = ["name", "description"]
    list_filter = ["created_at"]
    ordering = ["name"]

    def get_member_count(self, obj):
        return obj.ministry_members.filter(is_active=True).count()

    get_member_count.short_description = "Active Members"


@admin.register(MinistryMember)
class MinistryMemberAdmin(admin.ModelAdmin):
    list_display = ["user", "ministry", "role", "is_active", "created_at"]
    list_filter = ["ministry", "role", "is_active"]
    search_fields = ["user__first_name", "user__last_name", "user__email"]
    ordering = ["-created_at"]


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ["ministry", "role", "date", "start_time", "end_time", "is_assigned"]
    list_filter = ["ministry", "date", "role"]
    search_fields = ["ministry__name", "role"]
    ordering = ["date", "ministry__name"]

    def is_assigned(self, obj):
        return hasattr(obj, "assignment")

    is_assigned.boolean = True
    is_assigned.short_description = "Assigned"


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ["shift", "user", "assigned_at", "notified", "reminded"]
    list_filter = ["notified", "reminded", "assigned_at"]
    search_fields = ["user__username", "user__first_name", "user__last_name", "shift__role"]
    ordering = ["-assigned_at"]
