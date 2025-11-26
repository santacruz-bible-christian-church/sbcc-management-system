from django.urls import path
from .views import (
    VisitorListCreateView,
    VisitorAttendanceCheckInView,
    VisitorAttendanceListView,
)

urlpatterns = [
    path("visitors/", VisitorListCreateView.as_view(), name="visitor-list"),
    path("visitor-attendance/check-in/", VisitorAttendanceCheckInView.as_view(), name="visitor-checkin"),
    path("visitor-attendance/", VisitorAttendanceListView.as_view(), name="visitor-attendance-list"),
]
from django.urls import path
from .views import (
    VisitorListCreateView,
    VisitorAttendanceCheckInView,
    VisitorAttendanceListView,
)

urlpatterns = [
    path("visitors/", VisitorListCreateView.as_view(), name="visitor-list"),
    path("visitor-attendance/check-in/", VisitorAttendanceCheckInView.as_view(), name="visitor-checkin"),
    path("visitor-attendance/", VisitorAttendanceListView.as_view(), name="visitor-attendance-list"),
]
