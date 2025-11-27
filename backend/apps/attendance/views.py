import csv

from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from apps.members.models import Member

from .models import Attendance, AttendanceSheet
from .serializers import (
    AttendanceSerializer,
    AttendanceSheetDetailSerializer,
    AttendanceSheetSerializer,
)
from .services import check_frequent_absences, generate_member_report, generate_ministry_report


class AttendanceSheetViewSet(viewsets.ModelViewSet):
    """ViewSet for AttendanceSheet model"""

    queryset = (
        AttendanceSheet.objects.select_related("event")
        .prefetch_related("attendance_records__member")
        .all()
    )
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["event", "date"]
    search_fields = ["event__title", "notes"]
    ordering_fields = ["date", "created_at"]
    ordering = ["-date"]

    def get_serializer_class(self):
        if self.action in ["retrieve", "update_attendances"]:
            return AttendanceSheetDetailSerializer
        return AttendanceSheetSerializer

    def perform_create(self, serializer):
        """Create sheet and attendance records for all active members"""
        sheet = serializer.save()

        # Get all active members
        members = Member.objects.filter(is_active=True, status="active")

        # Create attendance records
        attendance_records = [
            Attendance(sheet=sheet, member=member, attended=False) for member in members
        ]
        Attendance.objects.bulk_create(attendance_records, ignore_conflicts=True)

    @action(detail=True, methods=["post"])
    def update_attendances(self, request, pk=None):
        """
        Bulk update attendance status for multiple members
        POST /api/attendance/sheets/{id}/update_attendances/
        Body: {"attendances": [{"member": 1, "attended": true}, ...]}
        """
        sheet = self.get_object()
        attendance_data = request.data.get("attendances", [])

        with transaction.atomic():
            updated_count = 0
            for item in attendance_data:
                member_id = item.get("member")
                attended = item.get("attended", False)

                updated = Attendance.objects.filter(sheet=sheet, member_id=member_id).update(
                    attended=attended, check_in_time=timezone.now() if attended else None
                )
                updated_count += updated

        # Return immediately without waiting for stats update
        sheet.refresh_from_db()
        serializer = AttendanceSheetDetailSerializer(sheet)

        # Update stats in background (after response is sent)
        # For now, we'll skip this for performance
        # You can add Celery task here if needed

        return Response({"updated_count": updated_count, "sheet": serializer.data})

    @action(detail=True, methods=["post"])
    def mark_present(self, request, pk=None):
        """
        Mark a single member as present
        POST /api/attendance/sheets/{id}/mark_present/
        Body: {"member": 1}
        """
        sheet = self.get_object()
        member_id = request.data.get("member")

        if not member_id:
            return Response({"error": "member is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attendance = Attendance.objects.get(sheet=sheet, member_id=member_id)
            attendance.mark_present()

            # Update member stats
            attendance.member.update_attendance_stats()

            return Response(
                {
                    "message": "Member marked as present",
                    "attendance": AttendanceSerializer(attendance).data,
                }
            )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "Attendance record not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Download attendance sheet as CSV"""
        sheet = self.get_object()
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="attendance_{sheet.date}_{sheet.event.title}.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(
            ["Date", "Event", "Member Name", "Email", "Ministry", "Status", "Check-in Time"]
        )

        for attendance in sheet.attendance_records.select_related("member__ministry").all():
            writer.writerow(
                [
                    sheet.date,
                    sheet.event.title,
                    attendance.member.full_name,
                    attendance.member.email,
                    attendance.member.ministry.name if attendance.member.ministry else "N/A",
                    "Present" if attendance.attended else "Absent",
                    (
                        attendance.check_in_time.strftime("%H:%M:%S")
                        if attendance.check_in_time
                        else "N/A"
                    ),
                ]
            )

        return response

    @action(detail=False, methods=["get"])
    def check_absences(self, request):
        """
        Check for members with frequent absences
        GET /api/attendance/sheets/check_absences/?threshold=3&days=30
        """
        threshold = int(request.query_params.get("threshold", 3))
        days = int(request.query_params.get("days", 30))

        problem_members = check_frequent_absences(threshold=threshold, days=days)

        return Response({"threshold": threshold, "days": days, "problem_members": problem_members})


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for individual Attendance records"""

    queryset = Attendance.objects.select_related("member", "sheet__event").all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["sheet", "member", "attended", "sheet__event"]
    search_fields = ["member__first_name", "member__last_name", "sheet__event__title"]
    ordering_fields = ["sheet__date", "check_in_time"]
    ordering = ["-sheet__date"]

    @action(detail=False, methods=["get"])
    def member_summary(self, request):
        """
        Get attendance summary for a specific member
        GET /api/attendance/records/member_summary/?member=1&days=90
        """
        member_id = request.query_params.get("member")
        days = int(request.query_params.get("days", 90))

        if not member_id:
            return Response(
                {"error": "member parameter is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        report = generate_member_report(member_id, days)
        return Response(report)

    @action(detail=False, methods=["get"])
    def ministry_report(self, request):
        """
        Get attendance report for a ministry
        GET /api/attendance/records/ministry_report/?ministry=1&days=90
        """
        ministry_id = request.query_params.get("ministry")
        days = int(request.query_params.get("days", 90))

        if not ministry_id:
            return Response(
                {"error": "ministry parameter is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        report = generate_ministry_report(ministry_id, days)
        return Response(report)
