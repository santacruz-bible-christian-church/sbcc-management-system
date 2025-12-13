import os

import pytest
from django.contrib.auth import get_user_model
from django.db import connections
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

# Import all shared fixtures
pytest_plugins = [
    "tests.fixtures.users",
    "tests.fixtures.models",
]

User = get_user_model()

# Test credentials - not used in production
TEST_PASSWORD = "TestPass123!"  # nosec B105


# Disable R2 storage for tests - use local file storage
@pytest.fixture(scope="session", autouse=True)
def disable_r2_for_tests():
    """Disable R2 storage during tests to use local file storage"""
    os.environ["USE_R2_STORAGE"] = "false"
    yield


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
        role="admin",  # Changed default from "member" to "admin"
        **kwargs,
    ):
        return User.objects.create_user(
            username=username, email=email, password=password, role=role, **kwargs
        )

    return _create_user


@pytest.fixture
def user(create_user):
    """Create a regular admin user."""
    return create_user()


@pytest.fixture
def admin_user(create_user):
    """Create an admin user."""
    return create_user(
        username="admin",
        email="admin@example.com",
        role="admin",
        first_name="Admin",
        last_name="User",
        is_staff=True,
    )


@pytest.fixture
def super_admin_user(create_user):
    """Create a super admin user."""
    return create_user(
        username="superadmin",
        email="superadmin@example.com",
        role="super_admin",
        first_name="Super",
        last_name="Admin",
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
def super_admin_client(api_client, super_admin_user):
    """Return an authenticated API client for super admin user."""
    refresh = RefreshToken.for_user(super_admin_user)
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
