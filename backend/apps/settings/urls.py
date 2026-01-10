from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PublicSettingsView, PublicTeamView, SystemSettingsView, TeamMemberViewSet

router = DefaultRouter()
router.register(r"team", TeamMemberViewSet, basename="team-member")

urlpatterns = [
    path("", SystemSettingsView.as_view(), name="system-settings"),
    path("", include(router.urls)),
]

public_urlpatterns = [
    path("settings/", PublicSettingsView.as_view(), name="public-settings"),
    path("team/", PublicTeamView.as_view(), name="public-team"),
]
