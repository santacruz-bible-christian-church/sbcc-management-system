import pytest


@pytest.mark.django_db
class TestAnnouncementModel:
    """Tests for the Announcement model."""

    def test_announcement_str(self, announcement):
        """Test string representation."""
        assert str(announcement) == "Test Announcement"

    def test_is_published_active_announcement(self, announcement):
        """Test is_published returns True for active, published announcements."""
        assert announcement.is_published() is True

    def test_is_published_scheduled_announcement(self, scheduled_announcement):
        """Test is_published returns False for future announcements."""
        assert scheduled_announcement.is_published() is False

    def test_is_published_expired_announcement(self, expired_announcement):
        """Test is_published returns False for expired announcements."""
        assert expired_announcement.is_published() is False

    def test_is_published_inactive_announcement(self, announcement):
        """Test is_published returns False for inactive announcements."""
        announcement.is_active = False
        announcement.save()
        assert announcement.is_published() is False
