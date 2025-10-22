from django.contrib import admin
from .models import Event, EventRegistration

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'status', 'date', 'location', 'ministry', 'organizer', 'attendee_count', 'attended_count')
    list_filter = ('event_type', 'status', 'ministry', 'date', 'organizer')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at', 'is_full', 'available_slots')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'event_type', 'status')
        }),
        ('Schedule', {
            'fields': ('date', 'end_date', 'location')
        }),
        ('Organization', {
            'fields': ('organizer', 'ministry')
        }),
        ('Settings', {
            'fields': ('max_attendees', 'is_recurring', 'is_full', 'available_slots')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def attendee_count(self, obj):
        return obj.registrations.count()
    attendee_count.short_description = 'Registered'
    
    def attended_count(self, obj):
        return obj.registrations.filter(attended=True).count()
    attended_count.short_description = 'Attended'


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('member', 'event', 'registered_at', 'attended', 'check_in_time')
    list_filter = ('attended', 'registered_at', 'event__event_type', 'event__ministry')
    search_fields = ('member__first_name', 'member__last_name', 'event__title')
    date_hierarchy = 'registered_at'
    readonly_fields = ('registered_at',)
    
    fieldsets = (
        ('Registration', {
            'fields': ('event', 'member', 'registered_at')
        }),
        ('Attendance', {
            'fields': ('attended', 'check_in_time')
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )