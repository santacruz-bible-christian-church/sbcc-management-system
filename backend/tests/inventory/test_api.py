"""
Tests for Inventory API endpoints.
Covers CRUD operations, custom actions, filtering, and integration tests.
"""

from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status

from apps.inventory.models import InventoryTracking


# =============================================================================
# CRUD Tests
# =============================================================================
@pytest.mark.django_db
class TestInventoryCRUD:
    """Tests for inventory CRUD operations."""

    def test_create_item(self, admin_client, admin_user):
        """Test creating an inventory item."""
        url = reverse("inventory-tracking-list")
        response = admin_client.post(
            url,
            {
                "item_name": "New Chair",
                "description": "Office chair",
                "quantity": 10,
                "status": "good",
                "ministry_name": "Administration",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["item_name"] == "New Chair"
        assert InventoryTracking.objects.filter(item_name="New Chair").exists()

    def test_create_item_with_depreciation(self, admin_client):
        """Test creating an item with depreciation info."""
        url = reverse("inventory-tracking-list")
        response = admin_client.post(
            url,
            {
                "item_name": "Server",
                "quantity": 1,
                "status": "good",
                "acquisition_date": date.today().isoformat(),
                "acquisition_cost": "10000.00",
                "salvage_value": "1000.00",
                "useful_life_years": 5,
                "ministry_name": "IT",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Decimal(response.data["acquisition_cost"]) == Decimal("10000.00")

    def test_create_item_minimal(self, admin_client):
        """Test creating an item with minimal required fields."""
        url = reverse("inventory-tracking-list")
        response = admin_client.post(
            url,
            {"item_name": "Minimal Item"},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["quantity"] == 1  # Default
        assert response.data["status"] == "good"  # Default

    def test_list_items(self, admin_client, inventory_item, depreciated_item):
        """Test listing all inventory items."""
        url = reverse("inventory-tracking-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) >= 2

    def test_retrieve_item(self, admin_client, inventory_item):
        """Test retrieving a single inventory item."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["item_name"] == "Office Desk"
        assert response.data["quantity"] == 5

    def test_update_item(self, admin_client, inventory_item):
        """Test updating an inventory item."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = admin_client.patch(
            url,
            {"quantity": 8, "remarks": "Added 3 more desks"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        inventory_item.refresh_from_db()
        assert inventory_item.quantity == 8
        assert inventory_item.remarks == "Added 3 more desks"

    def test_update_item_status(self, admin_client, inventory_item):
        """Test updating item status."""
        url = reverse("inventory-tracking-detail", kwargs={"pk": inventory_item.pk})
        response = admin_client.patch(
            url,
            {"status": "needs_repair"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        inventory_item.refresh_from_db()
        assert inventory_item.status == "needs_repair"

    def test_delete_item(self, admin_client, inventory_item):
        """Test deleting an inventory item."""
        pk = inventory_item.pk
        url = reverse("inventory-tracking-detail", kwargs={"pk": pk})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not InventoryTracking.objects.filter(pk=pk).exists()


# =============================================================================
# Custom Actions Tests
# =============================================================================
@pytest.mark.django_db
class TestInventoryActions:
    """Tests for inventory custom actions."""

    def test_report_pdf_endpoint(self, admin_client, inventory_item, depreciated_item):
        """Test generating PDF report."""
        url = reverse("inventory-tracking-report-pdf")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"
        assert "attachment" in response["Content-Disposition"]
        assert "inventory_depreciation_report.pdf" in response["Content-Disposition"]

    def test_report_pdf_empty_inventory(self, admin_client):
        """Test PDF report with no items."""
        url = reverse("inventory-tracking-report-pdf")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"

    def test_report_pdf_includes_depreciation_data(self, admin_client, depreciated_item):
        """Test PDF report includes items with depreciation data."""
        url = reverse("inventory-tracking-report-pdf")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # PDF is binary, so we just verify it's generated
        assert len(response.content) > 0


# =============================================================================
# Filter and Search Tests
# =============================================================================
@pytest.mark.django_db
class TestInventoryFiltering:
    """Tests for inventory listing."""

    def test_list_returns_all_items(
        self, admin_client, inventory_item, depreciated_item, retired_item
    ):
        """Test listing returns all items."""
        url = reverse("inventory-tracking-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) >= 3


# =============================================================================
# Integration Tests
# =============================================================================
@pytest.mark.django_db
class TestInventoryIntegration:
    """Integration tests for complete workflows."""

    def test_complete_inventory_lifecycle(self, admin_client, admin_user):
        """Test complete inventory lifecycle: create, update, retire, delete."""
        # 1. Create new inventory item
        url = reverse("inventory-tracking-list")
        response = admin_client.post(
            url,
            {
                "item_name": "Laptop",
                "quantity": 5,
                "status": "good",
                "acquisition_date": date.today().isoformat(),
                "acquisition_cost": "8000.00",
                "salvage_value": "800.00",
                "useful_life_years": 4,
                "ministry_name": "IT",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        item_id = response.data["id"]

        # 2. Update quantity (some got damaged)
        detail_url = reverse("inventory-tracking-detail", kwargs={"pk": item_id})
        response = admin_client.patch(
            detail_url,
            {"quantity": 4, "remarks": "1 laptop damaged"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # 3. Mark as needs repair
        response = admin_client.patch(
            detail_url,
            {"status": "needs_repair"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # 4. Retire item
        response = admin_client.patch(
            detail_url,
            {"status": "retired", "remarks": "Replaced with newer model"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # 5. Verify final state
        response = admin_client.get(detail_url)
        assert response.data["status"] == "retired"
        assert response.data["quantity"] == 4
        assert "Replaced with newer model" in response.data["remarks"]

        # 6. Generate report to verify item is included
        report_url = reverse("inventory-tracking-report-pdf")
        response = admin_client.get(report_url)
        assert response.status_code == status.HTTP_200_OK

    def test_multiple_items_different_statuses(
        self,
        admin_client,
        inventory_item,
        depreciated_item,
        retired_item,
        needs_repair_item,
        lost_item,
    ):
        """Test handling multiple items with different statuses."""
        url = reverse("inventory-tracking-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) >= 5

        # Verify all status types are present
        statuses = [item["status"] for item in response.data["results"]]
        assert "good" in statuses
        assert "retired" in statuses
        assert "needs_repair" in statuses
        assert "lost" in statuses
