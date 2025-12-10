"""
Permission tests for Meeting Minutes.
Tests role-based access control.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestMeetingMinutesPermissions:
    """Tests for meeting minutes permissions."""

    def test_unauthenticated_cannot_access(self, api_client, meeting_minutes):
        """Test unauthenticated users cannot access."""
        url = reverse("meeting-minutes-list")
        assert api_client.get(url).status_code == status.HTTP_401_UNAUTHORIZED

        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        assert api_client.get(url).status_code == status.HTTP_401_UNAUTHORIZED

    def test_member_can_read(self, auth_client, meeting_minutes):
        """Test regular members can read meeting minutes."""
        url = reverse("meeting-minutes-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_member_cannot_create(self, auth_client):
        """Test regular members cannot create meeting minutes."""
        url = reverse("meeting-minutes-list")
        data = {
            "title": "Test",
            "meeting_date": "2025-12-01",
            "category": "general",
            "content": "Content",
        }
        response = auth_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_member_cannot_update(self, auth_client, meeting_minutes):
        """Test regular members cannot update meeting minutes."""
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        response = auth_client.patch(url, {"title": "New Title"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_member_cannot_delete(self, auth_client, meeting_minutes):
        """Test regular members cannot delete meeting minutes."""
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_has_full_access(self, admin_client, meeting_minutes):
        """Test admin can perform all operations."""
        # Read
        url = reverse("meeting-minutes-list")
        assert admin_client.get(url).status_code == status.HTTP_200_OK

        # Create
        data = {
            "title": "Admin Created",
            "meeting_date": "2025-12-01",
            "category": "general",
            "content": "Content",
        }
        response = admin_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Update
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        response = admin_client.patch(url, {"title": "Updated"}, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Delete
        response = admin_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_ministry_leader_can_manage_own_ministry(
        self, ministry_leader_client, meeting_minutes, ministry
    ):
        """Test ministry leader can manage their ministry's meetings."""
        # Should be able to read
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        response = ministry_leader_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_ministry_leader_can_create_for_ministry(self, ministry_leader_client, ministry):
        """Test ministry leader can create meetings for their ministry."""
        url = reverse("meeting-minutes-list")
        data = {
            "title": "Ministry Meeting",
            "meeting_date": "2025-12-01",
            "category": "general",
            "content": "Content",
            "ministry": ministry.id,
        }
        response = ministry_leader_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_pastor_can_manage_all(self, pastor_client, meeting_minutes):
        """Test pastor can manage all meeting minutes."""
        url = reverse("meeting-minutes-list")
        assert pastor_client.get(url).status_code == status.HTTP_200_OK

        data = {
            "title": "Pastor Created",
            "meeting_date": "2025-12-01",
            "category": "general",
            "content": "Content",
        }
        response = pastor_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
