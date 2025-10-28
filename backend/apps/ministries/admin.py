from django.contrib import admin, messages
from django.core.management import call_command
from .models import Ministry, MinistryMember, Shift, Assignment
from .utils import rotate_and_assign

@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    list_display = ['name', 'leader', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']
    ordering = ['name']

@admin.register(MinistryMember)
class MinistryMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'ministry', 'role', 'is_active']
    list_filter = ['ministry', 'role', 'is_active']

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['ministry', 'role', 'date']
    list_filter = ['ministry', 'date']

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['shift', 'user', 'assigned_at', 'notified']
    search_fields = ['user__username']

def rotate_shifts_admin_action(modeladmin, request, queryset):

    if queryset.exists():
        ministry_ids = [m.pk for m in queryset]
    else:
        ministry_ids = None
    
        args = ['--days', '7']
    if ministry_ids:
        args += ['--ministry-ids'] + ministry_ids

    call_command('rotate_shifts', *args)  # ✅ now the import is used

    modeladmin.message_user(request, "Rotation command executed.", level=messages.INFO)