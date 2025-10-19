from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import Ministry, Member, Event, Attendance
from .serializers import (
    MinistrySerializer, MemberSerializer, 
    EventSerializer, AttendanceSerializer
)

class MinistryViewSet(viewsets.ModelViewSet):
    """ViewSet for Ministry model"""
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class MemberViewSet(viewsets.ModelViewSet):
    """ViewSet for Member model"""
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['ministry', 'status']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['first_name', 'last_name', 'date_joined']

class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for Event model"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type']
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'created_at']

class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance model"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event', 'member', 'status']
    ordering_fields = ['date', 'created_at']


# ============================================
# DASHBOARD API - NEW
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    GET /api/dashboard/stats/
    Get dashboard statistics based on user role
    
    Returns:
    - Admin: Full statistics
    - Pastor: Ministry-level statistics
    - Member: Personal statistics only
    """
    user = request.user
    today = timezone.now().date()
    
    # Base response with user info
    stats = {
        "user": {
            "id": user.id,
            "username": user.username,
            "name": f"{user.first_name} {user.last_name}" if user.first_name else user.username,
            "email": user.email,
            "role": user.role,
        },
        "timestamp": timezone.now().isoformat(),
    }
    
    # ADMIN - Full access to all statistics
    if user.role == 'admin':
        stats["overview"] = {
            "total_members": Member.objects.count(),
            "active_members": Member.objects.filter(status='active').count(),
            "inactive_members": Member.objects.filter(status='inactive').count(),
            "total_ministries": Ministry.objects.count(),
            "total_events": Event.objects.count(),
            "upcoming_events": Event.objects.filter(date__gte=today).count(),
            "past_events": Event.objects.filter(date__lt=today).count(),
        }
        
        # Today's attendance
        stats["attendance"] = {
            "today": Attendance.objects.filter(date=today).count(),
            "this_week": Attendance.objects.filter(
                date__gte=today - timedelta(days=7)
            ).count(),
            "this_month": Attendance.objects.filter(
                date__month=today.month,
                date__year=today.year
            ).count(),
        }
        
        # Ministry breakdown
        ministry_stats = Ministry.objects.annotate(
            member_count=Count('member')
        ).values('id', 'name', 'member_count')
        stats["ministries"] = list(ministry_stats)
        
        # Upcoming events (next 5)
        upcoming = Event.objects.filter(
            date__gte=today
        ).order_by('date')[:5].values(
            'id', 'title', 'date', 'event_type', 'location'
        )
        stats["upcoming_events"] = list(upcoming)
        
        # Recent activities (last 10 members joined)
        recent_members = Member.objects.order_by('-date_joined')[:5].values(
            'id', 'first_name', 'last_name', 'date_joined'
        )
        stats["recent_members"] = list(recent_members)
    
    # PASTOR - Ministry and event management stats
    elif user.role == 'pastor':
        stats["overview"] = {
            "total_members": Member.objects.count(),
            "active_members": Member.objects.filter(status='active').count(),
            "total_ministries": Ministry.objects.count(),
            "upcoming_events": Event.objects.filter(date__gte=today).count(),
        }
        
        # Today's attendance
        stats["attendance"] = {
            "today": Attendance.objects.filter(date=today).count(),
            "this_week": Attendance.objects.filter(
                date__gte=today - timedelta(days=7)
            ).count(),
        }
        
        # Upcoming events (next 5)
        upcoming = Event.objects.filter(
            date__gte=today
        ).order_by('date')[:5].values(
            'id', 'title', 'date', 'event_type'
        )
        stats["upcoming_events"] = list(upcoming)
    
    # MINISTRY LEADER - Their ministry stats
    elif user.role == 'ministry_leader':
        # Get ministries they lead (if any)
        # Note: You might need to add a 'leader' field to Ministry model
        stats["overview"] = {
            "total_members": Member.objects.count(),
            "upcoming_events": Event.objects.filter(date__gte=today).count(),
        }
        
        stats["attendance"] = {
            "today": Attendance.objects.filter(date=today).count(),
        }
    
    # VOLUNTEER/MEMBER - Limited personal stats
    else:
        # Try to find their member record
        try:
            member = Member.objects.get(email=user.email)
            stats["personal"] = {
                "ministry": member.ministry.name if member.ministry else None,
                "status": member.status,
                "date_joined": member.date_joined.isoformat(),
                "my_attendance_count": Attendance.objects.filter(
                    member=member
                ).count(),
            }
        except Member.DoesNotExist:
            stats["personal"] = {
                "message": "No member profile found"
            }
        
        # Show upcoming events only
        upcoming = Event.objects.filter(
            date__gte=today
        ).order_by('date')[:5].values(
            'id', 'title', 'date', 'event_type', 'location'
        )
        stats["upcoming_events"] = list(upcoming)
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    """
    GET /api/dashboard/activities/
    Get recent activities across the system
    
    Only accessible by admin and pastor roles
    """
    user = request.user
    
    if user.role not in ['admin', 'pastor']:
        return Response({
            "detail": "You don't have permission to view activities."
        }, status=403)
    
    activities = []
    
    # Recent members (last 10)
    recent_members = Member.objects.order_by('-date_joined')[:10]
    for member in recent_members:
        activities.append({
            "type": "member_joined",
            "message": f"{member.first_name} {member.last_name} joined",
            "timestamp": member.date_joined.isoformat(),
            "details": {
                "member_id": member.id,
                "ministry": member.ministry.name if member.ministry else None,
            }
        })
    
    # Recent events (last 10)
    recent_events = Event.objects.order_by('-created_at')[:10]
    for event in recent_events:
        activities.append({
            "type": "event_created",
            "message": f"Event '{event.title}' scheduled for {event.date}",
            "timestamp": event.created_at.isoformat(),
            "details": {
                "event_id": event.id,
                "event_type": event.event_type,
            }
        })
    
    # Recent attendance records (last 10)
    recent_attendance = Attendance.objects.select_related(
        'member', 'event'
    ).order_by('-created_at')[:10]
    for attendance in recent_attendance:
        activities.append({
            "type": "attendance_marked",
            "message": f"{attendance.member.first_name} attended {attendance.event.title}",
            "timestamp": attendance.created_at.isoformat(),
            "details": {
                "member_id": attendance.member.id,
                "event_id": attendance.event.id,
                "status": attendance.status,
            }
        })
    
    # Sort all activities by timestamp (newest first)
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return Response({
        "activities": activities[:20],  # Return top 20 most recent
        "count": len(activities)
    })