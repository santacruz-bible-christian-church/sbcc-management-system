from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Event, EventRegistration
from .serializers import EventSerializer, EventRegistrationSerializer

User = get_user_model()

class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing events
    Provides CRUD operations: list, create, retrieve, update, destroy
    """
    queryset = Event.objects.all().select_related('organizer', 'ministry').order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter events based on query parameters"""
        queryset = Event.objects.select_related('organizer', 'ministry').order_by('-date')
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by ministry
        ministry_id = self.request.query_params.get('ministry', None)
        if ministry_id:
            queryset = queryset.filter(ministry_id=ministry_id)
        
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
        """Register current user's member profile for an event"""
        event = self.get_object()
        user = request.user
        
        # Check if user has a member profile
        if not hasattr(user, 'member_profile'):
            return Response(
                {'error': 'You must have a member profile to register for events'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member = user.member_profile
        
        # Check if already registered
        if EventRegistration.objects.filter(event=event, member=member).exists():
            return Response(
                {'error': 'Already registered for this event'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if event is full
        if event.is_full:
            return Response(
                {'error': 'Event is full'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Register member
        registration = EventRegistration.objects.create(event=event, member=member)
        serializer = EventRegistrationSerializer(registration)
        
        return Response({
            'message': 'Successfully registered for event',
            'registration': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def unregister(self, request, pk=None):
        """Unregister current user's member from an event"""
        event = self.get_object()
        user = request.user
        
        if not hasattr(user, 'member_profile'):
            return Response(
                {'error': 'You do not have a member profile'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member = user.member_profile
        
        try:
            registration = EventRegistration.objects.get(event=event, member=member)
            registration.delete()
            return Response({'message': 'Successfully unregistered from event'})
        except EventRegistration.DoesNotExist:
            return Response(
                {'error': 'Not registered for this event'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """Get list of registrations for an event"""
        event = self.get_object()
        registrations = event.registrations.all().select_related('member')
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def attendance_report(self, request, pk=None):
        """Get attendance report for an event"""
        event = self.get_object()
        total_registered = event.registrations.count()
        total_attended = event.registrations.filter(attended=True).count()
        total_absent = total_registered - total_attended
        
        attendance_rate = (total_attended / total_registered * 100) if total_registered > 0 else 0
        
        return Response({
            'event': EventSerializer(event, context={'request': request}).data,
            'total_registered': total_registered,
            'total_attended': total_attended,
            'total_absent': total_absent,
            'attendance_rate': round(attendance_rate, 2),
            'registrations': EventRegistrationSerializer(
                event.registrations.all().select_related('member'), 
                many=True
            ).data
        })


class EventRegistrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing event registrations
    """
    queryset = EventRegistration.objects.all().select_related('event', 'member').order_by('-registered_at')
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter registrations based on query parameters"""
        queryset = EventRegistration.objects.select_related('event', 'member').order_by('-registered_at')
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filter by member
        member_id = self.request.query_params.get('member', None)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        
        # Filter by attendance status
        attended = self.request.query_params.get('attended', None)
        if attended is not None:
            queryset = queryset.filter(attended=attended.lower() == 'true')
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_attended(self, request, pk=None):
        """Mark registration as attended"""
        registration = self.get_object()
        registration.mark_attended()
        
        serializer = self.get_serializer(registration)
        return Response({
            'message': 'Registration marked as attended',
            'registration': serializer.data
        })