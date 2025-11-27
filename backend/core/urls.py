from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/stats/", views.dashboard_stats, name="dashboard-stats"),
    path("dashboard/activities/", views.recent_activities, name="dashboard-activities"),
    path("health/", views.health_check, name="health-check"),
]
