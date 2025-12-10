from unittest.mock import patch

import pytest


@pytest.mark.django_db
class TestPrayerRequestServices:
    """Tests for prayer request services."""

    @patch("apps.prayer_requests.services.send_mail")
    def test_notify_assignment_sends_email(self, mock_send_mail, assigned_prayer_request):
        """Test that notify_assignment sends an email."""
        from apps.prayer_requests.services import notify_assignment

        result = notify_assignment(assigned_prayer_request)

        assert result is True
        mock_send_mail.assert_called_once()

    def test_notify_assignment_no_assignee(self, prayer_request):
        """Test notify_assignment when no assigned user."""
        from apps.prayer_requests.services import notify_assignment

        result = notify_assignment(prayer_request)
        assert result is False

    def test_get_statistics(self, prayer_request, assigned_prayer_request):
        """Test get_prayer_request_statistics."""
        from apps.prayer_requests.services import get_prayer_request_statistics

        stats = get_prayer_request_statistics()

        assert stats["total"] == 2
        assert stats["pending"] == 1
        assert stats["assigned"] == 1
        assert "by_category" in stats
        assert "by_priority" in stats
