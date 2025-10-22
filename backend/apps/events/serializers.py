from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Event, EventRegistration

User = get_user_model()

class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    ministry_name = serializers.CharField(source='ministry.name', read_only=True, allow_null=True)
    attendee_count = serializers.SerializerMethodField()
    attended_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    is_full = serializers.BooleanField(read_only=True)
    available_slots = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'status',
            'date', 'end_date', 'location', 
            'organizer', 'organizer_name',
            'ministry', 'ministry_name',
            'max_attendees', 'is_recurring', 
            'attendee_count', 'attended_count',
            'is_registered', 'is_full', 'available_slots',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('organizer', 'created_at', 'updated_at')
    
    def get_attendee_count(self, obj):
        """Total registered attendees"""
        return obj.registrations.count()
    
    def get_attended_count(self, obj):
        """Total who actually attended"""
        return obj.registrations.filter(attended=True).count()
    
    def get_is_registered(self, obj):
        """Check if current user's member is registered"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user has a member profile
            if hasattr(request.user, 'member_profile'):
                return obj.registrations.filter(member=request.user.member_profile).exists()
        return False


class EventRegistrationSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    member_email = serializers.EmailField(source='member.email', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'event', 'event_title', 
            'member', 'member_name', 'member_email',
            'registered_at', 'attended', 'check_in_time', 'notes'
        ]
        read_only_fields = ('registered_at',)


class EventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating events"""
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'event_type', 'status',
            'date', 'end_date', 'location', 
            'ministry', 'max_attendees', 'is_recurring'
        ]