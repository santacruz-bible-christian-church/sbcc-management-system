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

    def update(self, instance, validated_data):
        """Override update to sync Ministry.leader"""
        old_role = instance.role
        new_role = validated_data.get("role", old_role)

        # Update the member
        instance = super().update(instance, validated_data)

        # If role changed to 'lead', update Ministry.leader
        if new_role == "lead" and instance.is_active:
            ministry = instance.ministry
            if ministry.leader != instance.user:
                ministry.leader = instance.user
                ministry.save(update_fields=["leader"])

        # If role changed from 'lead' to something else, remove leadership
        elif old_role == "lead" and new_role != "lead":
            ministry = instance.ministry
            if ministry.leader == instance.user:
                ministry.leader = None
                ministry.save(update_fields=["leader"])

        return instance

    def create(self, validated_data):
        """Override create to sync Ministry.leader"""
        instance = super().create(validated_data)

        # If new member is a leader, update Ministry.leader
        if instance.role == "lead" and instance.is_active:
            ministry = instance.ministry
            ministry.leader = instance.user
            ministry.save(update_fields=["leader"])

        return instance


class ShiftSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)
    assignment_info = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = [
            "id",
            "ministry",
            "ministry_name",
            "date",
            "start_time",
            "end_time",
            "notes",
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
                "user_email": user.email,
                "attended": assignment.attended,
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
            "attended",  # ← Changed from notified
            "notes",  # ← Add this
            # REMOVED: "reminded"  ← Remove this
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
