from django.contrib import admin

from .models import Assignment, Ministry, MinistryMember, Shift


@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    list_display = ["name", "leader", "is_active", "created_at", "get_member_count"]
    search_fields = ["name", "description"]
    list_filter = ["is_active", "created_at"]
    ordering = ["name"]

    def get_member_count(self, obj):
        return obj.ministry_members.filter(is_active=True).count()

    get_member_count.short_description = "Active Members"


@admin.register(MinistryMember)
class MinistryMemberAdmin(admin.ModelAdmin):
    list_display = ["member", "ministry", "role", "is_active", "created_at"]
    list_filter = ["ministry", "role", "is_active"]
    search_fields = ["member__first_name", "member__last_name", "member__email"]
    ordering = ["-created_at"]


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ["ministry", "date", "start_time", "end_time", "is_assigned", "created_at"]
    list_filter = ["ministry", "date"]
    search_fields = ["ministry__name", "notes"]
    ordering = ["date", "start_time"]

    def is_assigned(self, obj):
        return hasattr(obj, "assignment")

    is_assigned.boolean = True
    is_assigned.short_description = "Assigned"


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ["shift", "member", "assigned_at", "attended"]
    list_filter = ["attended", "assigned_at", "shift__ministry"]
    search_fields = [
        "member__first_name",
        "member__last_name",
        "member__email",
        "shift__ministry__name",
    ]
    ordering = ["-assigned_at"]

    def get_queryset(self, request):
        """Optimize queries by selecting related objects."""
        qs = super().get_queryset(request)
        return qs.select_related("shift__ministry", "member")
