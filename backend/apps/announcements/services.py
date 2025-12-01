from django.conf import settings
from django.core.mail import send_mass_mail

from apps.members.models import Member


def get_announcement_recipients(announcement):
    """
    Get recipient emails based on announcement audience.
    Similar to how ministries/utils.py gets volunteers for rotation.
    """
    if announcement.audience == "all":
        # Get all active members with valid emails
        return (
            Member.objects.filter(is_active=True)
            .exclude(email__isnull=True)
            .exclude(email="")
            .values_list("email", flat=True)
        )

    elif announcement.audience == "ministry" and announcement.ministry:
        # Get ministry members via MinistryMember → User relationship
        return (
            announcement.ministry.ministry_members.filter(is_active=True)
            .exclude(user__email__isnull=True)
            .exclude(user__email="")
            .values_list("user__email", flat=True)
        )

    return []


def send_announcement_email(announcement):
    """
    Send announcement via email to target audience.
    Pattern copied from ministries/utils.py:_send_assignment_notification()
    """
    recipients = list(get_announcement_recipients(announcement))
    recipients = [email for email in recipients if email]  # Filter out empty emails

    if not recipients:
        return {
            "success": False,
            "message": "No recipients found",
            "sent": 0,
            "total": 0,
        }

    # Format subject and message (similar to ministries email pattern)
    subject = f"[Announcement] {announcement.title}"

    # Build message body
    ministry_line = ""
    if announcement.audience == "ministry" and announcement.ministry:
        ministry_line = f"\nMinistry: {announcement.ministry.name}\n"

    message = f"""
{announcement.title}

{ministry_line}
{announcement.body}

---
Santa Cruz Bible Christian Church
Posted: {announcement.publish_at.strftime("%A, %B %d, %Y")}
    """.strip()

    from_email = settings.DEFAULT_FROM_EMAIL

    try:
        # Use send_mass_mail for bulk sending (like ministries/utils.py)
        messages = [(subject, message, from_email, [email]) for email in recipients]

        sent_count = send_mass_mail(messages, fail_silently=False)

        # Mark as sent
        announcement.sent = True
        announcement.save(update_fields=["sent"])

        return {
            "success": True,
            "message": "Announcement sent successfully",
            "sent": sent_count,
            "total": len(recipients),
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to send: {str(e)}",
            "sent": 0,
            "total": len(recipients),
        }
