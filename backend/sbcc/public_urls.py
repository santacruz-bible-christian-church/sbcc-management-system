"""
Public API URL configuration.
All endpoints require no authentication.
"""

from django.urls import path

from apps.announcements.public_views import PublicAnnouncementsView
from apps.events.public_views import PublicEventsView
from apps.prayer_requests.public_views import PublicPrayerRequestSubmitView
from apps.settings.views import PublicSettingsView, PublicTeamView

urlpatterns = [
    # System settings (branding, contact, about)
    path("settings/", PublicSettingsView.as_view(), name="public-settings"),
    # Team members
    path("team/", PublicTeamView.as_view(), name="public-team"),
    # Announcements
    path("announcements/", PublicAnnouncementsView.as_view(), name="public-announcements"),
    # Prayer requests submission
    path(
        "prayer-requests/submit/",
        PublicPrayerRequestSubmitView.as_view(),
        name="public-prayer-request-submit",
    ),
    # Events
    path("events/", PublicEventsView.as_view(), name="public-events"),
]
