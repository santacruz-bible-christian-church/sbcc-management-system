import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Count, Q


def notify_assignment(prayer_request):
    """Send notification to assigned pastor/elder when a request is assigned."""
    if not prayer_request.assigned_to or not prayer_request.assigned_to.email:
        return False

    subject = f"[Prayer Request Assigned] {prayer_request.title}"
    message = f"""
You have been assigned a new prayer request.

Title: {prayer_request.title}
Category: {prayer_request.get_category_display()}
Priority: {prayer_request.get_priority_display()}
Requester: {prayer_request.requester_display_name}

Description:
{prayer_request.description}

---
Please log in to the system to view details and add follow-ups.
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[prayer_request.assigned_to.email],
            fail_silently=False,
        )
        return True
    except Exception:
        logging.exception(
            "Failed to send prayer request assignment email to %s", prayer_request.assigned_to.email
        )
        return False


def get_prayer_request_statistics():
    """Get aggregated prayer request statistics efficiently."""
    from apps.prayer_requests.models import PrayerRequest

    stats = PrayerRequest.objects.aggregate(
        total=Count("id"),
        pending=Count("id", filter=Q(status="pending")),
        assigned=Count("id", filter=Q(status="assigned")),
        in_progress=Count("id", filter=Q(status="in_progress")),
        prayed=Count("id", filter=Q(status="prayed")),
        follow_up=Count("id", filter=Q(status="follow_up")),
        completed=Count("id", filter=Q(status="completed")),
        archived=Count("id", filter=Q(status="archived")),
    )

    by_category = dict(
        PrayerRequest.objects.values("category")
        .annotate(count=Count("id"))
        .values_list("category", "count")
    )

    by_priority = dict(
        PrayerRequest.objects.values("priority")
        .annotate(count=Count("id"))
        .values_list("priority", "count")
    )

    return {
        **stats,
        "by_category": by_category,
        "by_priority": by_priority,
    }
