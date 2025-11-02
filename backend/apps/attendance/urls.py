from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, AttendanceSheetViewSet

router = DefaultRouter()
router.register(r'sheets', AttendanceSheetViewSet, basename='attendance-sheet')
router.register(r'records', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]