"""
Tests for Attendance model properties and methods.
"""

import pytest
from django.utils import timezone

from apps.attendance.models import Attendance, AttendanceSheet


# =============================================================================
# AttendanceSheet Model Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceSheetModel:
    """Tests for AttendanceSheet model properties."""

    def test_total_attended_property(
        self, attendance_sheet, attendance_record, present_attendance_record
    ):
        """Test total_attended counts only present members."""
        # One absent, one present
        assert attendance_sheet.total_attended == 1

    def test_total_expected_property(
        self, attendance_sheet, attendance_record, present_attendance_record
    ):
        """Test total_expected counts all records."""
        assert attendance_sheet.total_expected == 2

    def test_attendance_rate_property(
        self, attendance_sheet, attendance_record, present_attendance_record
    ):
        """Test attendance_rate calculates percentage correctly."""
        # 1 present out of 2 = 50%
        assert attendance_sheet.attendance_rate == 50.0

    def test_attendance_rate_zero_when_no_records(self, attendance_sheet):
        """Test attendance_rate is 0 when no records exist."""
        assert attendance_sheet.attendance_rate == 0

    def test_string_representation(self, attendance_sheet):
        """Test __str__ method."""
        str_rep = str(attendance_sheet)
        assert attendance_sheet.event.title in str_rep
        assert str(attendance_sheet.date) in str_rep


# =============================================================================
# Attendance Model Tests
# =============================================================================
@pytest.mark.django_db
class TestAttendanceModel:
    """Tests for Attendance model methods."""

    def test_mark_present_method(self, attendance_record):
        """Test mark_present sets attended and check_in_time."""
        assert not attendance_record.attended
        assert attendance_record.check_in_time is None

        attendance_record.mark_present()

        assert attendance_record.attended
        assert attendance_record.check_in_time is not None

    def test_string_representation_present(self, present_attendance_record):
        """Test __str__ method for present record."""
        str_rep = str(present_attendance_record)
        assert present_attendance_record.member.full_name in str_rep
        assert "Present" in str_rep

    def test_string_representation_absent(self, attendance_record):
        """Test __str__ method for absent record."""
        str_rep = str(attendance_record)
        assert attendance_record.member.full_name in str_rep
        assert "Absent" in str_rep

    def test_unique_together_constraint(self, attendance_sheet, attendance_member):
        """Test that duplicate sheet+member combination is prevented."""
        Attendance.objects.create(
            sheet=attendance_sheet,
            member=attendance_member,
            attended=False,
        )

        with pytest.raises(Exception):  # IntegrityError
            Attendance.objects.create(
                sheet=attendance_sheet,
                member=attendance_member,
                attended=True,
            )
