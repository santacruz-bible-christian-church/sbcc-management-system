"""
URL configuration for sbcc project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path

from apps.settings.urls import public_urlpatterns as settings_public_urls

urlpatterns = [
    path("admin/", admin.site.urls),
    # Authentication
    path("api/auth/", include("apps.authentication.urls")),
    # Domain apps
    path("api/ministries/", include("apps.ministries.urls")),
    path("api/members/", include("apps.members.urls")),
    path("api/events/", include("apps.events.urls")),
    path("api/attendance/", include("apps.attendance.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/announcements/", include("apps.announcements.urls")),
    path("api/prayer-requests/", include("apps.prayer_requests.urls")),
    path("api/visitors/", include("apps.visitors.urls")),
    path("api/settings/", include("apps.settings.urls")),
    path("api/tasks/", include("apps.tasks.urls")),
    path("api/meeting-minutes/", include("apps.meeting_minutes.urls")),
    # Dashboard (aggregates data from multiple apps)
    path("api/dashboard/", include("core.urls")),
    # Public APIs (no auth required)
    path("api/public/", include(settings_public_urls)),
]
