from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Ministry, Member, Event, Attendance

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role', 'is_staff']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Church Info', {'fields': ('role', 'phone')}),
    )

@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    list_display = ['name', 'leader', 'created_at']
    search_fields = ['name']

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'ministry', 'is_active']
    list_filter = ['is_active', 'ministry']
    search_fields = ['first_name', 'last_name', 'email']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_datetime', 'ministry']
    list_filter = ['event_type', 'ministry']
    search_fields = ['title']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'event', 'attended', 'check_in_time']
    list_filter = ['attended', 'event']