from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AttendanceSheetViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r"sheets", AttendanceSheetViewSet, basename="attendance-sheet")
router.register(r"records", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
]
