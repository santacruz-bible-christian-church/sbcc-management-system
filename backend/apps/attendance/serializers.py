from rest_framework import serializers
from .models import Attendance, AttendanceSheet


class AttendanceSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSheet
        fields = ['id', 'date', 'event_title', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    sheet_title = serializers.CharField(source='sheet.event_title', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'sheet', 'sheet_title', 'event', 'event_title', 
            'member', 'member_name', 'attended', 'check_in_time'
        ]
        read_only_fields = ['id', 'check_in_time']


class AttendanceSheetDetailSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True, read_only=True)
    
    class Meta:
        model = AttendanceSheet
        fields = ['id', 'date', 'event_title', 'created_at', 'updated_at', 'attendances']
        read_only_fields = ['id', 'created_at', 'updated_at']