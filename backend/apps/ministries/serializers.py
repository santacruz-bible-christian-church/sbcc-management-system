from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.members.models import Member

from .models import Assignment, Ministry, MinistryMember, Shift

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Serializer for User (operators/management only)"""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class MemberSimpleSerializer(serializers.ModelSerializer):
    """Serializer for Member (church member records)"""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Member
        fields = ["id", "first_name", "last_name", "email", "phone", "full_name"]


class MinistryMemberSerializer(serializers.ModelSerializer):
    member = MemberSimpleSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), write_only=True, source="member"
    )
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)

    class Meta:
        model = MinistryMember
        fields = [
            "id",
            "member",
            "member_id",
            "ministry",
            "ministry_name",
            "role",
            "is_active",
            "max_consecutive_shifts",
            "available_days",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    # NOTE: Removed update/create overrides that synced Ministry.leader
    # Ministry.leader is a User (operator), not a Member
    # Leaders should be assigned directly via Ministry API/admin


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
            member = assignment.member
            return {
                "id": assignment.id,
                "member_id": member.pk,
                "member_name": member.full_name,
                "member_email": member.email or "",
                "attended": assignment.attended,
            }
        except Assignment.DoesNotExist:
            return None


class AssignmentSerializer(serializers.ModelSerializer):
    member = MemberSimpleSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), write_only=True, source="member"
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
            "member",
            "member_id",
            "assigned_at",
            "attended",
            "notes",
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
