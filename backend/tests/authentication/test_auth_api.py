import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

TEST_PASSWORD = "TestPass123!"


@pytest.mark.django_db
class TestLoginAPI:
    """Tests for login endpoint."""

    def test_login_success(self, api_client, admin_user):
        """Test successful login returns tokens and user data."""
        url = reverse("authentication:login")
        response = api_client.post(
            url,
            {
                "username": admin_user.username,
                "password": TEST_PASSWORD,
            },
        )

        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["role"] == "admin"
        assert response.data["user"]["email"] == admin_user.email

    def test_login_wrong_password(self, api_client, admin_user):
        """Test login with wrong password fails."""
        url = reverse("authentication:login")
        response = api_client.post(
            url,
            {
                "username": admin_user.username,
                "password": "WrongPassword123!",
            },
        )

        assert response.status_code == 401

    def test_login_inactive_user(self, api_client, inactive_user):
        """Test inactive user cannot login."""
        url = reverse("authentication:login")
        response = api_client.post(
            url,
            {
                "username": inactive_user.username,
                "password": TEST_PASSWORD,
            },
        )

        assert response.status_code == 401

    def test_login_nonexistent_user(self, api_client):
        """Test login with non-existent user fails."""
        url = reverse("authentication:login")
        response = api_client.post(
            url,
            {
                "username": "nonexistent",
                "password": TEST_PASSWORD,
            },
        )

        assert response.status_code == 401


@pytest.mark.django_db
class TestLogoutAPI:
    """Tests for logout endpoint."""

    def test_logout_success(self, admin_client, admin_user):
        """Test successful logout blacklists token."""
        refresh = RefreshToken.for_user(admin_user)
        url = reverse("authentication:logout")
        response = admin_client.post(url, {"refresh_token": str(refresh)})

        assert response.status_code == 200
        assert response.data["message"] == "Logout successful"

    def test_logout_without_token(self, admin_client):
        """Test logout without refresh token fails."""
        url = reverse("authentication:logout")
        response = admin_client.post(url, {})

        assert response.status_code == 400

    def test_logout_unauthenticated(self, api_client):
        """Test unauthenticated user cannot logout."""
        url = reverse("authentication:logout")
        response = api_client.post(url, {"refresh_token": "fake_token"})

        assert response.status_code == 401


@pytest.mark.django_db
class TestRefreshTokenAPI:
    """Tests for token refresh endpoint."""

    def test_refresh_token_success(self, api_client, admin_user):
        """Test refreshing access token with valid refresh token."""
        refresh = RefreshToken.for_user(admin_user)
        url = reverse("authentication:refresh")
        response = api_client.post(url, {"refresh": str(refresh)})

        assert response.status_code == 200
        assert "access" in response.data

    def test_refresh_token_invalid(self, api_client):
        """Test refresh with invalid token fails."""
        url = reverse("authentication:refresh")
        response = api_client.post(url, {"refresh": "invalid-token"})

        assert response.status_code == 401

    def test_refresh_token_after_logout(self, admin_client, admin_user):
        """Test refresh token is invalidated after logout (blacklisted)."""
        refresh = RefreshToken.for_user(admin_user)

        # Logout (blacklist the token)
        logout_url = reverse("authentication:logout")
        admin_client.post(logout_url, {"refresh_token": str(refresh)})

        # Try to use the blacklisted refresh token
        refresh_url = reverse("authentication:refresh")
        response = admin_client.post(refresh_url, {"refresh": str(refresh)})

        assert response.status_code == 401


@pytest.mark.django_db
class TestCurrentUserAPI:
    """Tests for current user endpoint."""

    def test_get_current_user(self, admin_client, admin_user):
        """Test getting current user info."""
        url = reverse("authentication:current-user")
        response = admin_client.get(url)

        assert response.status_code == 200
        assert response.data["username"] == admin_user.username
        assert response.data["email"] == admin_user.email
        assert response.data["role"] == "admin"

    def test_get_current_user_unauthenticated(self, api_client):
        """Test unauthenticated user cannot get current user."""
        url = reverse("authentication:current-user")
        response = api_client.get(url)

        assert response.status_code == 401

    def test_current_user_shows_all_roles(
        self, api_client, super_admin_user, pastor_user, ministry_leader_user
    ):
        """Test current user endpoint works for all valid roles."""
        for user in [super_admin_user, pastor_user, ministry_leader_user]:
            refresh = RefreshToken.for_user(user)
            api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

            url = reverse("authentication:current-user")
            response = api_client.get(url)

            assert response.status_code == 200
            assert response.data["role"] == user.role


@pytest.mark.django_db
class TestChangePasswordAPI:
    """Tests for change password endpoint."""

    def test_change_password_success(self, admin_client, admin_user):
        """Test successful password change."""
        url = reverse("authentication:change-password")
        new_password = "NewSecurePass456!"
        response = admin_client.put(
            url,
            {
                "old_password": TEST_PASSWORD,
                "new_password": new_password,
                "new_password2": new_password,
            },
        )

        assert response.status_code == 200

        # Verify new password works
        admin_user.refresh_from_db()
        assert admin_user.check_password(new_password)

    def test_change_password_wrong_old_password(self, admin_client):
        """Test password change with wrong old password fails."""
        url = reverse("authentication:change-password")
        response = admin_client.put(
            url,
            {
                "old_password": "WrongPassword123!",
                "new_password": "NewSecurePass456!",
                "new_password2": "NewSecurePass456!",
            },
        )

        assert response.status_code == 400

    def test_change_password_mismatch(self, admin_client):
        """Test password change with mismatched new passwords fails."""
        url = reverse("authentication:change-password")
        response = admin_client.put(
            url,
            {
                "old_password": TEST_PASSWORD,
                "new_password": "NewSecurePass456!",
                "new_password2": "DifferentPass789!",
            },
        )

        assert response.status_code == 400

    def test_change_password_weak(self, admin_client):
        """Test password change with weak password fails."""
        url = reverse("authentication:change-password")
        response = admin_client.put(
            url,
            {
                "old_password": TEST_PASSWORD,
                "new_password": "weak",
                "new_password2": "weak",
            },
        )

        assert response.status_code == 400

    def test_change_password_unauthenticated(self, api_client):
        """Test unauthenticated user cannot change password."""
        url = reverse("authentication:change-password")
        response = api_client.put(
            url,
            {
                "old_password": TEST_PASSWORD,
                "new_password": "NewSecurePass456!",
                "new_password2": "NewSecurePass456!",
            },
        )

        assert response.status_code == 401
