from datetime import date, time, timedelta

import pytest
from django.utils import timezone


@pytest.fixture
def member_with_email(db):
    """Create a Member with an email address."""
    from apps.members.models import Member

    return Member.objects.create(
        first_name="John",
        last_name="Doe",
        email="john.doe@example.com",
        phone="1234567890",
        is_active=True,
    )


@pytest.fixture
def member_without_email(db):
    """Create a Member without an email address."""
    from apps.members.models import Member

    return Member.objects.create(
        first_name="Jane",
        last_name="Smith",
        email="",  # No email
        phone="0987654321",
        is_active=True,
    )


@pytest.fixture
def test_ministry(db, ministry_leader_user):
    """Create a test ministry."""
    from apps.ministries.models import Ministry

    return Ministry.objects.create(
        name="Test Music Ministry",
        description="Test ministry for rotation tests",
        leader=ministry_leader_user,
        is_active=True,
    )


@pytest.fixture
def ministry_member_with_email(db, test_ministry, member_with_email):
    """Create a MinistryMember linking a member with email to a ministry."""
    from apps.ministries.models import MinistryMember

    return MinistryMember.objects.create(
        member=member_with_email,
        ministry=test_ministry,
        role="volunteer",
        is_active=True,
        available_days=["Sunday", "Saturday"],
        max_consecutive_shifts=3,
    )


@pytest.fixture
def ministry_member_without_email(db, test_ministry, member_without_email):
    """Create a MinistryMember linking a member without email to a ministry."""
    from apps.ministries.models import MinistryMember

    return MinistryMember.objects.create(
        member=member_without_email,
        ministry=test_ministry,
        role="volunteer",
        is_active=True,
        available_days=["Sunday"],
        max_consecutive_shifts=2,
    )


@pytest.fixture
def upcoming_shift(db, test_ministry):
    """Create a shift for the upcoming Sunday."""
    from apps.ministries.models import Shift

    # Find next Sunday
    today = timezone.now().date()
    days_until_sunday = (6 - today.weekday()) % 7
    if days_until_sunday == 0:
        days_until_sunday = 7  # If today is Sunday, get next Sunday
    next_sunday = today + timedelta(days=days_until_sunday)

    return Shift.objects.create(
        ministry=test_ministry,
        date=next_sunday,
        start_time=time(9, 0),
        end_time=time(12, 0),
        notes="Sunday morning service",
    )


@pytest.fixture
def multiple_weekend_shifts(db, test_ministry):
    """Create multiple unassigned weekend shifts for testing rotation (matches volunteer availability)."""
    from apps.ministries.models import Shift

    today = timezone.now().date()
    shifts = []

    # Create shifts only on weekends (Saturday=5, Sunday=6)
    for i in range(1, 22):  # Look ahead 3 weeks to find enough weekend days
        shift_date = today + timedelta(days=i)
        if shift_date.weekday() in [5, 6]:  # Saturday or Sunday
            shift = Shift.objects.create(
                ministry=test_ministry,
                date=shift_date,
                start_time=time(9, 0),
                end_time=time(12, 0),
                notes=f"Weekend Shift on {shift_date.strftime('%A')}",
            )
            shifts.append(shift)
            if len(shifts) >= 5:  # Create at least 5 weekend shifts
                break

    return shifts
