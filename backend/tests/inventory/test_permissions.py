"""
Tests for Inventory API permissions.

Note: The InventoryTrackingViewSet uses AllowAny permissions,
so all endpoints are publicly accessible. These tests verify that behavior.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestInventoryPermissions:
    """Tests for inventory permissions (AllowAny)."""

    def test_list_no_auth_required(self, api_client, inventory_item):
        """Test that listing items does not require authentication."""
        url = reverse("inventory-tracking-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_retrieve_no_auth_required(self, api_client, inventory_item):
        """Test that retrieving an item does not require authentication."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_no_auth_required(self, api_client):
        """Test that creating an item does not require authentication."""
        url = reverse("inventory-tracking-list")
        response = api_client.post(
            url,
            {
                "item_name": "Public Item",
                "quantity": 1,
                "status": "good",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_update_no_auth_required(self, api_client, inventory_item):
        """Test that updating an item does not require authentication."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = api_client.patch(
            url,
            {"quantity": 10},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    def test_delete_no_auth_required(self, api_client, inventory_item):
        """Test that deleting an item does not require authentication."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_report_pdf_no_auth_required(self, api_client, inventory_item):
        """Test that report PDF endpoint does not require authentication."""
        url = reverse("inventory-tracking-report-pdf")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"

    def test_authenticated_user_can_access(self, auth_client, inventory_item):
        """Test that authenticated users can also access endpoints."""
        url = reverse("inventory-tracking-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
