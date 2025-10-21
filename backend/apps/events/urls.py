from django.urls import path
from . import views

urlpatterns = [
    path('', views.events_list, name='events-list'),                    # GET/POST /api/events/
    path('<int:event_id>/', views.event_detail, name='event-detail'),   # GET/DELETE /api/events/1/
    path('test/', views.test_events_api, name='events-test'),           # GET /api/events/test/
]