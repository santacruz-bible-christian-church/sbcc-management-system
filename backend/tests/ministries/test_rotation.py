"""
Tests for ministry shift rotation and email notification functionality.
"""

from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status

from apps.ministries.models import Assignment
from apps.ministries.utils import rotate_and_assign


# =============================================================================
# Rotation Utility Tests
# =============================================================================
@pytest.mark.django_db
class TestRotateAndAssign:
    """Tests for the rotate_and_assign utility function."""

    def test_rotation_creates_assignments(
        self, test_ministry, ministry_member_with_email, upcoming_shift
    ):
        """Test that rotation creates assignments for unassigned shifts."""
        summary = rotate_and_assign(
            ministry_ids=[test_ministry.id],
            days=14,
            dry_run=False,
            notify=False,
        )

        assert summary["created"] == 1
        assert summary["emailed"] == 0
        assert Assignment.objects.filter(shift=upcoming_shift).exists()

    def test_rotation_dry_run_no_changes(
        self, test_ministry, ministry_member_with_email, upcoming_shift
    ):
        """Test that dry run doesn't create actual assignments."""
        summary = rotate_and_assign(
            ministry_ids=[test_ministry.id],
            days=14,
            dry_run=True,
            notify=False,
        )

        assert summary["created"] == 1  # Would be created
        assert not Assignment.objects.filter(shift=upcoming_shift).exists()

    def test_rotation_skips_ministry_with_no_members(self, test_ministry, upcoming_shift):
        """Test that rotation skips ministries with no active members."""
        summary = rotate_and_assign(
            ministry_ids=[test_ministry.id],
            days=14,
            dry_run=False,
            notify=False,
        )

        assert summary["created"] == 0
        assert test_ministry.id in summary["skipped_no_members"]

    @patch("apps.ministries.utils.send_mail")
    def test_rotation_sends_email_when_notify_true(
        self, mock_send_mail, test_ministry, ministry_member_with_email, upcoming_shift
    ):
        """Test that email is sent when notify=True and member has email."""
        summary = rotate_and_assign(
            ministry_ids=[test_ministry.id],
            days=14,
            dry_run=False,
            notify=True,
        )

        assert summary["created"] == 1
        assert summary["emailed"] == 1
        assert summary["skipped_no_email"] == 0
        mock_send_mail.assert_called_once()

    @patch("apps.ministries.utils.send_mail")
    def test_rotation_tracks_skipped_no_email(
        self, mock_send_mail, test_ministry, ministry_member_without_email, upcoming_shift
    ):
        """Test that rotation tracks when emails are skipped due to missing address."""
        summary = rotate_and_assign(
            ministry_ids=[test_ministry.id],
            days=14,
            dry_run=False,
            notify=True,
        )

        assert summary["created"] == 1
        assert summary["emailed"] == 0
        assert summary["skipped_no_email"] == 1
        mock_send_mail.assert_not_called()

    @patch("apps.ministries.utils.send_mail")
    def test_rotation_handles_email_failure(
        self, mock_send_mail, test_ministry, ministry_member_with_email, upcoming_shift
    ):
        """Test that rotation handles email sending failures gracefully."""
        mock_send_mail.side_effect = Exception("SMTP connection failed")

        summary = rotate_and_assign(
            ministry_ids=[test_ministry.id],
            days=14,
            dry_run=False,
            notify=True,
        )

        assert summary["created"] == 1
        assert summary["emailed"] == 0
        assert len(summary["errors"]) == 1
        assert "SMTP connection failed" in summary["errors"][0]

    def test_rotation_respects_limit_per_ministry(
        self, test_ministry, ministry_member_with_email, multiple_weekend_shifts
    ):
        """Test that rotation respects the limit_per_ministry parameter."""
        summary = rotate_and_assign(
            ministry_ids=[test_ministry.id],
            days=30,
            dry_run=False,
            notify=False,
            limit_per_ministry=3,
        )

        assert summary["created"] == 3
        assert Assignment.objects.filter(shift__ministry=test_ministry).count() == 3


# =============================================================================
# API Endpoint Tests
# =============================================================================
@pytest.mark.django_db
class TestRotateShiftsAPI:
    """Tests for the rotate_shifts API endpoint."""

    def test_rotate_shifts_requires_authentication(self, api_client, test_ministry):
        """Test that the endpoint requires authentication."""
        url = reverse("ministry-rotate-shifts", kwargs={"pk": test_ministry.id})
        response = api_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_rotate_shifts_as_admin(
        self, admin_client, test_ministry, ministry_member_with_email, upcoming_shift
    ):
        """Test that admin can rotate shifts."""
        url = reverse("ministry-rotate-shifts", kwargs={"pk": test_ministry.id})
        response = admin_client.post(
            url,
            {"days": 14, "dry_run": True, "notify": False},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "created" in response.data

    def test_rotate_shifts_as_pastor(
        self, pastor_client, test_ministry, ministry_member_with_email, upcoming_shift
    ):
        """Test that pastor cannot rotate shifts."""
        url = reverse("ministry-rotate-shifts", kwargs={"pk": test_ministry.id})
        response = pastor_client.post(
            url,
            {"days": 14, "dry_run": True, "notify": False},
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_rotate_shifts_returns_skipped_no_email(
        self, admin_client, test_ministry, ministry_member_without_email, upcoming_shift
    ):
        """Test that API response includes skipped_no_email count."""
        url = reverse("ministry-rotate-shifts", kwargs={"pk": test_ministry.id})
        response = admin_client.post(
            url,
            {"days": 14, "dry_run": False, "notify": True},
            format="json",
        )

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_207_MULTI_STATUS]
        assert "skipped_no_email" in response.data
        assert response.data["skipped_no_email"] == 1

    @patch("apps.ministries.utils.send_mail")
    def test_rotate_shifts_with_notify_true(
        self,
        mock_send_mail,
        admin_client,
        test_ministry,
        ministry_member_with_email,
        upcoming_shift,
    ):
        """Test that API sends emails when notify=True."""
        url = reverse("ministry-rotate-shifts", kwargs={"pk": test_ministry.id})
        response = admin_client.post(
            url,
            {"days": 14, "dry_run": False, "notify": True},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["emailed"] == 1
        mock_send_mail.assert_called_once()
