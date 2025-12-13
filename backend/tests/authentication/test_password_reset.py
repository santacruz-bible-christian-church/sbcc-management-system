from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from apps.authentication.models import PasswordResetToken

User = get_user_model()

TEST_PASSWORD = "TestPass123!"


@pytest.mark.django_db
class TestForgotPasswordAPI:
    """Tests for forgot password endpoint."""

    @patch("apps.authentication.serializers.send_mail")
    def test_forgot_password_sends_email(self, mock_send_mail, api_client, admin_user):
        """Test forgot password sends email for existing user."""
        url = reverse("authentication:forgot-password")
        response = api_client.post(url, {"email": admin_user.email})

        assert response.status_code == 200
        assert "password reset link has been sent" in response.data["message"].lower()
        mock_send_mail.assert_called_once()

        # Verify token was created
        assert PasswordResetToken.objects.filter(user=admin_user).exists()

    def test_forgot_password_nonexistent_email(self, api_client):
        """Test forgot password with non-existent email still returns success (security)."""
        url = reverse("authentication:forgot-password")
        response = api_client.post(url, {"email": "nonexistent@test.com"})

        # Should return success to not reveal if email exists
        assert response.status_code == 200

    def test_forgot_password_invalid_email(self, api_client):
        """Test forgot password with invalid email format fails."""
        url = reverse("authentication:forgot-password")
        response = api_client.post(url, {"email": "not-an-email"})

        assert response.status_code == 400


@pytest.mark.django_db
class TestVerifyResetTokenAPI:
    """Tests for verify reset token endpoint."""

    def test_verify_valid_token(self, api_client, admin_user):
        """Test verifying a valid token."""
        token = PasswordResetToken.create_token(admin_user)
        url = reverse("authentication:verify-reset-token")
        response = api_client.post(url, {"token": token.token})

        assert response.status_code == 200
        assert response.data["valid"] is True

    def test_verify_invalid_token(self, api_client):
        """Test verifying an invalid token fails."""
        url = reverse("authentication:verify-reset-token")
        response = api_client.post(url, {"token": "invalid_token_123"})

        assert response.status_code == 400

    def test_verify_used_token(self, api_client, admin_user):
        """Test verifying an already used token fails."""
        token = PasswordResetToken.create_token(admin_user)
        token.used = True
        token.save()

        url = reverse("authentication:verify-reset-token")
        response = api_client.post(url, {"token": token.token})

        assert response.status_code == 400

    def test_verify_expired_token(self, api_client, admin_user):
        """Test verifying an expired token fails."""
        from datetime import timedelta

        from django.utils import timezone

        token = PasswordResetToken.create_token(admin_user)
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()

        url = reverse("authentication:verify-reset-token")
        response = api_client.post(url, {"token": token.token})

        assert response.status_code == 400


@pytest.mark.django_db
class TestResetPasswordAPI:
    """Tests for reset password endpoint."""

    def test_reset_password_success(self, api_client, admin_user):
        """Test successful password reset."""
        token = PasswordResetToken.create_token(admin_user)
        new_password = "NewSecurePass789!"

        url = reverse("authentication:reset-password")
        response = api_client.post(
            url,
            {
                "token": token.token,
                "new_password": new_password,
                "new_password2": new_password,
            },
        )

        assert response.status_code == 200

        # Verify password was changed
        admin_user.refresh_from_db()
        assert admin_user.check_password(new_password)

        # Verify token was marked as used
        token.refresh_from_db()
        assert token.used is True

    def test_reset_password_invalid_token(self, api_client):
        """Test password reset with invalid token fails."""
        url = reverse("authentication:reset-password")
        response = api_client.post(
            url,
            {
                "token": "invalid_token",
                "new_password": "NewSecurePass789!",
                "new_password2": "NewSecurePass789!",
            },
        )

        assert response.status_code == 400

    def test_reset_password_mismatch(self, api_client, admin_user):
        """Test password reset with mismatched passwords fails."""
        token = PasswordResetToken.create_token(admin_user)

        url = reverse("authentication:reset-password")
        response = api_client.post(
            url,
            {
                "token": token.token,
                "new_password": "NewSecurePass789!",
                "new_password2": "DifferentPass123!",
            },
        )

        assert response.status_code == 400

    def test_reset_password_weak(self, api_client, admin_user):
        """Test password reset with weak password fails."""
        token = PasswordResetToken.create_token(admin_user)

        url = reverse("authentication:reset-password")
        response = api_client.post(
            url,
            {
                "token": token.token,
                "new_password": "weak",
                "new_password2": "weak",
            },
        )

        assert response.status_code == 400
