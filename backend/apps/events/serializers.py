from rest_framework import serializers

from .models import Event, EventRegistration


class EventRegistrationSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = EventRegistration
        fields = [
            "id",
            "event",
            "event_title",
            "member",
            "member_name",
            "registered_at",
            "notes",
        ]
        read_only_fields = ["id", "registered_at"]


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source="organizer.get_full_name", read_only=True)
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    registration_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "event_type",
            "status",
            "date",
            "end_date",
            "location",
            "organizer",
            "organizer_name",
            "ministry",
            "ministry_name",
            "max_attendees",
            "is_recurring",
            "registration_count",
            "is_full",
            "available_slots",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "is_full", "available_slots"]
