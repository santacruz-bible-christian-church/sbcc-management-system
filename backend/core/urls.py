from django.urls import path
from .views import dashboard_stats, recent_activities

urlpatterns = [
    path('stats/', dashboard_stats, name='dashboard-stats'),
    path('activities/', recent_activities, name='dashboard-activities'),
]