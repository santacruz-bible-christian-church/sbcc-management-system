from datetime import date
from unittest.mock import patch

import pytest

from apps.members.models import Member
from apps.ministries.models import MinistryMember


@pytest.mark.django_db
class TestAnnouncementServices:
    """Tests for announcement services."""

    def test_get_recipients_all_audience(self, announcement):
        """Test get_announcement_recipients for 'all' audience."""
        from apps.announcements.services import get_announcement_recipients

        # Create some active members with emails (no User needed)
        Member.objects.create(
            first_name="John",
            last_name="Doe",
            email="john_svc@example.com",
            phone="1234567890",
            date_of_birth=date(1990, 1, 1),
            is_active=True,
        )
        Member.objects.create(
            first_name="Jane",
            last_name="Doe",
            email="jane_svc@example.com",
            phone="1234567891",
            date_of_birth=date(1992, 5, 15),
            is_active=True,
        )
        # Inactive member should be excluded
        Member.objects.create(
            first_name="Inactive",
            last_name="User",
            email="inactive_svc@example.com",
            phone="1234567892",
            date_of_birth=date(1985, 3, 20),
            is_active=False,
        )

        recipients = list(get_announcement_recipients(announcement))

        assert "john_svc@example.com" in recipients
        assert "jane_svc@example.com" in recipients
        assert "inactive_svc@example.com" not in recipients

    def test_get_recipients_ministry_audience(self, ministry_announcement, ministry, member):
        """Test get_announcement_recipients for ministry audience."""
        from apps.announcements.services import get_announcement_recipients

        # Add member to ministry
        MinistryMember.objects.get_or_create(
            member=member,
            ministry=ministry,
            defaults={"role": "volunteer", "is_active": True},
        )

        recipients = list(get_announcement_recipients(ministry_announcement))

        assert member.email in recipients

    def test_get_recipients_excludes_null_emails(self, announcement):
        """Test that null/empty emails are excluded from ministry audience."""
        from apps.announcements.services import get_announcement_recipients

        recipients = list(get_announcement_recipients(announcement))

        # Should not contain None or empty strings
        assert None not in recipients
        assert "" not in recipients

    @patch("apps.announcements.services.send_mass_mail")
    def test_send_announcement_email_marks_as_sent(self, mock_mail, announcement):
        """Test that send_announcement_email marks announcement as sent."""
        from apps.announcements.services import send_announcement_email

        # Create member with email (no User needed)
        Member.objects.create(
            first_name="Test",
            last_name="User",
            email="testmember_send@example.com",
            phone="1234567890",
            date_of_birth=date(1990, 1, 1),
            is_active=True,
        )

        mock_mail.return_value = 1

        result = send_announcement_email(announcement)

        assert result["success"] is True
        announcement.refresh_from_db()
        assert announcement.sent is True

    def test_send_announcement_email_no_recipients(self, announcement):
        """Test send_announcement_email with no recipients."""
        from apps.announcements.services import send_announcement_email

        result = send_announcement_email(announcement)

        assert result["success"] is False
        assert result["message"] == "No recipients found"
