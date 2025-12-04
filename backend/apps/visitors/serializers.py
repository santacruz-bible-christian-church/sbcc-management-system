from rest_framework import serializers
from apps.visitors.models import Visitor, VisitorAttendance


class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = "__all__"


class VisitorAttendanceSerializer(serializers.ModelSerializer):
    visitor = VisitorSerializer(read_only=True)
    visitor_id = serializers.PrimaryKeyRelatedField(
        queryset=Visitor.objects.all(),
        write_only=True,
        source="visitor"
    )

    class Meta:
        model = VisitorAttendance
        fields = [
            "id",
            "visitor",
            "visitor_id",
            "service_date",
            "checked_in_at",
            "added_by",
        ]
        read_only_fields = ["checked_in_at", "added_by"]