from django.contrib import admin
from django.utils.html import format_html

from .models import Task, TaskAttachment, TaskComment


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """Admin interface for Task model"""

    list_display = [
        "title",
        "status_badge",
        "priority_badge",
        "assigned_to",
        "ministry",
        "timeline_display",
        "progress_bar",
        "is_overdue",
    ]
    list_filter = ["status", "priority", "ministry", "created_at", "start_date"]
    search_fields = ["title", "description", "notes"]
    readonly_fields = [
        "created_by",
        "created_at",
        "updated_at",
        "completed_at",
        "completed_by",
        "is_overdue",
        "days_remaining",
    ]
    autocomplete_fields = ["created_by", "assigned_to", "completed_by", "ministry"]
    date_hierarchy = "start_date"

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": ("title", "description", "priority", "status"),
            },
        ),
        (
            "Timeline",
            {
                "fields": ("start_date", "end_date", "progress_percentage"),
            },
        ),
        (
            "Assignment",
            {
                "fields": ("assigned_to", "ministry"),
            },
        ),
        (
            "Completion",
            {
                "fields": ("completed_at", "completed_by"),
            },
        ),
        (
            "Additional Info",
            {
                "fields": ("notes", "is_active"),
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "created_by",
                    "created_at",
                    "updated_at",
                    "is_overdue",
                    "days_remaining",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    def status_badge(self, obj):
        """Display status with color coding"""
        colors = {
            "pending": "gray",
            "in_progress": "blue",
            "completed": "green",
            "cancelled": "red",
            "overdue": "orange",
        }
        color = colors.get(obj.status, "gray")
        return format_html(
            '<span style="padding: 3px 10px; background-color: {}; color: white; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"

    def priority_badge(self, obj):
        """Display priority with color coding"""
        colors = {
            "low": "#90EE90",
            "medium": "#FFD700",
            "high": "#FFA500",
            "urgent": "#FF4500",
        }
        color = colors.get(obj.priority, "gray")
        return format_html(
            '<span style="padding: 3px 10px; background-color: {}; color: white; border-radius: 3px;">{}</span>',
            color,
            obj.get_priority_display(),
        )

    priority_badge.short_description = "Priority"

    def timeline_display(self, obj):
        """Display timeline range"""
        return format_html(
            "{}<br/><small>to {}</small>",
            obj.start_date.strftime("%b %d, %Y"),
            obj.end_date.strftime("%b %d, %Y"),
        )

    timeline_display.short_description = "Timeline"

    def progress_bar(self, obj):
        """Display progress as a visual bar"""
        color = "green" if obj.progress_percentage == 100 else "blue"
        return format_html(
            '<div style="width: 100px; background-color: #f0f0f0; border-radius: 3px;">'
            '<div style="width: {}%; background-color: {}; height: 20px; border-radius: 3px; text-align: center; color: white; font-size: 11px; line-height: 20px;">'
            "{}%"
            "</div></div>",
            obj.progress_percentage,
            color,
            obj.progress_percentage,
        )

    progress_bar.short_description = "Progress"


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    """Admin interface for TaskComment model"""

    list_display = ["task", "user", "comment_preview", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["comment", "task__title", "user__username"]
    readonly_fields = ["created_at", "updated_at"]
    autocomplete_fields = ["task", "user"]

    def comment_preview(self, obj):
        """Show first 50 characters of comment"""
        return obj.comment[:50] + "..." if len(obj.comment) > 50 else obj.comment

    comment_preview.short_description = "Comment"


@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    """Admin interface for TaskAttachment model"""

    list_display = ["file_name", "task", "uploaded_by", "file_size_display", "uploaded_at"]
    list_filter = ["uploaded_at"]
    search_fields = ["file_name", "task__title", "uploaded_by__username"]
    readonly_fields = ["uploaded_at", "file_size"]
    autocomplete_fields = ["task", "uploaded_by"]

    def file_size_display(self, obj):
        """Display file size in human-readable format"""
        size = obj.file_size
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    file_size_display.short_description = "File Size"
