from django.contrib import admin
from .models import Ministry, Member, Event, Attendance

@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    list_display = ['name', 'leader', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'ministry', 'is_active', 'membership_date']
    list_filter = ['is_active', 'ministry', 'membership_date']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    date_hierarchy = 'membership_date'


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_datetime', 'location', 'ministry']
    list_filter = ['event_type', 'start_datetime', 'ministry']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'start_datetime'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'event', 'attended', 'check_in_time']
    list_filter = ['attended', 'check_in_time', 'event']
    search_fields = ['member__first_name', 'member__last_name', 'event__title']
    date_hierarchy = 'check_in_time'