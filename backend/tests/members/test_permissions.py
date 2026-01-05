"""
Tests for Member API permissions.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestMemberPermissions:
    """Tests for member permissions."""

    def test_list_requires_authentication(self, api_client, member):
        """Test that listing members requires authentication."""
        url = reverse("member-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_list(self, auth_client, member):
        """Test that authenticated users can list members."""
        url = reverse("member-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_authenticated_user_can_create(self, auth_client, ministry):
        """Test that authenticated users can create members."""
        url = reverse("member-list")
        response = auth_client.post(
            url,
            {
                "first_name": "New",
                "last_name": "Member",
                "email": "new.member@example.com",
                "ministry": ministry.id,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_authenticated_user_can_retrieve(self, auth_client, member):
        """Test that authenticated users can retrieve members."""
        url = reverse("member-detail", kwargs={"pk": member.pk})
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_cannot_create(self, api_client, ministry):
        """Test that unauthenticated users cannot create members."""
        url = reverse("member-list")
        response = api_client.post(
            url,
            {
                "first_name": "Test",
                "last_name": "User",
                "ministry": ministry.id,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_update(self, api_client, member):
        """Test that unauthenticated users cannot update members."""
        url = reverse("member-detail", kwargs={"pk": member.pk})
        response = api_client.patch(url, {"first_name": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_delete(self, api_client, member):
        """Test that unauthenticated users cannot delete members."""
        url = reverse("member-detail", kwargs={"pk": member.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_archive(self, api_client, member):
        """Test that unauthenticated users cannot archive members."""
        url = reverse("member-archive", kwargs={"pk": member.pk})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_access_stats(self, api_client):
        """Test that unauthenticated users cannot access stats."""
        url = reverse("member-stats")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
