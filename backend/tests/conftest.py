import pytest
from django.contrib.auth import get_user_model
from django.db import connections
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Test credentials - not used in production
TEST_PASSWORD = "TestPass123!"  # nosec B105


@pytest.fixture(autouse=True)
def close_db_connections():
    """Close database connections after each test to prevent connection leaks."""
    yield
    for conn in connections.all():
        conn.close()


@pytest.fixture
def api_client():
    """Return an API client instance."""
    return APIClient()


@pytest.fixture
def create_user(db):
    """Factory fixture to create users."""

    def _create_user(
        username="testuser",
        email="test@example.com",
        password=TEST_PASSWORD,
        role="member",
        **kwargs,
    ):
        user = User.objects.create_user(
            username=username, email=email, password=password, role=role, **kwargs
        )
        return user

    return _create_user


@pytest.fixture
def user(create_user):
    """Create a regular member user."""
    return create_user()


@pytest.fixture
def admin_user(create_user):
    """Create an admin user."""
    return create_user(
        username="admin",
        email="admin@example.com",
        role="admin",
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def auth_client(api_client, user):
    """Return an authenticated API client for regular user."""
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """Return an authenticated API client for admin user."""
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def user_tokens(user):
    """Return access and refresh tokens for regular user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@pytest.fixture
def admin_tokens(admin_user):
    """Return access and refresh tokens for admin user."""
    refresh = RefreshToken.for_user(admin_user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
