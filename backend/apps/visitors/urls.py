from django.urls import path
from apps.visitors.views import (
    VisitorListCreateView,
    VisitorAttendanceCheckInView,
    VisitorAttendanceListView,
    ConvertVisitorToMemberView,
)

urlpatterns = [
    path("visitors/", VisitorListCreateView.as_view()),
    path("visitors/<int:id>/convert_to_member/", ConvertVisitorToMemberView.as_view()),

    path("visitor-attendance/checkin/", VisitorAttendanceCheckInView.as_view()),
    path("visitor-attendance/", VisitorAttendanceListView.as_view()),
]