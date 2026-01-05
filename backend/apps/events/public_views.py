"""
Public API views for events.
No authentication required - for homepage consumption.
"""

from django.utils import timezone
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event


class PublicEventSerializer(serializers.ModelSerializer):
    """Lightweight serializer for public event display."""

    ministry_name = serializers.SerializerMethodField()
    organizer_name = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "event_type",
            "date",
            "end_date",
            "location",
            "ministry_name",
            "organizer_name",
            "max_attendees",
            "registered_count",
            "available_slots",
            "is_full",
        ]

    def get_ministry_name(self, obj):
        return obj.ministry.name if obj.ministry else None

    def get_organizer_name(self, obj):
        if obj.organizer:
            name = f"{obj.organizer.first_name} {obj.organizer.last_name}".strip()
            return name or obj.organizer.username
        return None


class PublicEventsView(APIView):
    """
    GET /api/public/events/

    Public endpoint for fetching published events (including past events).
    No authentication required.

    Query Parameters:
        event_type (str): Optional filter by event type (service, bible_study, etc.)
        ministry (int): Optional filter by ministry ID
        time_filter (str): Filter by time - 'upcoming', 'past', or 'all' (default: 'all')
        limit (int): Max number of results (default: 10, max: 50)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()

        # Base queryset: published events (includes completed for historical display)
        queryset = Event.objects.select_related("ministry", "organizer").filter(
            status__in=["published", "completed"],
        )

        # Time filter: upcoming, past, or all (default: all)
        time_filter = request.query_params.get("time_filter", "all").lower()
        if time_filter == "upcoming":
            queryset = queryset.filter(date__gte=now)
        elif time_filter == "past":
            queryset = queryset.filter(date__lt=now)
        # 'all' - no date filtering

        # Filter by event_type if provided
        event_type = request.query_params.get("event_type")
        if event_type:
            queryset = queryset.filter(event_type=event_type)

        # Filter by ministry if provided
        ministry_id = request.query_params.get("ministry")
        if ministry_id:
            queryset = queryset.filter(ministry_id=ministry_id)

        # Apply limit
        try:
            limit = min(int(request.query_params.get("limit", 10)), 50)
        except (ValueError, TypeError):
            limit = 10

        # Order: upcoming events first (ascending date), then past events
        queryset = queryset.order_by("-date")[:limit]

        serializer = PublicEventSerializer(queryset, many=True)
        return Response(
            {
                "count": len(serializer.data),
                "results": serializer.data,
            }
        )
