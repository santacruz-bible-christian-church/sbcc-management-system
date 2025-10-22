from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Event, EventAttendee
from .serializers import EventSerializer, EventAttendeeSerializer

User = get_user_model()

class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing events
    Provides CRUD operations: list, create, retrieve, update, destroy
    """
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter events based on query parameters"""
        queryset = Event.objects.all().order_by('-date')
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset
    
    def perform_create(self, serializer):
        """Set organizer to current user when creating event"""
        serializer.save(organizer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register current user for an event"""
        event = self.get_object()
        user = request.user
        
        # Check if already registered
        if EventAttendee.objects.filter(event=event, user=user).exists():
            return Response(
                {'error': 'Already registered for this event'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if event is full
        if event.max_attendees and event.attendees.count() >= event.max_attendees:
            return Response(
                {'error': 'Event is full'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Register user
        attendee = EventAttendee.objects.create(event=event, user=user)
        serializer = EventAttendeeSerializer(attendee)
        
        return Response({
            'message': 'Successfully registered for event',
            'attendee': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def unregister(self, request, pk=None):
        """Unregister current user from an event"""
        event = self.get_object()
        user = request.user
        
        try:
            attendee = EventAttendee.objects.get(event=event, user=user)
            attendee.delete()
            return Response({'message': 'Successfully unregistered from event'})
        except EventAttendee.DoesNotExist:
            return Response(
                {'error': 'Not registered for this event'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        """Get list of attendees for an event"""
        event = self.get_object()
        attendees = event.attendees.all()
        serializer = EventAttendeeSerializer(attendees, many=True)
        return Response(serializer.data)

class EventAttendeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing event attendees
    """
    queryset = EventAttendee.objects.all().order_by('-registered_at')
    serializer_class = EventAttendeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter attendees based on query parameters"""
        queryset = EventAttendee.objects.all().order_by('-registered_at')
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filter by attendance status
        attended = self.request.query_params.get('attended', None)
        if attended is not None:
            queryset = queryset.filter(attended=attended.lower() == 'true')
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_attended(self, request, pk=None):
        """Mark attendee as attended"""
        attendee = self.get_object()
        attendee.attended = True
        attendee.save()
        
        serializer = self.get_serializer(attendee)
        return Response({
            'message': 'Attendee marked as attended',
            'attendee': serializer.data
        })