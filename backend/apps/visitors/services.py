from datetime import date
from django.db import IntegrityError
from visitors.models import VisitorAttendance

class AttendanceService:
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
            return attendance, None

        except IntegrityError:
            return None, "Visitor has already been checked in for this service."
