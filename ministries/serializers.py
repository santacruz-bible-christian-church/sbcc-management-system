# apps/ministries/serializers.py
from rest_framework import serializers
from .models import Ministry, MinistryMember, Shift, Assignment
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class MinistrySerializer(serializers.ModelSerializer):
    leader_name = serializers.CharField(source='leader.username', read_only=True, allow_null=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Ministry
        fields = ['id', 'name', 'description', 'leader', 'leader_name', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.count()

class MinistryMemberSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=User.objects.all(), source='user')
    ministry = serializers.PrimaryKeyRelatedField(queryset=Ministry.objects.all())

    class Meta:
        model = MinistryMember
        fields = ['id', 'user', 'user_id', 'ministry', 'role', 'is_active', 'max_consecutive_shifts', 'available_days']

class ShiftSerializer(serializers.ModelSerializer):
    ministry = MinistrySerializer(read_only=True)
    ministry_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Ministry.objects.all(), source='ministry')
    assignment = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = ['id', 'ministry', 'ministry_id', 'role', 'date', 'start_time', 'end_time', 'assignment']

    def get_assignment(self, obj):
        if hasattr(obj, 'assignment'):
            return {'user': obj.assignment.user.username, 'user_id': obj.assignment.user.id, 'notified': obj.assignment.notified}
        return None

class AssignmentSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=User.objects.all(), source='user')
    shift = ShiftSerializer(read_only=True)
    shift_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Shift.objects.all(), source='shift')

    class Meta:
        model = Assignment
        fields = ['id', 'shift', 'shift_id', 'user', 'user_id', 'assigned_at', 'notified', 'reminded']
        read_only_fields = ['assigned_at']
