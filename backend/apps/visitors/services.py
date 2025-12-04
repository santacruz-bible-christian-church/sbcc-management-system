from datetime import date
from django.db import IntegrityError
from apps.visitors.models import VisitorAttendance


class AttendanceService:
    @staticmethod
    def update_follow_up(visitor):
        visit_count = visitor.attendance_records.count()

        if visit_count == 1:
            visitor.follow_up_status = "visited_1x"
        elif visit_count == 2:
            visitor.follow_up_status = "visited_2x"
        elif visit_count >= 3:
            visitor.follow_up_status = "regular"

        visitor.save()

    @staticmethod
    def check_in_visitor(visitor, service_date=None, user=None):
        if service_date is None:
            service_date = date.today()

        try:
            attendance = VisitorAttendance.objects.create(
                visitor=visitor,
                service_date=service_date,
                added_by=user,
            )

            # Update follow-up tracking
            AttendanceService.update_follow_up(visitor)

            return attendance, None

        except IntegrityError:
            return None, "Visitor has already been checked in for this service."
