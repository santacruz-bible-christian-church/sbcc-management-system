from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ministry, MinistryMember, Shift, Assignment

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]

class MinistryMemberSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user"
    )

    class Meta:
        model = MinistryMember
        fields = [
            "id",
            "user",
            "user_id",
            "ministry",
            "role",
            "is_active",
            "max_consecutive_shifts",
            "available_days",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class ShiftAssignmentInfoSerializer(serializers.Serializer):
    user = serializers.CharField()
    user_id = serializers.IntegerField()
    notified = serializers.BooleanField()


class ShiftSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)
    assignment_info = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = [
            "id",
            "ministry",
            "ministry_name",
            "role",
            "date",
            "start_time",
            "end_time",
            "created_at",
            "assignment_info",
        ]
        read_only_fields = ["created_at", "assignment_info"]

    def get_assignment_info(self, obj):
        # If a related Assignment exists, return a small dict; otherwise None.
        assignment = getattr(obj, "assignment", None)
        if not assignment:
            return None
        user = assignment.user
        return {
            "user": getattr(user, "username", str(user)),
            "user_id": user.pk,
            "notified": bool(assignment.notified),
        }


class AssignmentSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user"
    )
    shift = ShiftSerializer(read_only=True)
    shift_id = serializers.PrimaryKeyRelatedField(
        queryset=Shift.objects.all(), write_only=True, source="shift"
    )

    class Meta:
        model = Assignment
        fields = [
            "id",
            "shift",
            "shift_id",
            "user",
            "user_id",
            "assigned_at",
            "notified",
            "reminded",
        ]
        read_only_fields = ["assigned_at"]

    def create(self, validated_data):
        return super().create(validated_data)


class MinistrySerializer(serializers.ModelSerializer):
    """Serializer for Ministry with a few helpful read-only fields."""
    leader = UserSimpleSerializer(read_only=True)
    leader_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="leader", required=False, allow_null=True
    )
    member_count = serializers.SerializerMethodField()
    upcoming_shifts = serializers.SerializerMethodField()

    class Meta:
        model = Ministry
        fields = [
            "id",
            "name",
            "description",
            "leader",
            "leader_id",
            "created_at",
            "updated_at",
            "member_count",
            "upcoming_shifts",
        ]
        read_only_fields = ["created_at", "updated_at", "member_count", "upcoming_shifts"]

    def get_member_count(self, obj):
        try:
            return obj.ministry_members.count()
        except Exception:
            return obj.ministrymember_set.count()

    def get_upcoming_shifts(self, obj):
        qs = obj.shifts.order_by("date")[:5]
        return ShiftSerializer(qs, many=True, context=self.context).data