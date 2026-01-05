"""
Tests for InventoryTracking model.
"""

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.inventory.models import InventoryTracking


@pytest.mark.django_db
class TestInventoryTrackingModel:
    """Tests for InventoryTracking model."""

    def test_string_representation(self, inventory_item):
        """Test __str__ method returns item name."""
        assert str(inventory_item) == "Office Desk"

    def test_default_values(self, admin_user):
        """Test model default values."""
        item = InventoryTracking.objects.create(
            item_name="New Item",
            created_by=admin_user,
        )

        assert item.quantity == 1
        assert item.status == "good"
        assert item.useful_life_years == 5
        assert item.description == ""
        assert item.label == ""
        assert item.remarks == ""
        assert item.ministry_name == ""

    def test_acquisition_fields(self, depreciated_item):
        """Test acquisition and depreciation fields."""
        assert depreciated_item.acquisition_cost == Decimal("5000.00")
        assert depreciated_item.salvage_value == Decimal("500.00")
        assert depreciated_item.useful_life_years == 5
        assert depreciated_item.acquisition_date is not None

    def test_nullable_fields(self, inventory_item):
        """Test that certain fields can be null."""
        assert inventory_item.acquisition_date is None
        assert inventory_item.acquisition_cost is None
        assert inventory_item.salvage_value is None

    def test_status_values(self, inventory_item, retired_item, needs_repair_item, lost_item):
        """Test different status values."""
        assert inventory_item.status == "good"
        assert retired_item.status == "retired"
        assert needs_repair_item.status == "needs_repair"
        assert lost_item.status == "lost"

    def test_timestamps(self, inventory_item):
        """Test that timestamps are auto-populated."""
        assert inventory_item.created_at is not None
        assert inventory_item.updated_at is not None

    def test_created_by_tracking(self, inventory_item, admin_user):
        """Test created_by is properly set."""
        assert inventory_item.created_by == admin_user
