from django.conf import settings
from rest_framework import serializers

from .models import MeetingMinutes, MeetingMinutesAttachment, MeetingMinutesVersion


class MeetingMinutesVersionSerializer(serializers.ModelSerializer):
    """Serializer for version history."""

    changed_by_name = serializers.CharField(source="changed_by.get_full_name", read_only=True)

    class Meta:
        model = MeetingMinutesVersion
        fields = [
            "id",
            "version_number",
            "content",
            "changed_by",
            "changed_by_name",
            "change_summary",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class MeetingMinutesAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for meeting attachments."""

    uploaded_by_name = serializers.CharField(source="uploaded_by.get_full_name", read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.ReadOnlyField()

    class Meta:
        model = MeetingMinutesAttachment
        fields = [
            "id",
            "meeting_minutes",
            "file",
            "file_url",
            "file_name",
            "file_size",
            "file_size_mb",
            "file_type",
            "extracted_text",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
        ]
        read_only_fields = [
            "id",
            "uploaded_by",
            "uploaded_at",
            "file_name",
            "file_size",
            "file_type",
        ]

    def get_file_url(self, obj):
        """Return public URL for file."""
        if not obj.file:
            return None

        # If R2 storage is enabled, obj.file.url already returns full R2 URL
        if getattr(settings, "USE_R2_STORAGE", False):
            return obj.file.url

        # For local storage, build absolute URI
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def create(self, validated_data):
        """Extract file metadata on upload."""
        file_obj = validated_data.get("file")
        if file_obj:
            validated_data["file_name"] = file_obj.name
            validated_data["file_size"] = file_obj.size
            # Get file extension
            file_type = file_obj.name.split(".")[-1] if "." in file_obj.name else ""
            validated_data["file_type"] = file_type
        return super().create(validated_data)


class MeetingMinutesSerializer(serializers.ModelSerializer):
    """Main serializer for Meeting Minutes."""

    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    # Nested serializers for detail view
    attachments = MeetingMinutesAttachmentSerializer(many=True, read_only=True)
    versions = MeetingMinutesVersionSerializer(many=True, read_only=True)

    class Meta:
        model = MeetingMinutes
        fields = [
            "id",
            "title",
            "meeting_date",
            "category",
            "category_display",
            "content",
            "attendees",
            "ministry",
            "ministry_name",
            "created_by",
            "created_by_name",
            "is_active",
            "created_at",
            "updated_at",
            # Nested
            "attachments",
            "versions",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class MeetingMinutesListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""

    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    attachment_count = serializers.SerializerMethodField()

    class Meta:
        model = MeetingMinutes
        fields = [
            "id",
            "title",
            "meeting_date",
            "category",
            "category_display",
            "ministry",
            "ministry_name",
            "created_by_name",
            "attachment_count",
            "created_at",
        ]

    def get_attachment_count(self, obj):
        return obj.attachments.count()
