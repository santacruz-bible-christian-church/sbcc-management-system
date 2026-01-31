import logging
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from apps.members.models import Member

from .models import Attendance

logger = logging.getLogger(__name__)


def check_frequent_absences(threshold=3, days=30, notify=False):
    """
    Check for members with frequent absences and optionally notify admins.

    Args:
        threshold: Minimum number of absences to trigger notification
        days: Look back period in days
        notify: If True, send email notification to admins

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
            # No attendance records in period - skip
            continue

        absences = records.filter(attended=False).count()

        # Only include members who have actual absences >= threshold in the date range
        # This ensures we're using real data, not stale consecutive_absences field
        if absences >= threshold:
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

    # Only notify admins if explicitly requested
    if notify and problem_members:
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

    message = "Attendance Alert Report\n"
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

    # Also send in-app notification
    from apps.notifications.services import notify_admins

    notify_admins(
        notification_type="attendance",
        title=f"Attendance Alert: {len(problem_members)} Member(s)",
        message="Members with frequent absences need follow-up",
        link="/attendance",
    )


def send_pastoral_care_email(member, church_name="Santa Cruz Bible Christian Church"):
    """
    Send a caring check-in email to an absent member.

    Args:
        member: Member object with email
        church_name: Name of the church for email

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not member.email:
        return False

    subject = f"We miss you at {church_name}!"

    message = f"""Dear {member.first_name or member.full_name},

We noticed you haven't been able to join us for worship recently, and we wanted to reach out to let you know that we miss you!

We hope everything is well with you and your family. If there's anything we can do to help, or if you'd just like to talk, please don't hesitate to reach out to us.

You are always welcome, and we look forward to seeing you again soon.

With love and prayers,
{church_name} Family
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.email],
            fail_silently=False,
        )
        logger.info(f"Pastoral care email sent to {member.full_name} ({member.email})")
        return True
    except Exception as e:
        logger.error(f"Failed to send pastoral care email to {member.full_name}: {e}")
        return False


def notify_inactive_members(threshold=3, days=30, dry_run=True):
    """
    Send pastoral care emails to members with frequent absences.

    Args:
        threshold: Number of absences to trigger notification
        days: Look back period in days
        dry_run: If True, only return list without sending emails

    Returns:
        Dict with results: members_found, emails_sent, emails_failed, skipped_no_email
    """
    # Get members with frequent absences
    problem_members = check_frequent_absences(threshold=threshold, days=days, notify=False)

    results = {
        "members_found": len(problem_members),
        "emails_sent": 0,
        "emails_failed": 0,
        "skipped_no_email": 0,
        "dry_run": dry_run,
        "members": [],
    }

    for item in problem_members:
        member_result = {
            "member_id": item["member_id"],
            "member_name": item["member_name"],
            "email": item["email"],
            "absences": item["absences"],
            "status": None,
        }

        if not item["email"]:
            member_result["status"] = "skipped_no_email"
            results["skipped_no_email"] += 1
        elif dry_run:
            member_result["status"] = "would_send"
        else:
            # Get the actual member object for sending email
            try:
                member = Member.objects.get(id=item["member_id"])
                success = send_pastoral_care_email(member)
                if success:
                    member_result["status"] = "sent"
                    results["emails_sent"] += 1
                else:
                    member_result["status"] = "failed"
                    results["emails_failed"] += 1
            except Member.DoesNotExist:
                member_result["status"] = "member_not_found"
                results["emails_failed"] += 1

        results["members"].append(member_result)

    return results


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
