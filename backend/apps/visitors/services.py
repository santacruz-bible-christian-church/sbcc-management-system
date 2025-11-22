from datetime import date

from django.db import IntegrityError

from .models import VisitorAttendance


class AttendanceService:
    """Service class for visitor attendance operations."""

    @staticmethod
    def check_in_visitor(visitor, service_date=None, user=None):
        """
        Check in a visitor for a service and auto-update follow_up_status.

        Args:
            visitor: Visitor instance
            service_date: Date of the service (defaults to today)
            user: User who is checking in the visitor

        Returns:
            tuple: (VisitorAttendance instance, error message or None)
        """
        if service_date is None:
            service_date = date.today()

        try:
            attendance = VisitorAttendance.objects.create(
                visitor=visitor,
                service_date=service_date,
                added_by=user,
            )

            # Auto-update follow_up_status based on visit count
            visit_count = visitor.attendance_records.count()

            if visit_count == 1:
                visitor.follow_up_status = "visited_1x"
                visitor.is_first_time = True
            elif visit_count == 2:
                visitor.follow_up_status = "visited_2x"
                visitor.is_first_time = False
            elif visit_count >= 3:
                visitor.follow_up_status = "regular"
                visitor.is_first_time = False

            visitor.save(update_fields=["follow_up_status", "is_first_time", "updated_at"])

            return attendance, None

        except IntegrityError:
            return None, "Visitor has already been checked in for this service."
