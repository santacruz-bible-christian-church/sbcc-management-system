import pytest


@pytest.fixture
def ministry(db, ministry_leader_user):
    """Create a ministry."""
    from apps.ministries.models import Ministry

    return Ministry.objects.create(
        name="Youth Ministry",
        description="Youth ministry activities",
        leader=ministry_leader_user,
        is_active=True,
    )
