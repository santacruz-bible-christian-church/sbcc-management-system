from django.contrib import admin
from .models import Event, EventAttendee

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'status', 'date', 'location', 'organizer', 'attendee_count')
    list_filter = ('event_type', 'status', 'date', 'organizer')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    
    def attendee_count(self, obj):
        return obj.attendees.count()
    attendee_count.short_description = 'Attendees'

@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'registered_at', 'attended')
    list_filter = ('attended', 'registered_at', 'event__event_type')
    search_fields = ('user__username', 'event__title')
    date_hierarchy = 'registered_at'