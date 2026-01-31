"""
Tests for Notification API endpoints.
Covers list, retrieve, mark read, mark all read, delete, and permissions.
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.notifications.models import Notification


# =============================================================================
# List & Retrieve Tests
# =============================================================================
@pytest.mark.django_db
class TestNotificationList:
    """Tests for listing notifications."""

    def test_list_notifications_authenticated(self, auth_client, notification):
        """Test listing notifications for authenticated user."""
        url = reverse("notification-list")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get("results", response.data)
        assert len(results) >= 1

    def test_list_notifications_unauthenticated(self, api_client):
        """Test that unauthenticated users cannot list notifications."""
        url = reverse("notification-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_only_own_notifications(self, auth_client, notification, admin_notification):
        """Test that users only see their own notifications."""
        url = reverse("notification-list")
        response = auth_client.get(url)

        results = response.data.get("results", response.data)
        # Should only see own notification, not admin's
        notification_ids = [n["id"] for n in results]
        assert notification.id in notification_ids
        assert admin_notification.id not in notification_ids

    def test_retrieve_notification(self, auth_client, notification):
        """Test retrieving a single notification."""
        url = reverse("notification-detail", kwargs={"pk": notification.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == notification.id
        assert response.data["title"] == notification.title

    def test_retrieve_other_user_notification_fails(self, auth_client, admin_notification):
        """Test that users cannot retrieve other users' notifications."""
        url = reverse("notification-detail", kwargs={"pk": admin_notification.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# Unread Count Tests
# =============================================================================
@pytest.mark.django_db
class TestUnreadCount:
    """Tests for the unread count endpoint."""

    def test_unread_count(self, auth_client, notification, read_notification):
        """Test getting unread count."""
        url = reverse("notification-unread-count")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["unread_count"] == 1  # Only one unread

    def test_unread_count_zero(self, auth_client, read_notification):
        """Test unread count is zero when all are read."""
        url = reverse("notification-unread-count")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["unread_count"] == 0

    def test_unread_count_multiple(self, auth_client, multiple_notifications):
        """Test unread count with multiple notifications."""
        url = reverse("notification-unread-count")
        response = auth_client.get(url)

        # 5 notifications, alternating read/unread (0, 2, 4 are read)
        # So 1, 3 are unread = 2 unread
        assert response.status_code == status.HTTP_200_OK
        assert response.data["unread_count"] == 2


# =============================================================================
# Mark Read Tests
# =============================================================================
@pytest.mark.django_db
class TestMarkRead:
    """Tests for marking notifications as read."""

    def test_mark_single_as_read(self, auth_client, notification):
        """Test marking a single notification as read."""
        url = reverse("notification-mark-read", kwargs={"pk": notification.pk})
        response = auth_client.patch(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "marked as read"

        # Verify in database
        notification.refresh_from_db()
        assert notification.read is True

    def test_mark_already_read_notification(self, auth_client, read_notification):
        """Test marking an already read notification (idempotent)."""
        url = reverse("notification-mark-read", kwargs={"pk": read_notification.pk})
        response = auth_client.patch(url)

        assert response.status_code == status.HTTP_200_OK
        read_notification.refresh_from_db()
        assert read_notification.read is True

    def test_mark_other_user_notification_fails(self, auth_client, admin_notification):
        """Test that users cannot mark other users' notifications as read."""
        url = reverse("notification-mark-read", kwargs={"pk": admin_notification.pk})
        response = auth_client.patch(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# Mark All Read Tests
# =============================================================================
@pytest.mark.django_db
class TestMarkAllRead:
    """Tests for marking all notifications as read."""

    def test_mark_all_as_read(self, auth_client, user, multiple_notifications):
        """Test marking all notifications as read."""
        url = reverse("notification-mark-all-read")
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "all marked as read"
        assert response.data["count"] == 2  # Only 2 were unread

        # Verify all are read
        unread_count = Notification.objects.filter(user=user, read=False).count()
        assert unread_count == 0

    def test_mark_all_read_no_unread(self, auth_client, read_notification):
        """Test marking all read when none are unread."""
        url = reverse("notification-mark-all-read")
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0

    def test_mark_all_read_only_affects_own(
        self, auth_client, user, notification, admin_notification
    ):
        """Test that mark all read only affects own notifications."""
        url = reverse("notification-mark-all-read")
        auth_client.post(url)

        # Admin notification should still be unread
        admin_notification.refresh_from_db()
        assert admin_notification.read is False


# =============================================================================
# Delete Tests
# =============================================================================
@pytest.mark.django_db
class TestDeleteNotification:
    """Tests for deleting notifications."""

    def test_delete_notification(self, auth_client, notification):
        """Test deleting own notification."""
        url = reverse("notification-detail", kwargs={"pk": notification.pk})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Notification.objects.filter(pk=notification.pk).exists()

    def test_delete_other_user_notification_fails(self, auth_client, admin_notification):
        """Test that users cannot delete other users' notifications."""
        url = reverse("notification-detail", kwargs={"pk": admin_notification.pk})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        # Notification should still exist
        assert Notification.objects.filter(pk=admin_notification.pk).exists()


# =============================================================================
# Create Blocked Tests
# =============================================================================
@pytest.mark.django_db
class TestCreateBlocked:
    """Tests that direct creation is blocked."""

    def test_create_notification_blocked(self, auth_client, user):
        """Test that direct POST to create notification returns 405."""
        url = reverse("notification-list")
        response = auth_client.post(
            url,
            {
                "type": "system",
                "title": "Should not work",
                "message": "Blocked",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
        assert "not allowed" in response.data["detail"].lower()


# =============================================================================
# Serializer Tests
# =============================================================================
@pytest.mark.django_db
class TestNotificationSerializer:
    """Tests for notification serializer fields."""

    def test_time_ago_field(self, auth_client, notification):
        """Test that time_ago field is present and formatted."""
        url = reverse("notification-detail", kwargs={"pk": notification.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "time_ago" in response.data
        assert "ago" in response.data["time_ago"] or response.data["time_ago"] == "Just now"

    def test_response_fields(self, auth_client, notification):
        """Test that all expected fields are in response."""
        url = reverse("notification-detail", kwargs={"pk": notification.pk})
        response = auth_client.get(url)

        expected_fields = [
            "id",
            "type",
            "title",
            "message",
            "link",
            "read",
            "created_at",
            "time_ago",
        ]
        for field in expected_fields:
            assert field in response.data, f"Missing field: {field}"
