from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'event', 'attended', 'check_in_time']
    list_filter = ['attended', 'check_in_time', 'event']
    search_fields = ['member__first_name', 'member__last_name', 'event__title']
    date_hierarchy = 'check_in_time'
    ordering = ['-check_in_time']