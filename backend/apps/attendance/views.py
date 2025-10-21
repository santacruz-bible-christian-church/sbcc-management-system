from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance model"""
    queryset = Attendance.objects.select_related('member', 'event').all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event', 'member', 'attended']
    search_fields = ['member__first_name', 'member__last_name', 'event__title']
    ordering_fields = ['check_in_time']
    ordering = ['-check_in_time']