from django.db.models.query import QuerySet

from .models import Notification


def create_notification(user, notification_type, title, message="", link=""):
    """
    Create a notification for a user.

    Args:
        user: User object (single) or QuerySet (multiple)
        notification_type: One of Notification.TYPE_CHOICES
        title: Short title
        message: Optional longer message
        link: Optional URL path

    Returns:
        Notification object or list of objects
    """
    if isinstance(user, QuerySet):
        # Bulk create for multiple users
        notifications = [
            Notification(
                user=u,
                type=notification_type,
                title=title,
                message=message,
                link=link,
            )
            for u in user
        ]
        return Notification.objects.bulk_create(notifications)
    else:
        # Single user
        return Notification.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            link=link,
        )


def notify_admins(notification_type, title, message="", link=""):
    """Send notification to all admin users."""
    from apps.authentication.models import User

    admins = User.objects.filter(role__in=["super_admin", "admin", "pastor"], is_active=True)
    return create_notification(admins, notification_type, title, message, link)
