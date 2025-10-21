from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for Event model"""
    queryset = Event.objects.select_related('ministry', 'created_by').all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type', 'ministry']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_datetime', 'created_at']
    ordering = ['-start_datetime']