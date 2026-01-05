"""
Tests for Event API permissions.
"""

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status


# =============================================================================
# Permission Tests
# =============================================================================
@pytest.mark.django_db
class TestEventPermissions:
    """Tests for event permissions."""

    def test_list_requires_authentication(self, api_client, event):
        """Test that listing events requires authentication."""
        url = reverse("event-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_list(self, auth_client, event):
        """Test that authenticated users can list events."""
        url = reverse("event-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_authenticated_user_can_create(self, auth_client, user, ministry):
        """Test that authenticated users can create events."""
        url = reverse("event-list")
        date = timezone.now() + timedelta(days=7)
        response = auth_client.post(
            url,
            {
                "title": "New Event",
                "description": "Description",
                "event_type": "service",
                "status": "draft",
                "date": date.isoformat(),
                "end_date": (date + timedelta(hours=2)).isoformat(),
                "location": "Church Hall",
                "organizer": user.id,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_authenticated_user_can_retrieve(self, auth_client, event):
        """Test that authenticated users can retrieve events."""
        url = reverse("event-detail", kwargs={"pk": event.pk})
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_cannot_create(self, api_client, admin_user):
        """Test that unauthenticated users cannot create events."""
        url = reverse("event-list")
        date = timezone.now() + timedelta(days=7)
        response = api_client.post(
            url,
            {
                "title": "New Event",
                "event_type": "service",
                "date": date.isoformat(),
                "location": "Church Hall",
                "organizer": admin_user.id,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_update(self, api_client, event):
        """Test that unauthenticated users cannot update events."""
        url = reverse("event-detail", kwargs={"pk": event.pk})
        response = api_client.patch(url, {"title": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_delete(self, api_client, event):
        """Test that unauthenticated users cannot delete events."""
        url = reverse("event-detail", kwargs={"pk": event.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
