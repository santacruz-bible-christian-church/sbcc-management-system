"""
Fixtures for inventory tests.
"""

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.inventory.models import InventoryTracking


@pytest.fixture
def inventory_item_factory(admin_user):
    """Factory to create inventory items with custom parameters."""

    def _create_item(
        item_name="Test Item",
        quantity=1,
        status="good",
        acquisition_date=None,
        acquisition_cost=None,
        salvage_value=None,
        useful_life_years=5,
        **kwargs,
    ):
        defaults = {
            "item_name": item_name,
            "description": "Test item description",
            "quantity": quantity,
            "status": status,
            "acquisition_date": acquisition_date,
            "acquisition_cost": acquisition_cost,
            "salvage_value": salvage_value,
            "useful_life_years": useful_life_years,
            "label": "",
            "remarks": "",
            "ministry_name": "",
            "created_by": admin_user,
        }
        defaults.update(kwargs)
        return InventoryTracking.objects.create(**defaults)

    return _create_item


@pytest.fixture
def inventory_item(inventory_item_factory):
    """Create a basic inventory item."""
    return inventory_item_factory(
        item_name="Office Desk",
        quantity=5,
        status="good",
        ministry_name="Administration",
    )


@pytest.fixture
def depreciated_item(inventory_item_factory):
    """Create an inventory item with depreciation info."""
    return inventory_item_factory(
        item_name="Computer",
        quantity=3,
        status="good",
        acquisition_date=date.today() - timedelta(days=730),  # 2 years ago
        acquisition_cost=Decimal("5000.00"),
        salvage_value=Decimal("500.00"),
        useful_life_years=5,
        ministry_name="IT",
    )


@pytest.fixture
def retired_item(inventory_item_factory):
    """Create a retired inventory item."""
    return inventory_item_factory(
        item_name="Old Printer",
        quantity=1,
        status="retired",
        acquisition_date=date.today() - timedelta(days=2555),  # ~7 years ago
        acquisition_cost=Decimal("1000.00"),
        salvage_value=Decimal("100.00"),
        useful_life_years=5,
        ministry_name="Administration",
    )


@pytest.fixture
def needs_repair_item(inventory_item_factory):
    """Create an item that needs repair."""
    return inventory_item_factory(
        item_name="Projector",
        quantity=1,
        status="needs_repair",
        acquisition_date=date.today() - timedelta(days=365),
        acquisition_cost=Decimal("2000.00"),
        salvage_value=Decimal("200.00"),
        useful_life_years=7,
        ministry_name="Media",
        remarks="Lens needs replacement",
    )


@pytest.fixture
def lost_item(inventory_item_factory):
    """Create a lost inventory item."""
    return inventory_item_factory(
        item_name="Microphone",
        quantity=1,
        status="lost",
        acquisition_date=date.today() - timedelta(days=180),
        acquisition_cost=Decimal("500.00"),
        ministry_name="Worship",
    )
