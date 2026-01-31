"""
Tests for Notification services.
"""

import pytest

from apps.authentication.models import User
from apps.notifications.models import Notification
from apps.notifications.services import create_notification, notify_admins


@pytest.mark.django_db
class TestCreateNotification:
    """Tests for create_notification service function."""

    def test_create_single_notification(self, user):
        """Test creating a notification for a single user."""
        notification = create_notification(
            user=user,
            notification_type="system",
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
        assert notification.read is False

    def test_create_notification_without_optional_fields(self, user):
        """Test creating notification without message and link."""
        notification = create_notification(
            user=user,
            notification_type="attendance",
            title="Attendance Alert",
        )

        assert notification.id is not None
        assert notification.message == ""
        assert notification.link == ""

    def test_create_bulk_notifications(self, admin_user, user):
        """Test creating notifications for multiple users."""
        users = User.objects.filter(pk__in=[admin_user.pk, user.pk])

        notifications = create_notification(
            user=users,
            notification_type="announcement",
            title="New Announcement",
            message="Check it out",
            link="/announcements",
        )

        assert len(notifications) == 2
        assert Notification.objects.filter(title="New Announcement").count() == 2


@pytest.mark.django_db
class TestNotifyAdmins:
    """Tests for notify_admins service function."""

    def test_notify_admins_creates_notifications(self, admin_user, super_admin_user, create_user):
        """Test that notify_admins creates notifications for admin roles."""
        # Create a ministry_leader (not included in admin notifications)
        ministry_leader = create_user(
            username="ministry_leader_test",
            email="leader@example.com",
            role="ministry_leader",
        )

        notifications = notify_admins(
            notification_type="system",
            title="Admin Alert",
            message="Attention needed",
            link="/admin",
        )

        # Should create for admin and super_admin, not for ministry_leader
        assert len(notifications) >= 2

        # Verify admin got notification
        assert Notification.objects.filter(user=admin_user, title="Admin Alert").exists()
        assert Notification.objects.filter(user=super_admin_user, title="Admin Alert").exists()

        # Ministry leader should NOT get notification
        assert not Notification.objects.filter(user=ministry_leader, title="Admin Alert").exists()

    def test_notify_admins_includes_pastors(self, create_user):
        """Test that notify_admins includes pastor role."""
        pastor = create_user(
            username="pastor_test",
            email="pastor@example.com",
            role="pastor",
        )

        notifications = notify_admins(
            notification_type="attendance",
            title="Pastor Alert",
        )

        assert Notification.objects.filter(user=pastor, title="Pastor Alert").exists()

    def test_notify_admins_returns_empty_if_no_admins(self, db):
        """Test notify_admins when no admin users exist."""
        # Delete all admin/pastor users
        User.objects.filter(role__in=["admin", "super_admin", "pastor"]).delete()

        notifications = notify_admins(
            notification_type="system",
            title="No Recipients",
        )

        assert notifications == []
