from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from apps.ministries.models import Ministry

from .models import Task, TaskAttachment, TaskComment

User = get_user_model()


class TaskCommentSerializer(serializers.ModelSerializer):
    """Serializer for task comments"""

    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = TaskComment
        fields = [
            "id",
            "task",
            "user",
            "user_name",
            "user_username",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class TaskAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for task attachments"""

    uploaded_by_name = serializers.CharField(source="uploaded_by.get_full_name", read_only=True)

    class Meta:
        model = TaskAttachment
        fields = [
            "id",
            "task",
            "uploaded_by",
            "uploaded_by_name",
            "file",
            "file_name",
            "file_size",
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_by", "uploaded_at"]


class TaskSerializer(serializers.ModelSerializer):
    """Main serializer for Task model"""

    # Read-only computed fields
    is_overdue = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    timeline_progress_percentage = serializers.IntegerField(read_only=True)

    # Related fields
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name", read_only=True, allow_null=True
    )
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    completed_by_name = serializers.CharField(
        source="completed_by.get_full_name", read_only=True, allow_null=True
    )

    # Nested serializers for detail view
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "priority",
            "status",
            "start_date",
            "end_date",
            "progress_percentage",
            "created_by",
            "created_by_name",
            "assigned_to",
            "assigned_to_name",
            "ministry",
            "ministry_name",
            "completed_at",
            "completed_by",
            "completed_by_name",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
            # Computed fields
            "is_overdue",
            "days_remaining",
            "duration_days",
            "timeline_progress_percentage",
            # Nested
            "comments",
            "attachments",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "completed_at",
            "completed_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        """Validate timeline dates"""
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError({"end_date": "End date must be after start date"})

        progress = data.get("progress_percentage", 0)
        if progress < 0 or progress > 100:
            raise serializers.ValidationError(
                {"progress_percentage": "Progress must be between 0 and 100"}
            )

        return data

    def create(self, validated_data):
        """Set created_by to current user"""
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for task lists"""

    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name", read_only=True, allow_null=True
    )
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "priority",
            "status",
            "start_date",
            "end_date",
            "progress_percentage",
            "created_by_name",
            "assigned_to",
            "assigned_to_name",
            "ministry",
            "ministry_name",
            "is_overdue",
            "days_remaining",
            "created_at",
        ]


class TaskDashboardSerializer(serializers.ModelSerializer):
    """Minimal serializer for dashboard widgets"""

    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name", read_only=True, allow_null=True
    )
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "priority",
            "status",
            "end_date",
            "progress_percentage",
            "assigned_to_name",
            "ministry_name",
            "days_remaining",
        ]
