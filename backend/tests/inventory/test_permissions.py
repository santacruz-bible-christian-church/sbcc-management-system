"""
Tests for Inventory API permissions.

Note: The InventoryTrackingViewSet uses IsAuthenticated permissions,
so all endpoints require authentication.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestInventoryPermissions:
    """Tests for inventory permissions (IsAuthenticated)."""

    def test_list_requires_authentication(self, api_client, inventory_item):
        """Test that listing items requires authentication."""
        url = reverse("inventory-tracking-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_requires_authentication(self, api_client, inventory_item):
        """Test that retrieving an item requires authentication."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_requires_authentication(self, api_client):
        """Test that creating an item requires authentication."""
        url = reverse("inventory-tracking-list")
        response = api_client.post(
            url,
            {
                "item_name": "Test Item",
                "quantity": 1,
                "status": "good",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_requires_authentication(self, api_client, inventory_item):
        """Test that updating an item requires authentication."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = api_client.patch(
            url,
            {"quantity": 10},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_requires_authentication(self, api_client, inventory_item):
        """Test that deleting an item requires authentication."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_report_pdf_requires_authentication(self, api_client, inventory_item):
        """Test that report PDF endpoint requires authentication."""
        url = reverse("inventory-tracking-report-pdf")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_list(self, auth_client, inventory_item):
        """Test that authenticated users can list items."""
        url = reverse("inventory-tracking-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_authenticated_user_can_create(self, auth_client):
        """Test that authenticated users can create items."""
        url = reverse("inventory-tracking-list")
        response = auth_client.post(
            url,
            {
                "item_name": "Authenticated Item",
                "quantity": 1,
                "status": "good",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
