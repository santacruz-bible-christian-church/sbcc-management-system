import logging

from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.attendance.models import AttendanceSheet
from apps.events.models import Event
from apps.inventory.models import InventoryTracking
from apps.members.models import Member
from apps.ministries.models import Ministry
from apps.tasks.models import Task

logger = logging.getLogger(__name__)


@api_view(["GET"])
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
            "total_ministries": Ministry.objects.filter(is_active=True).count(),
            "upcoming_events": Event.objects.filter(
                date__gte=timezone.now(), status="published"
            ).count(),
            "total_inventory": InventoryTracking.objects.count(),
            "pending_tasks": get_pending_tasks_count(user),
        }
    except Exception as e:
        stats["overview"] = {
            "total_members": 0,
            "active_members": 0,
            "total_ministries": 0,
            "upcoming_events": 0,
            "total_inventory": 0,
            "error": str(e),
        }

    # Recent members (for activities)
    try:
        recent_members = Member.objects.order_by("-created_at")[:5]
        stats["recent_members"] = [
            {
                "id": member.id,
                "first_name": member.first_name,
                "last_name": member.last_name,
                "created_at": member.created_at.isoformat() if member.created_at else None,
            }
            for member in recent_members
        ]
    except Exception:
        stats["recent_members"] = []

    # Recent events (for activities)
    try:
        recent_events = Event.objects.order_by("-created_at")[:5]
        stats["recent_events"] = [
            {
                "id": event.id,
                "title": event.title,
                "event_type": event.event_type,
                "created_at": event.created_at.isoformat(),
            }
            for event in recent_events
        ]
    except Exception:
        stats["recent_events"] = []

    # Recent attendance (for activities)
    try:
        recent_sheets = AttendanceSheet.objects.select_related("event").order_by("-created_at")[:3]
        stats["recent_attendance"] = [
            {
                "id": sheet.id,
                "event_title": sheet.event.title if sheet.event else "Unknown Event",
                "attendance_rate": (
                    sheet.attendance_rate if hasattr(sheet, "attendance_rate") else 0
                ),
                "created_at": sheet.created_at.isoformat(),
            }
            for sheet in recent_sheets
        ]
    except Exception:
        stats["recent_attendance"] = []

    # Upcoming events
    try:
        upcoming_events = Event.objects.filter(
            date__gte=timezone.now(), status="published"
        ).order_by("date")[:5]

        stats["upcoming_events"] = [
            {
                "id": event.id,
                "title": event.title,
                "event_type": event.event_type,
                "date": event.date.isoformat(),
                "location": event.location,
            }
            for event in upcoming_events
        ]
    except Exception:
        stats["upcoming_events"] = []

    # Ministry list (for admin/pastor)
    if user.role in ["admin", "pastor"]:
        try:
            ministries = Ministry.objects.filter(is_active=True)[:10]
            stats["ministries"] = [
                {
                    "id": ministry.id,
                    "name": ministry.name,
                    "leader": ministry.leader.get_full_name() if ministry.leader else None,
                    "member_count": ministry.ministryvolunteer_set.filter(is_active=True).count(),
                }
                for ministry in ministries
            ]
        except Exception:
            stats["ministries"] = []
    else:
        stats["ministries"] = []

    return Response(stats)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    """
    GET /api/dashboard/activities/
    Get recent activities across the system
    """
    user = request.user

    if user.role not in ["admin", "pastor"]:
        return Response({"detail": "You don't have permission to view activities."}, status=403)

    activities = []

    # Recent members
    try:
        recent_members = Member.objects.order_by("-created_at")[:10]
        for member in recent_members:
            activities.append(
                {
                    "type": "member_joined",
                    "message": f"{member.first_name} {member.last_name} joined",
                    "timestamp": (
                        member.created_at.isoformat()
                        if member.created_at
                        else timezone.now().isoformat()
                    ),
                    "details": {
                        "member_id": member.id,
                    },
                }
            )
    except Exception as exc:
        logger.exception("Failed to collect recent member activity: %s", exc)

    # Recent events
    try:
        recent_events = Event.objects.order_by("-created_at")[:10]
        for event in recent_events:
            activities.append(
                {
                    "type": "event_created",
                    "message": f"Event '{event.title}' scheduled",
                    "timestamp": event.created_at.isoformat(),
                    "details": {
                        "event_id": event.id,
                        "event_type": event.event_type,
                        "date": event.date.isoformat(),
                    },
                }
            )
    except Exception as exc:
        logger.exception("Failed to collect recent event activity: %s", exc)

    # Sort by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    return Response({"activities": activities[:20], "count": len(activities)})


@api_view(["GET", "HEAD"])
@permission_classes([AllowAny])
def health_check(request):
    """
    GET/HEAD /api/health/
    Simple health check for uptime monitoring
    """
    return Response({"status": "ok"})


def get_pending_tasks_count(user):
    """Helper to get pending task count based on user role"""
    base_query = Task.objects.filter(status__in=["pending", "in_progress"], is_active=True)

    # Admin, super_admin, and pastors see all
    if user.role in ["super_admin", "admin", "pastor"]:
        return base_query.count()

    # Ministry leaders see their ministry's tasks
    if user.role == "ministry_leader":
        led_ministries = user.led_ministries.values_list("id", flat=True)
        return base_query.filter(Q(ministry_id__in=led_ministries) | Q(assigned_to=user)).count()

    # Others see only tasks assigned to them
    return base_query.filter(assigned_to=user).count()
