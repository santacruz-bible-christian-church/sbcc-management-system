from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MeetingMinutesAttachmentViewSet, MeetingMinutesViewSet

router = DefaultRouter()
# Register attachments BEFORE the main viewset to avoid URL conflicts
router.register(
    r"attachments", MeetingMinutesAttachmentViewSet, basename="meeting-minutes-attachments"
)
router.register(r"", MeetingMinutesViewSet, basename="meeting-minutes")

urlpatterns = [
    path("", include(router.urls)),
]
