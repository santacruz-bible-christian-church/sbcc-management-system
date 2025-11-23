from django.contrib import admin
from .models import Role, Volunteer, Event, Assignment, Availability, Rotation, RotationMember

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)

@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "is_active")
    search_fields = ("first_name", "last_name", "email", "phone")
    list_filter = ("is_active", "roles")

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start", "end", "location", "capacity")
    search_fields = ("title", "location")
    list_filter = ("start",)

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("volunteer", "event", "status", "assigned_at")
    search_fields = ("volunteer__first_name", "volunteer__last_name", "event__title")
    list_filter = ("status",)

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("volunteer", "date", "start_time", "end_time")
    search_fields = ("volunteer__first_name", "volunteer__last_name")

@admin.register(Rotation)
class RotationAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "created_at")
    search_fields = ("name", "role__name")
    filter_horizontal = ("required_roles",) if hasattr(Rotation, "required_roles") else ()

@admin.register(RotationMember)
class RotationMemberAdmin(admin.ModelAdmin):
    list_display = ("rotation", "volunteer", "last_assigned", "priority")
    search_fields = ("rotation__name", "volunteer__first_name", "volunteer__last_name", "volunteer__email")
    list_filter = ("rotation",)
