"""
Tests for Attendance Services.
Covers pastoral care emails, absence notifications, and report generation.
"""

from datetime import timedelta
from unittest.mock import patch

import pytest
from django.core import mail
from django.utils import timezone

from apps.attendance.models import Attendance, AttendanceSheet
from apps.attendance.services import notify_inactive_members, send_pastoral_care_email
from apps.members.models import Member


# =============================================================================
# Pastoral Care Email Tests
# =============================================================================
@pytest.mark.django_db
class TestPastoralCareEmail:
    """Tests for pastoral care email functionality."""

    def test_send_pastoral_care_email_success(self, attendance_member):
        """Test sending a pastoral care email to a member with email."""
        result = send_pastoral_care_email(attendance_member)

        assert result is True
        assert len(mail.outbox) == 1
        assert "miss you" in mail.outbox[0].subject.lower()
        assert attendance_member.first_name in mail.outbox[0].body
        assert attendance_member.email in mail.outbox[0].to

    def test_send_pastoral_care_email_no_email(self, attendance_member):
        """Test that email is not sent if member has no email."""
        attendance_member.email = ""
        attendance_member.save()

        result = send_pastoral_care_email(attendance_member)

        assert result is False
        assert len(mail.outbox) == 0

    def test_send_pastoral_care_email_custom_church_name(self, attendance_member):
        """Test sending email with custom church name."""
        custom_name = "Test Church of God"
        send_pastoral_care_email(attendance_member, church_name=custom_name)

        assert custom_name in mail.outbox[0].subject
        assert custom_name in mail.outbox[0].body

    @patch("apps.attendance.services.send_mail")
    def test_send_pastoral_care_email_handles_failure(self, mock_send_mail, attendance_member):
        """Test that email failure returns False."""
        mock_send_mail.side_effect = Exception("SMTP Error")

        result = send_pastoral_care_email(attendance_member)

        assert result is False


# =============================================================================
# Notify Inactive Members Tests
# =============================================================================
@pytest.mark.django_db
class TestNotifyInactiveMembers:
    """Tests for notifying inactive members in bulk."""

    @pytest.fixture
    def member_with_absences(self, db, ministry, attendance_sheet_factory):
        """Create a member with multiple absences."""
        member = Member.objects.create(
            first_name="Absent",
            last_name="Member",
            email="absent.member@example.com",
            ministry=ministry,
            status="active",
            is_active=True,
            consecutive_absences=5,
        )

        # Create multiple attendance sheets with absences
        for i in range(5):
            sheet = attendance_sheet_factory(days_offset=-i * 7)
            Attendance.objects.create(
                sheet=sheet,
                member=member,
                attended=False,
            )

        return member

    @pytest.fixture
    def member_without_email(self, db, ministry, attendance_sheet_factory):
        """Create an absent member without email."""
        member = Member.objects.create(
            first_name="No",
            last_name="Email",
            email="",  # No email
            ministry=ministry,
            status="active",
            is_active=True,
            consecutive_absences=5,  # This is checked by check_frequent_absences
        )

        # Use different date offsets to avoid unique constraint with other fixtures
        # but within the detection range (60 days)
        for i in range(3):
            sheet = attendance_sheet_factory(days_offset=(-1 - i))  # -1, -2, -3 days ago
            Attendance.objects.create(
                sheet=sheet,
                member=member,
                attended=False,
            )

        return member

    def test_notify_inactive_members_dry_run(self, member_with_absences):
        """Test dry run mode returns list without sending emails."""
        results = notify_inactive_members(threshold=3, days=60, dry_run=True)

        assert results["dry_run"] is True
        assert results["members_found"] >= 1
        assert results["emails_sent"] == 0
        assert len(mail.outbox) == 0

        # Find the member in results
        member_found = any(m["member_id"] == member_with_absences.id for m in results["members"])
        assert member_found

    def test_notify_inactive_members_sends_emails(self, member_with_absences):
        """Test that emails are sent when dry_run is False."""
        results = notify_inactive_members(threshold=3, days=60, dry_run=False)

        assert results["dry_run"] is False
        assert results["emails_sent"] >= 1
        assert len(mail.outbox) >= 1

    def test_notify_inactive_members_skips_no_email(self, member_without_email):
        """Test that members without email are skipped."""
        results = notify_inactive_members(threshold=3, days=60, dry_run=False)

        assert results["skipped_no_email"] >= 1

        # Find the no-email member in skipped
        skipped = [m for m in results["members"] if m["status"] == "skipped_no_email"]
        assert len(skipped) >= 1

    def test_notify_inactive_members_returns_correct_structure(self, member_with_absences):
        """Test that return structure contains all expected fields."""
        results = notify_inactive_members(threshold=3, days=60, dry_run=True)

        # Check top-level keys
        assert "members_found" in results
        assert "emails_sent" in results
        assert "emails_failed" in results
        assert "skipped_no_email" in results
        assert "dry_run" in results
        assert "members" in results

        # Check member entry structure
        if results["members"]:
            member_entry = results["members"][0]
            assert "member_id" in member_entry
            assert "member_name" in member_entry
            assert "email" in member_entry
            assert "absences" in member_entry
            assert "status" in member_entry


# =============================================================================
# API Endpoint Tests for Notify Inactive
# =============================================================================
@pytest.mark.django_db
class TestNotifyInactiveAPI:
    """Tests for the notify_inactive API endpoint."""

    def test_notify_inactive_endpoint_dry_run(self, admin_client, attendance_member):
        """Test calling notify_inactive endpoint with dry_run."""
        from django.urls import reverse

        url = reverse("attendance-sheet-notify-inactive")
        response = admin_client.post(
            url,
            {"threshold": 3, "days": 30, "dry_run": True},
            format="json",
        )

        assert response.status_code == 200
        assert response.data["dry_run"] is True
        assert "members_found" in response.data
        assert "members" in response.data

    def test_notify_inactive_endpoint_requires_auth(self, client):
        """Test that endpoint requires authentication."""
        from django.urls import reverse

        url = reverse("attendance-sheet-notify-inactive")
        response = client.post(url, {"dry_run": True}, format="json")

        assert response.status_code == 401

    def test_notify_inactive_endpoint_default_dry_run(self, admin_client):
        """Test that endpoint defaults to dry_run=True for safety."""
        from django.urls import reverse

        url = reverse("attendance-sheet-notify-inactive")
        response = admin_client.post(url, {}, format="json")

        assert response.status_code == 200
        assert response.data["dry_run"] is True
