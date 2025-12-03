from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PrayerRequestFollowUpViewSet, PrayerRequestViewSet

router = DefaultRouter()
router.register(r"requests", PrayerRequestViewSet, basename="prayer-request")
router.register(r"follow-ups", PrayerRequestFollowUpViewSet, basename="prayer-follow-up")

urlpatterns = [
    path("", include(router.urls)),
]
