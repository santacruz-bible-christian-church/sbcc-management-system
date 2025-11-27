"""
URL configuration for sbcc project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path

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
    # Dashboard (aggregates data from multiple apps)
    path("api/dashboard/", include("core.urls")),
]
