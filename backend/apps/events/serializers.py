from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Event, EventAttendee

User = get_user_model()

class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    attendee_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'status',
            'date', 'end_date', 'location', 'organizer', 'organizer_name',
            'max_attendees', 'is_recurring', 'attendee_count', 'is_registered',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('organizer', 'created_at', 'updated_at')
    
    def get_attendee_count(self, obj):
        return obj.attendees.count()
    
    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(user=request.user).exists()
        return False

class EventAttendeeSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = EventAttendee
        fields = [
            'id', 'event', 'event_title', 'user', 'user_name',
            'registered_at', 'attended', 'notes'
        ]
        read_only_fields = ('registered_at',)

class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'event_type', 'status',
            'date', 'end_date', 'location', 'max_attendees', 'is_recurring'
        ]