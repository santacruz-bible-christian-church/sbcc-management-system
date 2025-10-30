from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Assignment, Ministry, MinistryMember, Shift

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class MinistryMemberSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user"
    )
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)

    class Meta:
        model = MinistryMember
        fields = [
            "id",
            "user",
            "user_id",
            "ministry",
            "ministry_name",
            "role",
            "is_active",
            "max_consecutive_shifts",
            "available_days",
            "created_at",
        ]
        read_only_fields = ["created_at"]


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
        """Return assignment details if shift is assigned."""
        try:
            assignment = obj.assignment
            user = assignment.user
            return {
                "id": assignment.id,
                "user": getattr(user, "username", str(user)),
                "user_id": user.pk,
                "user_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "notified": assignment.notified,
                "reminded": assignment.reminded,
            }
        except Assignment.DoesNotExist:
            return None


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


class MinistrySerializer(serializers.ModelSerializer):
    """Serializer for Ministry with helpful read-only fields."""

    leader = UserSimpleSerializer(read_only=True)
    leader_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source="leader",
        required=False,
        allow_null=True,
    )
    member_count = serializers.SerializerMethodField()
    active_member_count = serializers.SerializerMethodField()
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
            "active_member_count",
            "upcoming_shifts",
        ]
        read_only_fields = [
            "created_at",
            "updated_at",
            "member_count",
            "active_member_count",
            "upcoming_shifts",
        ]

    def get_member_count(self, obj):
        """Total member count (including inactive)."""
        return obj.ministry_members.count()

    def get_active_member_count(self, obj):
        """Active member count only."""
        return obj.ministry_members.filter(is_active=True).count()

    def get_upcoming_shifts(self, obj):
        """Return next 5 upcoming unassigned shifts."""
        from django.utils import timezone

        qs = obj.shifts.filter(date__gte=timezone.now().date(), assignment__isnull=True).order_by(
            "date"
        )[:5]
        return ShiftSerializer(qs, many=True, context=self.context).data
