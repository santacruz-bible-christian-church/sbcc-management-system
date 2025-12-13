import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

TEST_PASSWORD = "TestPass123!"


@pytest.mark.django_db
class TestUserManagementPermissions:
    """Tests for user management access control."""

    def test_super_admin_can_list_users(self, super_admin_client):
        """Test super admin can list all users."""
        url = reverse("authentication:user-list")
        response = super_admin_client.get(url)

        assert response.status_code == 200

    def test_admin_cannot_list_users(self, admin_client):
        """Test regular admin cannot access user management."""
        url = reverse("authentication:user-list")
        response = admin_client.get(url)

        assert response.status_code == 403

    def test_pastor_cannot_list_users(self, pastor_client):
        """Test pastor cannot access user management."""
        url = reverse("authentication:user-list")
        response = pastor_client.get(url)

        assert response.status_code == 403

    def test_ministry_leader_cannot_list_users(self, ministry_leader_client):
        """Test ministry leader cannot access user management."""
        url = reverse("authentication:user-list")
        response = ministry_leader_client.get(url)

        assert response.status_code == 403

    def test_unauthenticated_cannot_list_users(self, api_client):
        """Test unauthenticated user cannot access user management."""
        url = reverse("authentication:user-list")
        response = api_client.get(url)

        assert response.status_code == 401


@pytest.mark.django_db
class TestUserManagementCRUD:
    """Tests for user management CRUD operations."""

    def test_create_user(self, super_admin_client):
        """Test super admin can create a new user."""
        url = reverse("authentication:user-list")
        response = super_admin_client.post(
            url,
            {
                "username": "newuser",
                "email": "newuser@test.com",
                "password": TEST_PASSWORD,
                "first_name": "New",
                "last_name": "User",
                "role": "admin",
            },
        )

        assert response.status_code == 201
        assert User.objects.filter(username="newuser").exists()

    def test_create_user_duplicate_email(self, super_admin_client, admin_user):
        """Test creating user with duplicate email fails."""
        url = reverse("authentication:user-list")
        response = super_admin_client.post(
            url,
            {
                "username": "anotheruser",
                "email": admin_user.email,  # Duplicate email
                "password": TEST_PASSWORD,
                "first_name": "Another",
                "last_name": "User",
                "role": "admin",
            },
        )

        assert response.status_code == 400

    def test_create_super_admin_by_super_admin(self, super_admin_client):
        """Test super admin can create another super admin."""
        url = reverse("authentication:user-list")
        response = super_admin_client.post(
            url,
            {
                "username": "newsuperadmin",
                "email": "newsuperadmin@test.com",
                "password": TEST_PASSWORD,
                "first_name": "New",
                "last_name": "SuperAdmin",
                "role": "super_admin",
            },
        )

        assert response.status_code == 201

    def test_update_user(self, super_admin_client, admin_user):
        """Test super admin can update a user."""
        url = reverse("authentication:user-detail", kwargs={"pk": admin_user.pk})
        response = super_admin_client.patch(
            url,
            {
                "first_name": "Updated",
                "last_name": "Name",
            },
        )

        assert response.status_code == 200
        admin_user.refresh_from_db()
        assert admin_user.first_name == "Updated"

    def test_update_user_role(self, super_admin_client, admin_user):
        """Test super admin can change user role."""
        url = reverse("authentication:user-detail", kwargs={"pk": admin_user.pk})
        response = super_admin_client.patch(url, {"role": "pastor"})

        assert response.status_code == 200
        admin_user.refresh_from_db()
        assert admin_user.role == "pastor"

    def test_delete_user(self, super_admin_client, ministry_leader_user):
        """Test super admin can delete a user."""
        url = reverse("authentication:user-detail", kwargs={"pk": ministry_leader_user.pk})
        response = super_admin_client.delete(url)

        assert response.status_code == 204
        assert not User.objects.filter(pk=ministry_leader_user.pk).exists()

    def test_cannot_delete_self(self, super_admin_client, super_admin_user):
        """Test super admin cannot delete their own account."""
        url = reverse("authentication:user-detail", kwargs={"pk": super_admin_user.pk})
        response = super_admin_client.delete(url)

        assert response.status_code == 400
        assert User.objects.filter(pk=super_admin_user.pk).exists()

    def test_cannot_delete_last_super_admin(self, super_admin_client, super_admin_user):
        """Test cannot delete the last super admin."""
        # super_admin_user is the only super admin
        url = reverse("authentication:user-detail", kwargs={"pk": super_admin_user.pk})
        response = super_admin_client.delete(url)

        assert response.status_code == 400


@pytest.mark.django_db
class TestUserManagementActions:
    """Tests for user management custom actions."""

    def test_set_password(self, super_admin_client, admin_user):
        """Test super admin can set a user's password."""
        url = reverse("authentication:user-set-password", kwargs={"pk": admin_user.pk})
        new_password = "AdminNewPass123!"
        response = super_admin_client.post(url, {"password": new_password})

        assert response.status_code == 200

        # Verify new password works
        admin_user.refresh_from_db()
        assert admin_user.check_password(new_password)

    def test_toggle_active(self, super_admin_client, admin_user):
        """Test super admin can toggle user active status."""
        assert admin_user.is_active is True

        url = reverse("authentication:user-toggle-active", kwargs={"pk": admin_user.pk})
        response = super_admin_client.post(url)

        assert response.status_code == 200
        admin_user.refresh_from_db()
        assert admin_user.is_active is False

        # Toggle back
        response = super_admin_client.post(url)
        admin_user.refresh_from_db()
        assert admin_user.is_active is True

    def test_cannot_deactivate_self(self, super_admin_client, super_admin_user):
        """Test super admin cannot deactivate their own account."""
        url = reverse("authentication:user-toggle-active", kwargs={"pk": super_admin_user.pk})
        response = super_admin_client.post(url)

        assert response.status_code == 400
        super_admin_user.refresh_from_db()
        assert super_admin_user.is_active is True


@pytest.mark.django_db
class TestUserRoleValidation:
    """Tests for role validation."""

    def test_valid_roles_only(self, super_admin_client):
        """Test only valid roles are accepted."""
        url = reverse("authentication:user-list")
        response = super_admin_client.post(
            url,
            {
                "username": "testuser",
                "email": "testuser@test.com",
                "password": TEST_PASSWORD,
                "first_name": "Test",
                "last_name": "User",
                "role": "invalid_role",  # Invalid role
            },
        )

        assert response.status_code == 400

    def test_all_valid_roles(self, super_admin_client):
        """Test all valid roles can be assigned."""
        valid_roles = ["super_admin", "admin", "pastor", "ministry_leader"]

        for i, role in enumerate(valid_roles):
            url = reverse("authentication:user-list")
            response = super_admin_client.post(
                url,
                {
                    "username": f"user_{role}_{i}",
                    "email": f"user_{role}_{i}@test.com",
                    "password": TEST_PASSWORD,
                    "first_name": "Test",
                    "last_name": role.title(),
                    "role": role,
                },
            )

            assert response.status_code == 201, f"Failed for role: {role}"
