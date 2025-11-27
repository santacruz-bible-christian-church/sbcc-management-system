import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

User = get_user_model()

# Test credentials - not used in production (nosec B105)
TEST_PASSWORD = "TestPass123!"  # nosec
NEW_TEST_PASSWORD = "NewTestPass123!"  # nosec


@pytest.mark.django_db
class TestLogin:
    """Tests for login endpoint."""

    def test_login_success(self, api_client, user):
        """Test successful login with valid credentials."""
        url = reverse("authentication:login")
        response = api_client.post(
            url,
            {"username": "testuser", "password": TEST_PASSWORD},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["username"] == "testuser"

    def test_login_invalid_password(self, api_client, user):
        """Test login with wrong password."""
        url = reverse("authentication:login")
        response = api_client.post(
            url,
            {"username": "testuser", "password": "wrongpassword"},  # nosec B106
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client, db):
        """Test login with non-existent user."""
        url = reverse("authentication:login")
        response = api_client.post(
            url,
            {"username": "nouser", "password": "password123"},  # nosec B106
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestCurrentUser:
    """Tests for current user endpoint."""

    def test_get_current_user_authenticated(self, auth_client, user):
        """Test getting current user when authenticated."""
        url = reverse("authentication:current-user")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == user.username
        assert response.data["email"] == user.email
        assert response.data["role"] == user.role

    def test_get_current_user_unauthenticated(self, api_client, db):
        """Test getting current user without authentication."""
        url = reverse("authentication:current-user")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestRefreshToken:
    """Tests for token refresh endpoint."""

    def test_refresh_token_success(self, api_client, user_tokens):
        """Test refreshing access token with valid refresh token."""
        url = reverse("authentication:refresh")
        response = api_client.post(
            url,
            {"refresh": user_tokens["refresh"]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_refresh_token_invalid(self, api_client, db):
        """Test refresh with invalid token."""
        url = reverse("authentication:refresh")
        response = api_client.post(
            url,
            {"refresh": "invalid-token"},
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestLogout:
    """Tests for logout endpoint."""

    def test_logout_success(self, auth_client, user_tokens):
        """Test successful logout."""
        url = reverse("authentication:logout")
        response = auth_client.post(
            url,
            {"refresh_token": user_tokens["refresh"]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Logout successful"

    def test_logout_without_refresh_token(self, auth_client):
        """Test logout without providing refresh token."""
        url = reverse("authentication:logout")
        response = auth_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_logout_unauthenticated(self, api_client, db):
        """Test logout without authentication."""
        url = reverse("authentication:logout")
        response = api_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestRegister:
    """Tests for user registration endpoint (admin only)."""

    def test_register_as_admin(self, admin_client):
        """Test registering new user as admin."""
        url = reverse("authentication:register")
        response = admin_client.post(
            url,
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": NEW_TEST_PASSWORD,
                "password2": NEW_TEST_PASSWORD,
                "first_name": "New",
                "last_name": "User",
                "role": "member",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["user"]["username"] == "newuser"
        assert User.objects.filter(username="newuser").exists()

    def test_register_as_regular_user(self, auth_client):
        """Test that regular users cannot register new users."""
        url = reverse("authentication:register")
        response = auth_client.post(
            url,
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": NEW_TEST_PASSWORD,
                "password2": NEW_TEST_PASSWORD,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_register_unauthenticated(self, api_client, db):
        """Test that unauthenticated users cannot register."""
        url = reverse("authentication:register")
        response = api_client.post(
            url,
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": NEW_TEST_PASSWORD,
                "password2": NEW_TEST_PASSWORD,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_register_password_mismatch(self, admin_client):
        """Test registration with mismatched passwords."""
        url = reverse("authentication:register")
        response = admin_client.post(
            url,
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": NEW_TEST_PASSWORD,
                "password2": "DifferentPass123!",  # nosec B106
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestChangePassword:
    """Tests for change password endpoint."""

    def test_change_password_success(self, auth_client, user):
        """Test successful password change."""
        url = reverse("authentication:change-password")
        response = auth_client.put(
            url,
            {
                "old_password": TEST_PASSWORD,
                "new_password": NEW_TEST_PASSWORD,
                "new_password2": NEW_TEST_PASSWORD,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify new password works
        user.refresh_from_db()
        assert user.check_password(NEW_TEST_PASSWORD)

    def test_change_password_wrong_old_password(self, auth_client):
        """Test password change with wrong old password."""
        url = reverse("authentication:change-password")
        response = auth_client.put(
            url,
            {
                "old_password": "WrongOldPass!",  # nosec B106
                "new_password": NEW_TEST_PASSWORD,
                "new_password2": NEW_TEST_PASSWORD,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
