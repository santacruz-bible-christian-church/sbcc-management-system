"""
Tests for Attendance API endpoints.
Covers CRUD operations, custom actions, filtering, and integration tests.
"""

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.attendance.models import Attendance, AttendanceSheet
from apps.members.models import Member


# =============================================================================
# AttendanceSheet CRUD Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceSheetCRUD:
    """Tests for attendance sheet CRUD operations."""

    def test_create_sheet(self, admin_client, attendance_event):
        """Test creating an attendance sheet."""
        url = reverse("attendance-sheet-list")
        response = admin_client.post(
            url,
            {
                "event": attendance_event.id,
                "date": timezone.now().date().isoformat(),
                "notes": "Sunday Service Attendance",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["event"] == attendance_event.id
        assert AttendanceSheet.objects.filter(notes="Sunday Service Attendance").exists()

    def test_create_sheet_auto_creates_attendance_records(
        self, admin_client, attendance_event, attendance_member, second_attendance_member
    ):
        """Test that creating a sheet auto-creates attendance records for active members."""
        url = reverse("attendance-sheet-list")
        response = admin_client.post(
            url,
            {
                "event": attendance_event.id,
                "date": (timezone.now().date() + timedelta(days=1)).isoformat(),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        sheet_id = response.data["id"]

        # Check that attendance records were created
        records = Attendance.objects.filter(sheet_id=sheet_id)
        assert records.count() >= 2  # At least for our test members

    def test_retrieve_sheet(self, auth_client, attendance_sheet):
        """Test retrieving an attendance sheet."""
        url = reverse("attendance-sheet-detail", kwargs={"pk": attendance_sheet.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "attendance_records" in response.data  # Detail serializer
        assert response.data["event_title"] == "Sunday Service"

    def test_update_sheet(self, admin_client, attendance_sheet):
        """Test updating an attendance sheet."""
        url = reverse("attendance-sheet-detail", kwargs={"pk": attendance_sheet.pk})
        response = admin_client.patch(
            url,
            {"notes": "Updated notes"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        attendance_sheet.refresh_from_db()
        assert attendance_sheet.notes == "Updated notes"

    def test_delete_sheet(self, admin_client, attendance_sheet):
        """Test deleting an attendance sheet."""
        url = reverse("attendance-sheet-detail", kwargs={"pk": attendance_sheet.pk})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not AttendanceSheet.objects.filter(pk=attendance_sheet.pk).exists()


# =============================================================================
# AttendanceSheet Custom Actions Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceSheetActions:
    """Tests for attendance sheet custom actions."""

    def test_update_attendances_bulk(
        self, admin_client, attendance_sheet, attendance_record, present_attendance_record
    ):
        """Test bulk updating attendance records."""
        url = reverse("attendance-sheet-update-attendances", kwargs={"pk": attendance_sheet.pk})
        response = admin_client.post(
            url,
            {
                "attendances": [
                    {"member": attendance_record.member.id, "attended": True},
                    {"member": present_attendance_record.member.id, "attended": False},
                ]
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["updated_count"] == 2

        # Verify changes
        attendance_record.refresh_from_db()
        present_attendance_record.refresh_from_db()
        assert attendance_record.attended is True
        assert present_attendance_record.attended is False

    def test_mark_present(self, admin_client, attendance_sheet, attendance_record):
        """Test marking a single member as present."""
        url = reverse("attendance-sheet-mark-present", kwargs={"pk": attendance_sheet.pk})
        response = admin_client.post(
            url,
            {"member": attendance_record.member.id},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "marked as present" in response.data["message"].lower()

        attendance_record.refresh_from_db()
        assert attendance_record.attended is True
        assert attendance_record.check_in_time is not None

    def test_mark_present_requires_member(self, admin_client, attendance_sheet):
        """Test that mark_present requires member ID."""
        url = reverse("attendance-sheet-mark-present", kwargs={"pk": attendance_sheet.pk})
        response = admin_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "member" in response.data["error"].lower()

    def test_mark_present_not_found(self, admin_client, attendance_sheet):
        """Test mark_present with non-existent attendance record."""
        url = reverse("attendance-sheet-mark-present", kwargs={"pk": attendance_sheet.pk})
        response = admin_client.post(url, {"member": 99999}, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_stats_endpoint(self, admin_client, attendance_sheet, attendance_record):
        """Test getting attendance statistics."""
        url = reverse("attendance-sheet-stats")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "total_sheets" in response.data
        assert "this_month" in response.data
        assert "total_records" in response.data
        assert "average_attendance_rate" in response.data

    def test_download_csv(self, admin_client, attendance_sheet, present_attendance_record):
        """Test downloading attendance sheet as CSV."""
        url = reverse("attendance-sheet-download", kwargs={"pk": attendance_sheet.pk})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "text/csv"
        assert "attachment" in response["Content-Disposition"]

    def test_check_absences(self, admin_client, attendance_sheet, attendance_record):
        """Test checking for frequent absences."""
        url = reverse("attendance-sheet-check-absences")
        response = admin_client.get(url, {"threshold": 1, "days": 30})

        assert response.status_code == status.HTTP_200_OK
        assert "threshold" in response.data
        assert "days" in response.data
        assert "problem_members" in response.data


# =============================================================================
# Attendance Record CRUD Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceRecordCRUD:
    """Tests for attendance record CRUD operations."""

    def test_create_record(self, admin_client, attendance_sheet, third_attendance_member):
        """Test creating an attendance record."""
        url = reverse("attendance-list")
        response = admin_client.post(
            url,
            {
                "sheet": attendance_sheet.id,
                "member": third_attendance_member.id,
                "attended": True,
                "notes": "Arrived early",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Attendance.objects.filter(
            sheet=attendance_sheet, member=third_attendance_member
        ).exists()

    def test_retrieve_record(self, auth_client, attendance_record):
        """Test retrieving an attendance record."""
        url = reverse("attendance-detail", kwargs={"pk": attendance_record.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["member_name"] == attendance_record.member.full_name

    def test_update_record(self, admin_client, attendance_record):
        """Test updating an attendance record."""
        url = reverse("attendance-detail", kwargs={"pk": attendance_record.pk})
        response = admin_client.patch(
            url,
            {"attended": True, "notes": "Late arrival"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        attendance_record.refresh_from_db()
        assert attendance_record.attended is True
        assert attendance_record.notes == "Late arrival"

    def test_delete_record(self, admin_client, attendance_record):
        """Test deleting an attendance record."""
        url = reverse("attendance-detail", kwargs={"pk": attendance_record.pk})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Attendance.objects.filter(pk=attendance_record.pk).exists()


# =============================================================================
# Attendance Record Custom Actions Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceRecordActions:
    """Tests for attendance record custom actions."""

    def test_member_summary(self, admin_client, attendance_record, attendance_member):
        """Test getting member attendance summary."""
        url = reverse("attendance-member-summary")
        response = admin_client.get(url, {"member": attendance_member.id})

        assert response.status_code == status.HTTP_200_OK

    def test_member_summary_requires_member(self, admin_client):
        """Test that member_summary requires member parameter."""
        url = reverse("attendance-member-summary")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "member" in response.data["error"].lower()

    def test_ministry_report(self, admin_client, ministry, attendance_record):
        """Test getting ministry attendance report."""
        url = reverse("attendance-ministry-report")
        response = admin_client.get(url, {"ministry": ministry.id})

        assert response.status_code == status.HTTP_200_OK

    def test_ministry_report_requires_ministry(self, admin_client):
        """Test that ministry_report requires ministry parameter."""
        url = reverse("attendance-ministry-report")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "ministry" in response.data["error"].lower()


# =============================================================================
# Filter and Search Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceFiltering:
    """Tests for attendance filtering."""

    def test_filter_sheets_by_event(self, admin_client, attendance_sheet, attendance_event):
        """Test filtering sheets by event."""
        url = reverse("attendance-sheet-list")
        response = admin_client.get(url, {"event": attendance_event.id})

        assert response.status_code == status.HTTP_200_OK
        assert all(s["event"] == attendance_event.id for s in response.data["results"])

    def test_filter_records_by_attended(
        self, admin_client, attendance_record, present_attendance_record
    ):
        """Test filtering records by attended status."""
        url = reverse("attendance-list")
        response = admin_client.get(url, {"attended": "true"})

        assert response.status_code == status.HTTP_200_OK
        assert all(r["attended"] is True for r in response.data["results"])

    def test_search_records_by_member_name(self, admin_client, attendance_record):
        """Test searching records by member name."""
        url = reverse("attendance-list")
        response = admin_client.get(url, {"search": "Attendance"})

        assert response.status_code == status.HTTP_200_OK


# =============================================================================
# Integration Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceIntegration:
    """Integration tests for complete workflows."""

    def test_complete_attendance_workflow(
        self, admin_client, attendance_event, attendance_member, second_attendance_member
    ):
        """Test complete attendance workflow: create sheet, mark attendance, get stats."""
        # 1. Create attendance sheet
        sheet_url = reverse("attendance-sheet-list")
        response = admin_client.post(
            sheet_url,
            {
                "event": attendance_event.id,
                "date": (timezone.now().date() + timedelta(days=2)).isoformat(),
                "notes": "Integration test",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        sheet_id = response.data["id"]

        # 2. Get or create attendance records (sheet auto-creates for active members)
        record1, _ = Attendance.objects.get_or_create(
            sheet_id=sheet_id, member=attendance_member, defaults={"attended": False}
        )
        record2, _ = Attendance.objects.get_or_create(
            sheet_id=sheet_id, member=second_attendance_member, defaults={"attended": False}
        )

        # 3. Bulk update attendance
        update_url = reverse("attendance-sheet-update-attendances", kwargs={"pk": sheet_id})
        response = admin_client.post(
            update_url,
            {
                "attendances": [
                    {"member": attendance_member.id, "attended": True},
                    {"member": second_attendance_member.id, "attended": True},
                ]
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # 4. Verify sheet shows correct stats
        detail_url = reverse("attendance-sheet-detail", kwargs={"pk": sheet_id})
        response = admin_client.get(detail_url)
        assert response.data["total_attended"] == 2
        assert response.data["attendance_rate"] == 100.0

        # 5. Download CSV
        download_url = reverse("attendance-sheet-download", kwargs={"pk": sheet_id})
        response = admin_client.get(download_url)
        assert response.status_code == status.HTTP_200_OK
        assert "csv" in response["Content-Type"]
