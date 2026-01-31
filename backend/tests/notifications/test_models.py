"""
Tests for Notification model.
"""

import pytest

from apps.notifications.models import Notification


@pytest.mark.django_db
class TestNotificationModel:
    """Tests for the Notification model."""

    def test_create_notification(self, user):
        """Test creating a notification."""
        notification = Notification.objects.create(
            user=user,
            type="system",
            title="Test Title",
            message="Test message",
            link="/test",
        )

        assert notification.id is not None
        assert notification.user == user
        assert notification.type == "system"
        assert notification.title == "Test Title"
        assert notification.message == "Test message"
        assert notification.link == "/test"
        assert notification.read is False  # Default value
        assert notification.created_at is not None

    def test_notification_str(self, notification, user):
        """Test string representation."""
        expected = f"{notification.type}: {notification.title} → {user.username}"
        assert str(notification) == expected

    def test_notification_ordering(self, user):
        """Test that notifications are ordered by -created_at."""
        first = Notification.objects.create(
            user=user,
            type="system",
            title="First",
        )
        second = Notification.objects.create(
            user=user,
            type="system",
            title="Second",
        )

        notifications = list(Notification.objects.filter(user=user))
        assert notifications[0] == second  # Most recent first
        assert notifications[1] == first

    def test_notification_type_choices(self, user):
        """Test all notification types are valid."""
        valid_types = [
            "prayer_request",
            "event",
            "announcement",
            "attendance",
            "ministry",
            "system",
        ]

        for ntype in valid_types:
            notification = Notification.objects.create(
                user=user,
                type=ntype,
                title=f"{ntype} notification",
            )
            assert notification.type == ntype

    def test_notification_blank_fields(self, user):
        """Test that message and link can be blank."""
        notification = Notification.objects.create(
            user=user,
            type="system",
            title="Title only",
            message="",
            link="",
        )

        assert notification.message == ""
        assert notification.link == ""
