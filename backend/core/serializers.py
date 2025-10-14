from rest_framework import serializers
from .models import User, Ministry, Member, Event, Attendance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        read_only_fields = ['id']

class MinistrySerializer(serializers.ModelSerializer):
    leader_name = serializers.CharField(source='leader.username', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Ministry
        fields = ['id', 'name', 'description', 'leader', 'leader_name', 'member_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_member_count(self, obj):
        return obj.members.count()

class MemberSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source='ministry.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Member
        fields = [
            'id', 'user', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'date_of_birth', 'baptism_date',
            'ministry', 'ministry_name', 'is_active', 'membership_date'
        ]
        read_only_fields = ['id', 'full_name', 'membership_date']

class EventSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source='ministry.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type',
            'start_datetime', 'end_datetime', 'location',
            'ministry', 'ministry_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'event', 'event_title', 'member', 'member_name', 'attended', 'check_in_time']
        read_only_fields = ['id', 'check_in_time']