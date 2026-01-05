"""
Tests for Attendance API permissions.
"""

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status


# =============================================================================
# AttendanceSheet Permissions
# =============================================================================
@pytest.mark.django_db
class TestAttendanceSheetPermissions:
    """Tests for attendance sheet permissions."""

    def test_list_requires_authentication(self, api_client, attendance_sheet):
        """Test that listing sheets requires authentication."""
        url = reverse("attendance-sheet-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_list(self, auth_client, attendance_sheet):
        """Test that authenticated users can list sheets."""
        url = reverse("attendance-sheet-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_authenticated_user_can_create(self, auth_client, attendance_event):
        """Test that authenticated users can create sheets."""
        url = reverse("attendance-sheet-list")
        response = auth_client.post(
            url,
            {
                "event": attendance_event.id,
                "date": timezone.now().date().isoformat(),
                "notes": "Test sheet",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_unauthenticated_cannot_create(self, api_client, attendance_event):
        """Test that unauthenticated users cannot create sheets."""
        url = reverse("attendance-sheet-list")
        response = api_client.post(
            url,
            {
                "event": attendance_event.id,
                "date": timezone.now().date().isoformat(),
            },
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_update(self, api_client, attendance_sheet):
        """Test that unauthenticated users cannot update sheets."""
        url = reverse("attendance-sheet-detail", kwargs={"pk": attendance_sheet.pk})
        response = api_client.patch(url, {"notes": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_delete(self, api_client, attendance_sheet):
        """Test that unauthenticated users cannot delete sheets."""
        url = reverse("attendance-sheet-detail", kwargs={"pk": attendance_sheet.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# =============================================================================
# Attendance Record Permissions
# =============================================================================
@pytest.mark.django_db
class TestAttendanceRecordPermissions:
    """Tests for attendance record permissions."""

    def test_list_requires_authentication(self, api_client, attendance_record):
        """Test that listing records requires authentication."""
        url = reverse("attendance-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_list(self, auth_client, attendance_record):
        """Test that authenticated users can list records."""
        url = reverse("attendance-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_cannot_create(self, api_client, attendance_sheet, attendance_member):
        """Test that unauthenticated users cannot create records."""
        url = reverse("attendance-list")
        response = api_client.post(
            url,
            {
                "sheet": attendance_sheet.id,
                "member": attendance_member.id,
                "attended": True,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
