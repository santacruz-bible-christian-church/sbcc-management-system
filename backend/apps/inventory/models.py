from django.conf import settings
from django.db import models


class InventoryTracking(models.Model):
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=50,
        default="good",
        help_text="e.g. good, needs_repair, retired, lost",
    )

    acquisition_date = models.DateField(null=True, blank=True)
    acquisition_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salvage_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    useful_life_years = models.PositiveIntegerField(default=5)

    label = models.CharField(max_length=20, blank=True)
    remarks = models.TextField(blank=True)
    ministry_name = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="inventory_created",
        on_delete=models.SET_NULL,
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="inventory_updated",
        on_delete=models.SET_NULL,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_tracking"  # exact table name

    def __str__(self):
        return self.item_name
