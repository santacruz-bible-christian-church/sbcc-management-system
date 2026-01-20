from datetime import date
from decimal import Decimal

from rest_framework import serializers

from .models import InventoryTracking


class InventoryTrackingSerializer(serializers.ModelSerializer):
    book_value = serializers.SerializerMethodField()

    class Meta:
        model = InventoryTracking
        fields = [
            "id",
            "item_name",
            "description",
            "acquisition_date",
            "acquisition_cost",
            "status",
            "quantity",
            "useful_life_years",
            "salvage_value",
            "label",
            "remarks",
            "ministry_name",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "book_value",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "book_value",
        ]

    def get_book_value(self, obj):
        """
        Calculate book value using straight-line depreciation.
        Book Value = Acquisition Cost - Accumulated Depreciation
        Accumulated Depreciation = (Cost - Salvage) / Useful Life * Years Used
        """
        if not obj.acquisition_date or not obj.acquisition_cost:
            return None

        cost = obj.acquisition_cost or Decimal("0")
        salvage = obj.salvage_value or Decimal("0")
        useful_life = obj.useful_life_years or 1

        # Calculate years used
        days_used = Decimal((date.today() - obj.acquisition_date).days)
        years_used = max(Decimal("0"), days_used / Decimal("365"))

        # Straight-line depreciation
        depreciable_base = max(Decimal("0"), cost - salvage)
        annual_depreciation = (
            depreciable_base / Decimal(useful_life) if useful_life > 0 else Decimal("0")
        )
        accumulated_depreciation = min(depreciable_base, annual_depreciation * years_used)

        book_value = max(Decimal("0"), cost - accumulated_depreciation)
        return round(book_value, 2)
