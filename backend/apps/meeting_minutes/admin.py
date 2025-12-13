from django.contrib import admin

from .models import MeetingMinutes, MeetingMinutesAttachment, MeetingMinutesVersion


class MeetingMinutesAttachmentInline(admin.TabularInline):
    model = MeetingMinutesAttachment
    extra = 0
    readonly_fields = ["file_size", "file_type", "uploaded_at", "uploaded_by"]


class MeetingMinutesVersionInline(admin.TabularInline):
    model = MeetingMinutesVersion
    extra = 0
    readonly_fields = ["version_number", "content", "changed_by", "created_at"]
    can_delete = False


@admin.register(MeetingMinutes)
class MeetingMinutesAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "meeting_date",
        "category",
        "ministry",
        "created_by",
        "is_active",
        "created_at",
    ]
    list_filter = ["category", "ministry", "is_active", "created_at"]
    search_fields = ["title", "content", "attendees"]
    date_hierarchy = "meeting_date"
    readonly_fields = ["created_at", "updated_at", "created_by"]
    inlines = [MeetingMinutesAttachmentInline, MeetingMinutesVersionInline]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(MeetingMinutesAttachment)
class MeetingMinutesAttachmentAdmin(admin.ModelAdmin):
    list_display = [
        "file_name",
        "meeting_minutes",
        "file_type",
        "file_size",
        "uploaded_by",
        "uploaded_at",
    ]
    list_filter = ["file_type", "uploaded_at"]
    search_fields = ["file_name", "meeting_minutes__title", "extracted_text"]


@admin.register(MeetingMinutesVersion)
class MeetingMinutesVersionAdmin(admin.ModelAdmin):
    list_display = [
        "meeting_minutes",
        "version_number",
        "changed_by",
        "change_summary",
        "created_at",
    ]
    list_filter = ["created_at"]
    search_fields = ["meeting_minutes__title", "change_summary"]
