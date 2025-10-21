from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'event', 'event_title', 'member', 'member_name', 'attended', 'check_in_time']
        read_only_fields = ['id', 'check_in_time']