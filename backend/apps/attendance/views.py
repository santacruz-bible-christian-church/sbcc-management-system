from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
import csv
from django.http import HttpResponse
from django.utils import timezone
from .models import Attendance, AttendanceSheet
from .serializers import (
    AttendanceSerializer, 
    AttendanceSheetSerializer,
    AttendanceSheetDetailSerializer
)
from apps.members.models import Member


class AttendanceSheetViewSet(viewsets.ModelViewSet):
    """ViewSet for AttendanceSheet model"""
    queryset = AttendanceSheet.objects.prefetch_related('attendances').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['event_title']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update_attendances']:
            return AttendanceSheetDetailSerializer
        return AttendanceSheetSerializer

    def perform_create(self, serializer):
        sheet = serializer.save()
        # Create attendance records for all members
        members = Member.objects.all()
        attendances = [
            Attendance(sheet=sheet, member=member, attended=False)
            for member in members
        ]
        Attendance.objects.bulk_create(attendances)

    @action(detail=True, methods=['post'])
    def update_attendances(self, request, pk=None):
        """Update attendance status for multiple members"""
        sheet = self.get_object()
        attendance_data = request.data.get('attendances', [])
        
        for item in attendance_data:
            Attendance.objects.filter(
                sheet=sheet,
                member_id=item['member']
            ).update(attended=item['attended'])
        
        serializer = self.get_serializer(sheet)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download attendance sheet as CSV"""
        sheet = self.get_object()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="attendance_{sheet.date}_{sheet.event_title}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Event', 'Member Name', 'Status'])
        
        for attendance in sheet.attendances.select_related('member').all():
            writer.writerow([
                sheet.date,
                sheet.event_title,
                attendance.member.full_name,
                'Present' if attendance.attended else 'Absent'
            ])
        
        return response


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