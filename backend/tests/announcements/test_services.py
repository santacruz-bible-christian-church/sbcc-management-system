# tests/announcements/test_services.py
from datetime import date
from unittest.mock import patch

import pytest

from apps.members.models import Member
from apps.ministries.models import MinistryMember


@pytest.mark.django_db
class TestAnnouncementServices:
    """Tests for announcement services."""

    def test_get_recipients_all_audience(self, announcement, create_user):
        """Test get_announcement_recipients for 'all' audience."""
        from apps.announcements.services import get_announcement_recipients

        # Create users first (Member requires a user FK)
        user1 = create_user(
            username="john_svc", email="john_svc@example.com", password="TestPass123!"
        )
        user2 = create_user(
            username="jane_svc", email="jane_svc@example.com", password="TestPass123!"
        )
        user3 = create_user(
            username="inactive_svc",
            email="inactive_svc@example.com",
            password="TestPass123!",
        )

        # Create some active members with emails
        Member.objects.create(
            user=user1,
            first_name="John",
            last_name="Doe",
            email="john_svc@example.com",
            phone="1234567890",
            date_of_birth=date(1990, 1, 1),
            is_active=True,
        )
        Member.objects.create(
            user=user2,
            first_name="Jane",
            last_name="Doe",
            email="jane_svc@example.com",
            phone="1234567891",
            date_of_birth=date(1992, 5, 15),
            is_active=True,
        )
        # Inactive member should be excluded
        Member.objects.create(
            user=user3,
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

    def test_get_recipients_ministry_audience(self, ministry_announcement, ministry, user):
        """Test get_announcement_recipients for ministry audience."""
        from apps.announcements.services import get_announcement_recipients

        # Add user to ministry (user already exists from fixture)
        MinistryMember.objects.get_or_create(
            user=user,
            ministry=ministry,
            defaults={"role": "volunteer", "is_active": True},
        )

        recipients = list(get_announcement_recipients(ministry_announcement))

        assert user.email in recipients

    def test_get_recipients_excludes_null_emails(self, announcement, create_user):
        """Test that null/empty emails are excluded from ministry audience."""
        from apps.announcements.services import get_announcement_recipients

        recipients = list(get_announcement_recipients(announcement))

        # Should not contain None or empty strings
        assert None not in recipients
        assert "" not in recipients

    @patch("apps.announcements.services.send_mass_mail")
    def test_send_announcement_email_marks_as_sent(self, mock_mail, announcement, create_user):
        """Test that send_announcement_email marks announcement as sent."""
        from apps.announcements.services import send_announcement_email

        # Create user and member with unique email
        test_user = create_user(
            username="testmember_send",
            email="testmember_send@example.com",
            password="TestPass123!",
        )
        Member.objects.create(
            user=test_user,
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
