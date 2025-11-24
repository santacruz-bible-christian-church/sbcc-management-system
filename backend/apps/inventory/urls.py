from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryTrackingViewSet

router = DefaultRouter()
router.register(r"inventory-tracking", InventoryTrackingViewSet, basename="inventory-tracking")

urlpatterns = [
    path("", include(router.urls)),
]