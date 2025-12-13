from datetime import date

import pytest


@pytest.fixture
def member(db):
    """Create a test Member (church member record, NOT a User)."""
    from apps.members.models import Member

    return Member.objects.create(
        first_name="Test",
        last_name="Member",
        email="testmember@example.com",
        phone="1234567890",
        date_of_birth=date(1990, 1, 1),
        is_active=True,
    )


@pytest.fixture
def ministry(db, ministry_leader_user):
    """Create a ministry with a leader."""
    from apps.ministries.models import Ministry

    return Ministry.objects.create(
        name="Youth Ministry",
        description="Youth ministry activities",
        leader=ministry_leader_user,
        is_active=True,
    )


@pytest.fixture
def ministry_no_leader(db):
    """Create a ministry without a leader (for simpler tests)."""
    from apps.ministries.models import Ministry

    return Ministry.objects.create(
        name="Youth Ministry",
        description="Youth ministry activities",
        is_active=True,
    )
