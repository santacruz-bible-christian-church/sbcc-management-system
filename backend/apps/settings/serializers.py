from rest_framework import serializers

from .models import SystemSettings, TeamMember


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Full serializer for admin updates."""

    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SystemSettings
        fields = [
            "id",
            "app_name",
            "church_name",
            "tagline",
            "logo",
            "login_background",
            "mission",
            "vision",
            "history",
            "statement_of_faith",
            "address",
            "phone",
            "email",
            "facebook_url",
            "youtube_url",
            "instagram_url",
            "service_schedule",
            "updated_at",
            "updated_by",
            "updated_by_name",
        ]
        read_only_fields = ["id", "updated_at", "updated_by"]

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return (
                f"{obj.updated_by.first_name} {obj.updated_by.last_name}".strip()
                or obj.updated_by.username
            )
        return None


class PublicSettingsSerializer(serializers.ModelSerializer):
    """Public serializer for unauthenticated access (branding/about info only)."""

    class Meta:
        model = SystemSettings
        fields = [
            "app_name",
            "church_name",
            "tagline",
            "logo",
            "login_background",
            "mission",
            "vision",
            "history",
            "statement_of_faith",
            "address",
            "phone",
            "email",
            "facebook_url",
            "youtube_url",
            "instagram_url",
            "service_schedule",
        ]


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer for team members."""

    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "name",
            "role",
            "role_display",
            "title",
            "bio",
            "photo",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PublicTeamMemberSerializer(serializers.ModelSerializer):
    """Public serializer for team members (limited fields)."""

    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "name",
            "role",
            "role_display",
            "title",
            "bio",
            "photo",
        ]
