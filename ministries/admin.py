from django.contrib import admin
from .models import Ministry, MinistryMember, Shift, Assignment

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
