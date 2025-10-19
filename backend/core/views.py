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
    """Get dashboard stats - with error handling"""
    user = request.user
    
    # ✅ Always return basic user info (this always works)
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
    
    # ✅ Try to get overview, but don't crash if it fails
    try:
        stats["overview"] = {
            "total_members": Member.objects.count(),
            "active_members": Member.objects.filter(status='active').count(),
            "total_ministries": Ministry.objects.count(),
            "upcoming_events": Event.objects.filter(date__gte=timezone.now().date()).count(),
        }
    except Exception as e:
        # ✅ Return zeros instead of crashing
        stats["overview"] = {
            "total_members": 0,
            "active_members": 0,
            "total_ministries": 0,
            "upcoming_events": 0,
            "error": str(e)  # ← Shows what's wrong
        }
    
    # ✅ Try to get attendance
    try:
        today = timezone.now().date()
        stats["attendance"] = {
            "today": Attendance.objects.filter(date=today).count(),
            "this_week": Attendance.objects.filter(
                date__gte=today - timedelta(days=7)
            ).count(),
        }
    except Exception as e:
        stats["attendance"] = {
            "today": 0,
            "this_week": 0,
            "error": str(e)
        }
    
    stats["upcoming_events"] = []
    stats["ministries"] = []
    
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