import pytest


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
