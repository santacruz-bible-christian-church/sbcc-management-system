"""
Fixtures for members tests.
"""

from datetime import date, timedelta

import pytest

from apps.members.models import FamilyMember, Member


@pytest.fixture
def member_factory(ministry):
    """Factory to create members with custom parameters."""

    def _create_member(
        first_name="Test",
        last_name="Member",
        email=None,
        status="active",
        gender=None,
        date_of_birth=None,
        **kwargs,
    ):
        if email is None:
            # Generate unique email
            import uuid

            email = f"test.{uuid.uuid4().hex[:8]}@example.com"

        defaults = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": "",
            "gender": gender,
            "date_of_birth": date_of_birth,
            "status": status,
            "is_active": status == "active",
            "ministry": ministry,
        }
        defaults.update(kwargs)
        return Member.objects.create(**defaults)

    return _create_member


@pytest.fixture
def member(member_factory):
    """Create a basic active member."""
    return member_factory(
        first_name="John",
        last_name="Doe",
        email="john.doe@example.com",
        gender="male",
    )


@pytest.fixture
def inactive_member(member_factory):
    """Create an inactive member."""
    return member_factory(
        first_name="Jane",
        last_name="Inactive",
        email="jane.inactive@example.com",
        status="inactive",
        gender="female",
    )


@pytest.fixture
def archived_member(member_factory):
    """Create an archived member."""
    from django.utils import timezone

    member = member_factory(
        first_name="Archived",
        last_name="User",
        email="archived.user@example.com",
        status="archived",
    )
    member.archived_at = timezone.now()
    member.is_active = False
    member.save()
    return member


@pytest.fixture
def member_with_birthday(member_factory):
    """Create a member with upcoming birthday."""
    # Birthday in 3 days
    upcoming_birthday = date.today().replace(year=1990) + timedelta(days=3)
    # Adjust for year
    this_year_birthday = date(date.today().year, upcoming_birthday.month, upcoming_birthday.day)
    if this_year_birthday < date.today():
        this_year_birthday = date(
            date.today().year + 1, upcoming_birthday.month, upcoming_birthday.day
        )

    return member_factory(
        first_name="Birthday",
        last_name="Person",
        email="birthday@example.com",
        date_of_birth=date(1990, this_year_birthday.month, this_year_birthday.day),
    )


@pytest.fixture
def member_with_anniversary(member_factory):
    """Create a member with upcoming wedding anniversary."""
    # Anniversary in 5 days
    today = date.today()
    upcoming = today + timedelta(days=5)

    return member_factory(
        first_name="Anniversary",
        last_name="Person",
        email="anniversary@example.com",
        marital_status="married",
        wedding_anniversary=date(2015, upcoming.month, upcoming.day),
    )


@pytest.fixture
def member_with_family(member_factory):
    """Create a member with family members."""
    member = member_factory(
        first_name="Family",
        last_name="Head",
        email="family.head@example.com",
        marital_status="married",
    )

    FamilyMember.objects.create(
        member=member,
        name="Spouse Name",
        relationship="Spouse",
        birthdate=date(1992, 5, 15),
    )
    FamilyMember.objects.create(
        member=member,
        name="Child Name",
        relationship="Child",
        birthdate=date(2015, 8, 20),
    )

    return member


@pytest.fixture
def multiple_members(member_factory):
    """Create multiple members for bulk operations."""
    members = []
    for i in range(5):
        members.append(
            member_factory(
                first_name=f"Member{i}",
                last_name=f"Bulk{i}",
                email=f"member{i}@bulk.com",
            )
        )
    return members
