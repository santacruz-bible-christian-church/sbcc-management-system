"""
Fixtures for attendance tests.
"""

from datetime import timedelta

import pytest
from django.utils import timezone

from apps.attendance.models import Attendance, AttendanceSheet
from apps.events.models import Event
from apps.members.models import Member


@pytest.fixture
def attendance_event(admin_user, ministry):
    """Create an event for attendance tracking."""
    return Event.objects.create(
        title="Sunday Service",
        event_type="service",
        status="published",
        date=timezone.now(),
        end_date=timezone.now() + timedelta(hours=2),
        location="Main Sanctuary",
        organizer=admin_user,
        ministry=ministry,
    )


@pytest.fixture
def attendance_sheet_factory(attendance_event):
    """Factory to create attendance sheets with custom parameters."""

    def _create_sheet(
        event=None,
        days_offset=0,
        notes="",
        **kwargs,
    ):
        defaults = {
            "event": event or attendance_event,
            "date": timezone.now().date() + timedelta(days=days_offset),
            "notes": notes,
        }
        defaults.update(kwargs)
        return AttendanceSheet.objects.create(**defaults)

    return _create_sheet


@pytest.fixture
def attendance_sheet(attendance_sheet_factory):
    """Create a basic attendance sheet."""
    return attendance_sheet_factory(notes="Regular Sunday attendance")


@pytest.fixture
def past_attendance_sheet(attendance_sheet_factory):
    """Create a past attendance sheet."""
    return attendance_sheet_factory(
        days_offset=-7,
        notes="Last week's attendance",
    )


@pytest.fixture
def attendance_member(db, ministry):
    """Create a member for attendance tests."""
    return Member.objects.create(
        first_name="Attendance",
        last_name="Member",
        email="attendance.member@example.com",
        ministry=ministry,
        status="active",
        is_active=True,
    )


@pytest.fixture
def second_attendance_member(db, ministry):
    """Create a second member for attendance tests."""
    return Member.objects.create(
        first_name="Second",
        last_name="Attendee",
        email="second.attendee@example.com",
        ministry=ministry,
        status="active",
        is_active=True,
    )


@pytest.fixture
def third_attendance_member(db, ministry):
    """Create a third member for attendance tests."""
    return Member.objects.create(
        first_name="Third",
        last_name="Attendee",
        email="third.attendee@example.com",
        ministry=ministry,
        status="active",
        is_active=True,
    )


@pytest.fixture
def attendance_record(attendance_sheet, attendance_member):
    """Create an attendance record (not yet marked present)."""
    return Attendance.objects.create(
        sheet=attendance_sheet,
        member=attendance_member,
        attended=False,
    )


@pytest.fixture
def present_attendance_record(attendance_sheet, second_attendance_member):
    """Create an attendance record marked as present."""
    return Attendance.objects.create(
        sheet=attendance_sheet,
        member=second_attendance_member,
        attended=True,
        check_in_time=timezone.now(),
    )
