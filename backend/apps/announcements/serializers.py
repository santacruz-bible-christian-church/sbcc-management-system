from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)
    created_by_name = serializers.SerializerMethodField()
    is_published = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    photo_upload = serializers.ImageField(
        write_only=True, required=False, allow_null=True, source="photo"
    )

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "body",
            "photo",
            "photo_upload",
            "audience",
            "ministry",
            "ministry_name",
            "publish_at",
            "expire_at",
            "is_active",
            "sent",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
            "is_published",
        ]
        read_only_fields = ["id", "created_by", "sent", "created_at", "updated_at"]

    def get_photo(self, obj):
        """Return photo URL or None (not empty string)."""
        if obj.photo:
            return obj.photo.url
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return (
                f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
                or obj.created_by.username
            )
        return None

    def get_is_published(self, obj):
        return obj.is_published()

    def validate_photo_upload(self, value):
        """Validate photo file extension and size."""
        from django.conf import settings

        if not value:
            return value

        # Extension validation
        allowed_extensions = ["jpg", "jpeg", "png", "webp", "gif"]
        ext = value.name.split(".")[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported format. Use: {', '.join(allowed_extensions)}"
            )

        # Size validation
        max_size = getattr(settings, "FILE_UPLOAD_MAX_MEMORY_SIZE", None)
        if max_size and hasattr(value, "size") and value.size > max_size:
            max_mb = max_size / (1024 * 1024)
            raise serializers.ValidationError(f"Photo must be {max_mb:.0f}MB or smaller.")

        return value

    def validate(self, data):
        # Get existing values for partial updates
        audience = data.get("audience", getattr(self.instance, "audience", None))
        ministry = data.get("ministry", getattr(self.instance, "ministry", None))

        # Validate ministry is required if audience is ministry-specific
        if audience == Announcement.AUDIENCE_MINISTRY and not ministry:
            raise serializers.ValidationError(
                {"ministry": "Ministry is required when audience is 'ministry'."}
            )

        # Validate expire_at is after publish_at
        publish_at = data.get("publish_at", getattr(self.instance, "publish_at", None))
        expire_at = data.get("expire_at", getattr(self.instance, "expire_at", None))

        if expire_at and publish_at:
            if expire_at <= publish_at:
                raise serializers.ValidationError(
                    {"expire_at": "Expiry date must be after publish date."}
                )

        return data
