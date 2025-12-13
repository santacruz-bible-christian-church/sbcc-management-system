import pytest
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.fixture
def pastor_user(create_user):
    """Create a pastor user."""
    return create_user(
        username="pastor",
        email="pastor@example.com",
        role="pastor",
        is_staff=True,
    )


@pytest.fixture
def ministry_leader_user(create_user):
    """Create a ministry leader user."""
    return create_user(
        username="ministry_leader",
        email="leader@example.com",
        role="ministry_leader",
    )


@pytest.fixture
def make_auth_client(api_client):
    """Factory to create authenticated client for any user."""

    def _make_client(user):
        refresh = RefreshToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        return api_client

    return _make_client


@pytest.fixture
def pastor_client(make_auth_client, pastor_user):
    return make_auth_client(pastor_user)


@pytest.fixture
def ministry_leader_client(make_auth_client, ministry_leader_user):
    return make_auth_client(ministry_leader_user)
