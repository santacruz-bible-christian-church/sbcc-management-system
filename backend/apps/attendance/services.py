from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from apps.members.models import Member

from .models import Attendance


def check_frequent_absences(threshold=3, days=30):
    """
    Check for members with frequent absences and notify admins.

    Args:
        threshold: Number of consecutive absences to trigger notification
        days: Look back period in days

    Returns:
        List of members with frequent absences
    """
    since_date = timezone.now().date() - timedelta(days=days)

    problem_members = []

    for member in Member.objects.filter(is_active=True, status="active"):
        # Get attendance records in date range
        records = Attendance.objects.filter(member=member, sheet__date__gte=since_date).order_by(
            "-sheet__date"
        )

        total_events = records.count()
        if total_events == 0:
            continue

        absences = records.filter(attended=False).count()

        # Check if exceeds threshold
        if absences >= threshold or member.consecutive_absences >= threshold:
            absence_rate = (absences / total_events) * 100
            problem_members.append(
                {
                    "member_id": member.id,
                    "member_name": member.full_name,
                    "email": member.email,
                    "total_events": total_events,
                    "absences": absences,
                    "consecutive_absences": member.consecutive_absences,
                    "absence_rate": round(absence_rate, 2),
                    "last_attended": (
                        member.last_attended.isoformat() if member.last_attended else None
                    ),
                    "ministry": member.ministry.name if member.ministry else None,
                }
            )

    # Notify admins if there are problem members
    if problem_members:
        _notify_admins_about_absences(problem_members, threshold, days)

    return problem_members


def _notify_admins_about_absences(problem_members, threshold, days):
    """Send email to admins about members with frequent absences"""
    from apps.authentication.models import User

    admin_emails = User.objects.filter(role__in=["admin", "pastor"], is_active=True).values_list(
        "email", flat=True
    )

    if not admin_emails:
        return

    subject = f"Attendance Alert: {len(problem_members)} Member(s) with Frequent Absences"

    message = f"Attendance Alert Report\n"
    message += f"Threshold: {threshold} absences in {days} days\n"
    message += f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}\n\n"
    message += "=" * 60 + "\n\n"

    for item in problem_members:
        message += f"Member: {item['member_name']}\n"
        message += f"  Email: {item['email']}\n"
        message += f"  Ministry: {item['ministry'] or 'None'}\n"
        message += f"  Total Events: {item['total_events']}\n"
        message += f"  Absences: {item['absences']} ({item['absence_rate']}%)\n"
        message += f"  Consecutive: {item['consecutive_absences']}\n"
        message += f"  Last Attended: {item['last_attended'] or 'Never'}\n"
        message += "\n"

    message += "=" * 60 + "\n"
    message += "Please follow up with these members.\n"

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=list(admin_emails),
        fail_silently=True,
    )


def generate_member_report(member_id, days=90):
    """
    Generate attendance report for a specific member

    Args:
        member_id: Member ID
        days: Look back period in days

    Returns:
        Dict with member attendance statistics
    """
    try:
        member = Member.objects.get(id=member_id)
    except Member.DoesNotExist:
        return {"error": "Member not found"}

    since_date = timezone.now().date() - timedelta(days=days)

    records = Attendance.objects.filter(member=member, sheet__date__gte=since_date).select_related(
        "sheet__event"
    )

    total = records.count()
    attended = records.filter(attended=True).count()
    absent = records.filter(attended=False).count()

    attendance_rate = (attended / total * 100) if total > 0 else 0

    # Get recent attendance history
    recent_records = records.order_by("-sheet__date")[:10]
    history = [
        {
            "date": r.sheet.date.isoformat(),
            "event": r.sheet.event.title,
            "attended": r.attended,
            "check_in_time": r.check_in_time.isoformat() if r.check_in_time else None,
        }
        for r in recent_records
    ]

    return {
        "member_id": member.id,
        "member_name": member.full_name,
        "period_days": days,
        "total_events": total,
        "attended": attended,
        "absent": absent,
        "attendance_rate": round(attendance_rate, 2),
        "consecutive_absences": member.consecutive_absences,
        "last_attended": member.last_attended.isoformat() if member.last_attended else None,
        "ministry": member.ministry.name if member.ministry else None,
        "recent_history": history,
    }


def generate_ministry_report(ministry_id, days=90):
    """
    Generate attendance report for a ministry

    Args:
        ministry_id: Ministry ID
        days: Look back period in days

    Returns:
        Dict with ministry attendance statistics
    """
    from apps.ministries.models import Ministry

    try:
        ministry = Ministry.objects.get(id=ministry_id)
    except Ministry.DoesNotExist:
        return {"error": "Ministry not found"}

    since_date = timezone.now().date() - timedelta(days=days)

    members = Member.objects.filter(ministry=ministry, is_active=True)
    member_count = members.count()

    if member_count == 0:
        return {
            "ministry_id": ministry.id,
            "ministry_name": ministry.name,
            "member_count": 0,
            "message": "No active members in this ministry",
        }

    # Get all attendance records for ministry members
    records = Attendance.objects.filter(member__in=members, sheet__date__gte=since_date)

    total_records = records.count()
    attended = records.filter(attended=True).count()
    absent = records.filter(attended=False).count()

    avg_attendance_rate = (attended / total_records * 100) if total_records > 0 else 0

    # Get per-member stats
    member_stats = []
    for member in members:
        member_records = records.filter(member=member)
        m_total = member_records.count()
        m_attended = member_records.filter(attended=True).count()
        m_rate = (m_attended / m_total * 100) if m_total > 0 else 0

        member_stats.append(
            {
                "member_id": member.id,
                "member_name": member.full_name,
                "events": m_total,
                "attended": m_attended,
                "attendance_rate": round(m_rate, 2),
                "consecutive_absences": member.consecutive_absences,
            }
        )

    # Sort by attendance rate (lowest first for intervention)
    member_stats.sort(key=lambda x: x["attendance_rate"])

    return {
        "ministry_id": ministry.id,
        "ministry_name": ministry.name,
        "period_days": days,
        "member_count": member_count,
        "total_events_tracked": total_records,
        "total_attended": attended,
        "total_absent": absent,
        "average_attendance_rate": round(avg_attendance_rate, 2),
        "member_stats": member_stats,
    }
