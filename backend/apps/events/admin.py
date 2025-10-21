from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_datetime', 'location', 'ministry']
    list_filter = ['event_type', 'start_datetime', 'ministry']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'start_datetime'
    ordering = ['-start_datetime']