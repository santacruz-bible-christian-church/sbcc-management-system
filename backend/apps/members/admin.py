from django.contrib import admin
from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'phone', 'ministry', 'is_active', 'membership_date']
    list_filter = ['is_active', 'ministry', 'membership_date', 'status']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    date_hierarchy = 'membership_date'
    ordering = ['last_name', 'first_name']