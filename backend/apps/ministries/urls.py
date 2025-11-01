from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AssignmentViewSet, MinistryMemberViewSet, MinistryViewSet, ShiftViewSet

router = DefaultRouter()
router.register(r"", MinistryViewSet, basename="ministry")
router.register(r"members", MinistryMemberViewSet, basename="ministry-member")
router.register(r"shifts", ShiftViewSet, basename="shift")
router.register(r"assignments", AssignmentViewSet, basename="assignment")

urlpatterns = [
    path("", include(router.urls)),
]
