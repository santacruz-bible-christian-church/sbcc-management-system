"""
Fixtures for Notifications tests.
"""

import pytest

from apps.notifications.models import Notification


@pytest.fixture
def notification(db, user):
    """Create a single notification for the user."""
    return Notification.objects.create(
        user=user,
        type="system",
        title="Test Notification",
        message="This is a test notification",
        link="/dashboard",
        read=False,
    )


@pytest.fixture
def read_notification(db, user):
    """Create a read notification for the user."""
    return Notification.objects.create(
        user=user,
        type="prayer_request",
        title="Read Notification",
        message="This notification has been read",
        link="/prayer-requests",
        read=True,
    )


@pytest.fixture
def multiple_notifications(db, user):
    """Create multiple notifications for the user."""
    notifications = []
    for i in range(5):
        notifications.append(
            Notification.objects.create(
                user=user,
                type="system",
                title=f"Notification {i + 1}",
                message=f"Message {i + 1}",
                link=f"/page/{i + 1}",
                read=(i % 2 == 0),  # Alternate read/unread
            )
        )
    return notifications


@pytest.fixture
def admin_notification(db, admin_user):
    """Create a notification for the admin user."""
    return Notification.objects.create(
        user=admin_user,
        type="attendance",
        title="Attendance Alert",
        message="Members need follow-up",
        link="/attendance",
        read=False,
    )
