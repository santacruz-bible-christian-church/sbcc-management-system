from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

# Import from proper apps
from apps.ministries.models import Ministry
from apps.members.models import Member
from apps.events.models import Event
from apps.attendance.models import Attendance


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    GET /api/dashboard/stats/
    Get dashboard statistics based on user role
    """
    user = request.user
    
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
    
    # Overview statistics
    try:
        stats["overview"] = {
            "total_members": Member.objects.count(),
            "active_members": Member.objects.filter(is_active=True).count(),
            "total_ministries": Ministry.objects.count(),
            "upcoming_events": Event.objects.filter(start_datetime__gte=timezone.now()).count(),
        }
    except Exception as e:
        stats["overview"] = {
            "total_members": 0,
            "active_members": 0,
            "total_ministries": 0,
            "upcoming_events": 0,
            "error": str(e)
        }
    
    # Attendance statistics
    try:
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        
        stats["attendance"] = {
            "today": Attendance.objects.filter(check_in_time__gte=today_start).count(),
            "this_week": Attendance.objects.filter(check_in_time__gte=week_start).count(),
        }
    except Exception as e:
        stats["attendance"] = {
            "today": 0,
            "this_week": 0,
            "error": str(e)
        }
    
    # Upcoming events
    try:
        upcoming_events = Event.objects.filter(
            start_datetime__gte=timezone.now()
        ).order_by('start_datetime')[:5]
        
        stats["upcoming_events"] = [
            {
                "id": event.id,
                "title": event.title,
                "event_type": event.event_type,
                "start_datetime": event.start_datetime.isoformat(),
                "location": event.location,
            }
            for event in upcoming_events
        ]
    except Exception:
        stats["upcoming_events"] = []
    
    # Ministry list (for admin/pastor)
    if user.role in ['admin', 'pastor']:
        try:
            ministries = Ministry.objects.all()[:10]
            stats["ministries"] = [
                {
                    "id": ministry.id,
                    "name": ministry.name,
                    "leader": ministry.leader.username if ministry.leader else None,
                    "member_count": ministry.members.count(),
                }
                for ministry in ministries
            ]
        except Exception:
            stats["ministries"] = []
    else:
        stats["ministries"] = []
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    """
    GET /api/dashboard/activities/
    Get recent activities across the system
    """
    user = request.user
    
    if user.role not in ['admin', 'pastor']:
        return Response({
            "detail": "You don't have permission to view activities."
        }, status=403)
    
    activities = []
    
    # Recent members
    try:
        recent_members = Member.objects.order_by('-membership_date')[:10]
        for member in recent_members:
            activities.append({
                "type": "member_joined",
                "message": f"{member.first_name} {member.last_name} joined",
                "timestamp": member.membership_date.isoformat(),
                "details": {
                    "member_id": member.id,
                    "ministry": member.ministry.name if member.ministry else None,
                }
            })
    except Exception:
        pass
    
    # Recent events
    try:
        recent_events = Event.objects.order_by('-created_at')[:10]
        for event in recent_events:
            activities.append({
                "type": "event_created",
                "message": f"Event '{event.title}' scheduled for {event.start_datetime.date()}",
                "timestamp": event.created_at.isoformat(),
                "details": {
                    "event_id": event.id,
                    "event_type": event.event_type,
                    "start_datetime": event.start_datetime.isoformat(),
                }
            })
    except Exception:
        pass
    
    # Recent attendance
    try:
        recent_attendance = Attendance.objects.select_related(
            'member', 'event'
        ).order_by('-check_in_time')[:10]
        
        for attendance in recent_attendance:
            activities.append({
                "type": "attendance_marked",
                "message": f"{attendance.member.first_name} attended {attendance.event.title}",
                "timestamp": attendance.check_in_time.isoformat(),
                "details": {
                    "member_id": attendance.member.id,
                    "event_id": attendance.event.id,
                    "attended": attendance.attended,
                }
            })
    except Exception:
        pass
    
    # Sort by timestamp
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return Response({
        "activities": activities[:20],
        "count": len(activities)
    })