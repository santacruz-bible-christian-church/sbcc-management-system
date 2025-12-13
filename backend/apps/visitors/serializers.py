from rest_framework import serializers

from .models import Visitor, VisitorAttendance


class VisitorSerializer(serializers.ModelSerializer):
    """Serializer for Visitor model."""

    visit_count = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    follow_up_status_display = serializers.CharField(
        source="get_follow_up_status_display", read_only=True
    )
    converted_to_member_id = serializers.IntegerField(
        source="converted_to_member.id", read_only=True
    )

    class Meta:
        model = Visitor
        fields = [
            "id",
            "full_name",
            "phone",
            "email",
            "is_first_time",
            "status",
            "status_display",
            "follow_up_status",
            "follow_up_status_display",
            "converted_to_member",
            "converted_to_member_id",
            "notes",
            "visit_count",
            "date_added",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "converted_to_member",
            "date_added",
            "updated_at",
        ]


class VisitorAttendanceSerializer(serializers.ModelSerializer):
    """Serializer for VisitorAttendance model."""

    visitor_name = serializers.CharField(source="visitor.full_name", read_only=True)
    added_by_name = serializers.SerializerMethodField()

    class Meta:
        model = VisitorAttendance
        fields = [
            "id",
            "visitor",
            "visitor_name",
            "service_date",
            "checked_in_at",
            "added_by",
            "added_by_name",
        ]
        read_only_fields = ["id", "checked_in_at", "added_by"]

    def get_added_by_name(self, obj):
        if obj.added_by:
            return f"{obj.added_by.first_name} {obj.added_by.last_name}".strip()
        return None


class VisitorConvertSerializer(serializers.Serializer):
    """Serializer for converting visitor to member."""

    date_of_birth = serializers.DateField(required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
