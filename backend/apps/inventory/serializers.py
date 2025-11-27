from rest_framework import serializers

from .models import InventoryTracking


class InventoryTrackingSerializer(serializers.ModelSerializer):
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
        ]
        read_only_fields = ["id", "created_by", "updated_by", "created_at", "updated_at"]
