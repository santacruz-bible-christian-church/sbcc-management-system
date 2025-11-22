from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import VisitorAttendanceViewSet, VisitorViewSet

router = DefaultRouter()
# Register attendance FIRST with explicit prefix to avoid route conflicts
router.register(r"attendance", VisitorAttendanceViewSet, basename="visitor-attendance")
# Register visitors at root AFTER
router.register(r"", VisitorViewSet, basename="visitor")

urlpatterns = [
    path("", include(router.urls)),
]
