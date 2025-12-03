from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PrayerRequest, PrayerRequestFollowUp

User = get_user_model()


class PrayerRequestFollowUpSerializer(serializers.ModelSerializer):
    """Serializer for prayer request follow-ups"""
    created_by_name = serializers.SerializerMethodField()
    action_type_display = serializers.CharField(
        source="get_action_type_display",
        read_only=True
    )

    class Meta:
        model = PrayerRequestFollowUp
        fields = [
            "id",
            "prayer_request",
            "action_type",
            "action_type_display",
            "notes",
            "is_private",
            "created_by",
            "created_by_name",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return "Unknown"


class PrayerRequestSerializer(serializers.ModelSerializer):
    """Serializer for prayer requests"""
    requester_name_display = serializers.CharField(
        source="requester_display_name",
        read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )
    priority_display = serializers.CharField(
        source="get_priority_display",
        read_only=True
    )
    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True
    )
    assigned_to_name = serializers.SerializerMethodField()
    follow_up_count = serializers.SerializerMethodField()

    class Meta:
        model = PrayerRequest
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_display",
            "is_anonymous",
            "is_private",
            "is_public",
            "requester",
            "requester_name",
            "requester_name_display",
            "requester_email",
            "requester_phone",
            "status",
            "status_display",
            "priority",
            "priority_display",
            "assigned_to",
            "assigned_to_name",
            "assigned_at",
            "assigned_by",
            "submitted_at",
            "updated_at",
            "completed_at",
            "follow_up_count",
        ]
        read_only_fields = [
            "id",
            "submitted_at",
            "updated_at",
            "assigned_at",
            "assigned_by",
            "completed_at",
        ]

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}"
        return None

    def get_follow_up_count(self, obj):
        return obj.follow_ups.count()


class PrayerRequestDetailSerializer(PrayerRequestSerializer):
    """Detailed serializer including follow-ups"""
    follow_ups = PrayerRequestFollowUpSerializer(many=True, read_only=True)

    class Meta(PrayerRequestSerializer.Meta):
        fields = PrayerRequestSerializer.Meta.fields + ["follow_ups"]


class PrayerRequestAssignSerializer(serializers.Serializer):
    """Serializer for assigning prayer requests"""
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=["pastor", "admin"])
    )

    def validate_assigned_to(self, value):
        if value.role not in ["pastor", "admin"]:
            raise serializers.ValidationError(
                "Can only assign to pastors or admins"
            )
        return value


class PrayerRequestSubmitSerializer(serializers.ModelSerializer):
    """Serializer for public/anonymous prayer request submission"""

    class Meta:
        model = PrayerRequest
        fields = [
            "title",
            "description",
            "category",
            "is_anonymous",
            "is_private",
            "is_public",
            "requester",
            "requester_name",
            "requester_email",
            "requester_phone",
        ]

    def validate(self, data):
        # If no member requester, name is required (unless anonymous)
        if not data.get("requester") and not data.get("is_anonymous"):
            if not data.get("requester_name"):
                raise serializers.ValidationError(
                    {"requester_name": "Name is required for non-member submissions"}
                )
        return data
