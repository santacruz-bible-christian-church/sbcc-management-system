from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source='ministry.name', read_only=True, allow_null=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type',
            'start_datetime', 'end_datetime', 'location',
            'ministry', 'ministry_name', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']