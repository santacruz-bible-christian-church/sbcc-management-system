from rest_framework import serializers

from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)

    class Meta:
        model = Member
        fields = [
            "id",
            "user",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "gender",
            "date_of_birth",
            "baptism_date",
            "ministry",
            "ministry_name",
            "is_active",
            "membership_date",
            "status",
            "archived_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "full_name",
            "membership_date",
            "created_at",
            "updated_at",
            "archived_at",
        ]
