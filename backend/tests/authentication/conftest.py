import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

TEST_PASSWORD = "TestPass123!"


# These fixtures extend the main conftest.py
# api_client, admin_user, admin_client, super_admin_user, super_admin_client
# are inherited from tests/conftest.py


@pytest.fixture
def pastor_user(db):
    """Create a pastor user."""
    return User.objects.create_user(
        username="pastor",
        email="pastor@test.com",
        password=TEST_PASSWORD,
        role="pastor",
        first_name="Pastor",
        last_name="John",
    )


@pytest.fixture
def ministry_leader_user(db):
    """Create a ministry leader user."""
    return User.objects.create_user(
        username="leader",
        email="leader@test.com",
        password=TEST_PASSWORD,
        role="ministry_leader",
        first_name="Ministry",
        last_name="Leader",
    )


@pytest.fixture
def inactive_user(db):
    """Create an inactive user."""
    return User.objects.create_user(
        username="inactive",
        email="inactive@test.com",
        password=TEST_PASSWORD,
        role="admin",
        first_name="Inactive",
        last_name="User",
        is_active=False,
    )


@pytest.fixture
def pastor_client(api_client, pastor_user):
    """API client authenticated as pastor."""
    refresh = RefreshToken.for_user(pastor_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def ministry_leader_client(api_client, ministry_leader_user):
    """API client authenticated as ministry leader."""
    refresh = RefreshToken.for_user(ministry_leader_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client
