from datetime import date, timedelta

import pytest

from apps.visitors.models import VisitorAttendance
from apps.visitors.services import AttendanceService


@pytest.mark.django_db
class TestAttendanceService:
    """Test AttendanceService business logic."""

    def test_check_in_first_visit(self, visitor, admin_user):
        """PRD: First check-in sets follow_up_status to 'visited_1x'."""
        # Reset visitor to have no attendance
        visitor.attendance_records.all().delete()
        visitor.follow_up_status = "visited_1x"
        visitor.is_first_time = True
        visitor.save()

        attendance, error = AttendanceService.check_in_visitor(
            visitor=visitor,
            service_date=date.today(),
            user=admin_user,
        )

        assert error is None
        assert attendance is not None
        visitor.refresh_from_db()
        assert visitor.follow_up_status == "visited_1x"
        assert visitor.is_first_time is True

    def test_check_in_second_visit(self, visitor, admin_user):
        """PRD: Second check-in sets follow_up_status to 'visited_2x'."""
        # Create first attendance
        VisitorAttendance.objects.create(
            visitor=visitor,
            service_date=date.today() - timedelta(days=7),
            added_by=admin_user,
        )

        attendance, error = AttendanceService.check_in_visitor(
            visitor=visitor,
            service_date=date.today(),
            user=admin_user,
        )

        assert error is None
        visitor.refresh_from_db()
        assert visitor.follow_up_status == "visited_2x"
        assert visitor.is_first_time is False

    def test_check_in_third_visit_becomes_regular(self, visitor, admin_user):
        """PRD: Third+ check-in sets follow_up_status to 'regular'."""
        # Create two prior attendances
        VisitorAttendance.objects.create(
            visitor=visitor,
            service_date=date.today() - timedelta(days=14),
            added_by=admin_user,
        )
        VisitorAttendance.objects.create(
            visitor=visitor,
            service_date=date.today() - timedelta(days=7),
            added_by=admin_user,
        )

        attendance, error = AttendanceService.check_in_visitor(
            visitor=visitor,
            service_date=date.today(),
            user=admin_user,
        )

        assert error is None
        visitor.refresh_from_db()
        assert visitor.follow_up_status == "regular"
        assert visitor.is_first_time is False

    def test_check_in_duplicate_returns_error(self, visitor, admin_user):
        """Duplicate check-in on same date returns error."""
        AttendanceService.check_in_visitor(
            visitor=visitor,
            service_date=date.today(),
            user=admin_user,
        )

        attendance, error = AttendanceService.check_in_visitor(
            visitor=visitor,
            service_date=date.today(),
            user=admin_user,
        )

        assert attendance is None
        assert error == "Visitor has already been checked in for this service."

    def test_check_in_defaults_to_today(self, visitor, admin_user):
        """Check-in without service_date defaults to today."""
        attendance, error = AttendanceService.check_in_visitor(
            visitor=visitor,
            user=admin_user,
        )

        assert attendance.service_date == date.today()
