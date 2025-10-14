from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MinistryViewSet, MemberViewSet, EventViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r'ministries', MinistryViewSet)
router.register(r'members', MemberViewSet)
router.register(r'events', EventViewSet)
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]