# tests/visitors/test_models.py
"""
Model tests for Visitors module.

PRD Requirements Covered:
- Record attendance of attendees NOT in membership list
- Mark as Visitor or Member
- Follow-up tracking: "Visited 1x", "Visited 2x", "Regular Visitor"
"""

from datetime import date

import pytest

from apps.visitors.models import Visitor, VisitorAttendance


@pytest.mark.django_db
class TestVisitorModel:
    """Test Visitor model behavior."""

    def test_visitor_creation_defaults(self):
        """PRD: New visitor should default to 'visitor' status and 'visited_1x'."""
        visitor = Visitor.objects.create(full_name="Test Visitor")

        assert visitor.status == "visitor"
        assert visitor.follow_up_status == "visited_1x"
        assert visitor.is_first_time is True
        assert visitor.converted_to_member is None

    def test_visitor_str_representation(self, visitor):
        """Visitor string representation is full_name."""
        assert str(visitor) == "Jane Smith"

    def test_visit_count_property(self, visitor_with_attendance):
        """visit_count property returns correct attendance count."""
        assert visitor_with_attendance.visit_count == 2

    def test_visitor_status_choices(self):
        """PRD: Status must be 'visitor' or 'member'."""
        valid_statuses = ["visitor", "member"]
        choices = [choice[0] for choice in Visitor.STATUS_CHOICES]
        assert choices == valid_statuses

    def test_follow_up_status_choices(self):
        """PRD: Follow-up options are visited_1x, visited_2x, regular."""
        valid_follow_ups = ["visited_1x", "visited_2x", "regular"]
        choices = [choice[0] for choice in Visitor.FOLLOW_UP_CHOICES]
        assert choices == valid_follow_ups

    def test_visitor_ordering(self, multiple_visitors):
        """Visitors are ordered by date_added descending."""
        visitors = list(Visitor.objects.all())
        # Most recent first
        assert visitors[0].full_name == "Converted Member"


@pytest.mark.django_db
class TestVisitorAttendanceModel:
    """Test VisitorAttendance model behavior."""

    def test_attendance_creation(self, visitor, admin_user):
        """Attendance record links visitor, date, and user."""
        attendance = VisitorAttendance.objects.create(
            visitor=visitor,
            service_date=date.today(),
            added_by=admin_user,
        )

        assert attendance.visitor == visitor
        assert attendance.service_date == date.today()
        assert attendance.added_by == admin_user

    def test_attendance_unique_constraint(self, visitor, admin_user):
        """Visitor cannot have duplicate attendance on same date."""
        VisitorAttendance.objects.create(
            visitor=visitor,
            service_date=date.today(),
            added_by=admin_user,
        )

        with pytest.raises(Exception):  # IntegrityError
            VisitorAttendance.objects.create(
                visitor=visitor,
                service_date=date.today(),
                added_by=admin_user,
            )

    def test_attendance_str_representation(self, visitor, admin_user):
        """Attendance string shows visitor name and date."""
        attendance = VisitorAttendance.objects.create(
            visitor=visitor,
            service_date=date(2025, 12, 1),
            added_by=admin_user,
        )
        assert str(attendance) == "Jane Smith - 2025-12-01"
