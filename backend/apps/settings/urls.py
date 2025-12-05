from django.urls import path

from .views import PublicSettingsView, SystemSettingsView

urlpatterns = [
    path("", SystemSettingsView.as_view(), name="system-settings"),
]

public_urlpatterns = [
    path("settings/", PublicSettingsView.as_view(), name="public-settings"),
]
