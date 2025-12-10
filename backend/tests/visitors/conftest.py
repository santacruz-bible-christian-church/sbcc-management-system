from datetime import date, timedelta

import pytest

from apps.visitors.models import Visitor, VisitorAttendance


@pytest.fixture
def visitor_data():
    """Basic visitor data for creation."""
    return {
        "full_name": "John Doe",
        "phone": "09171234567",
        "email": "john.doe@example.com",
        "notes": "First time visitor from nearby town",
    }


@pytest.fixture
def visitor(db):
    """Create a single visitor instance."""
    return Visitor.objects.create(
        full_name="Jane Smith",
        phone="09179876543",
        email="jane.smith.visitor@example.com",
        is_first_time=True,
        status="visitor",
        follow_up_status="visited_1x",
    )


@pytest.fixture
def visitor_with_attendance(db, admin_user):
    """Visitor with existing attendance records (separate instance)."""
    visitor = Visitor.objects.create(
        full_name="Jane Smith",
        phone="09179876543",
        email="jane.attendance@example.com",
        is_first_time=False,
        status="visitor",
        follow_up_status="visited_2x",
    )
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
    return visitor


@pytest.fixture
def multiple_visitors(db):
    """Create multiple visitors with different statuses."""
    visitors = [
        Visitor.objects.create(
            full_name="Visitor One",
            follow_up_status="visited_1x",
            status="visitor",
        ),
        Visitor.objects.create(
            full_name="Visitor Two",
            follow_up_status="visited_2x",
            status="visitor",
        ),
        Visitor.objects.create(
            full_name="Visitor Three",
            follow_up_status="regular",
            status="visitor",
        ),
        Visitor.objects.create(
            full_name="Converted Member",
            follow_up_status="regular",
            status="member",
        ),
    ]
    return visitors
