import csv

from django.db import models
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from common.pagination import CustomPageNumberPagination
from common.permissions import IsAdminOrPastorReadOnly
from common.throttling import PublicPostThrottle

from .models import PrayerRequest, PrayerRequestFollowUp
from .serializers import (
    PrayerRequestAssignSerializer,
    PrayerRequestDetailSerializer,
    PrayerRequestFollowUpSerializer,
    PrayerRequestSerializer,
    PrayerRequestSubmitSerializer,
)
from .services import get_prayer_request_statistics, notify_assignment


class PrayerRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing prayer requests.

    Supports:
    - Digital submission (authenticated and anonymous)
    - Assignment to pastors/elders
    - Progress tracking via follow-ups
    - Search and filtering
    - CSV export
    """

    permission_classes = [permissions.IsAuthenticated, IsAdminOrPastorReadOnly]
    pagination_class = CustomPageNumberPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "category", "assigned_to", "is_public"]
    search_fields = ["title", "description", "requester_name"]
    ordering_fields = ["submitted_at", "priority", "status", "updated_at"]
    ordering = ["-submitted_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = PrayerRequest.objects.select_related(
            "requester", "assigned_to", "assigned_by"
        ).prefetch_related("follow_ups")

        # Filter based on user role
        if user.role in ["super_admin", "pastor", "elder", "admin"]:
            # Super admins, pastors, elders, and admins see all requests
            return queryset
        elif user.role == "ministry_leader":
            # Ministry leaders see public and their assigned requests
            return queryset.filter(models.Q(is_public=True) | models.Q(assigned_to=user))
        else:
            # Regular members see only public requests
            # (They can use my_requests endpoint with member_id to see their own)
            return queryset.filter(is_public=True)

    def get_serializer_class(self):
        if self.action in ["retrieve", "my_requests"]:
            return PrayerRequestDetailSerializer
        if self.action == "submit":
            return PrayerRequestSubmitSerializer
        if self.action == "assign":
            return PrayerRequestAssignSerializer
        return PrayerRequestSerializer

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[permissions.AllowAny],
        throttle_classes=[PublicPostThrottle],
    )
    def submit(self, request):
        """
        Public endpoint for submitting prayer requests.
        Optionally link to a member if member_id is provided.
        Rate limited to prevent abuse.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # If member_id is provided, link it
        member_id = request.data.get("member_id")
        if member_id:
            try:
                from apps.members.models import Member

                member = Member.objects.get(id=member_id)
                serializer.save(requester=member)
            except Member.DoesNotExist:
                serializer.save()
        else:
            serializer.save()

        return Response(
            {"message": "Prayer request submitted successfully"},
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsAdminOrPastorReadOnly],
    )
    def assign(self, request, pk=None):
        """Assign a prayer request to a pastor or elder"""
        prayer_request = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        assigned_to = serializer.validated_data["assigned_to"]
        prayer_request.assign_to(assigned_to, assigned_by=request.user)

        # Send notification to assigned user
        notify_assignment(prayer_request)

        return Response(
            PrayerRequestSerializer(prayer_request).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsAdminOrPastorReadOnly],
    )
    def add_follow_up(self, request, pk=None):
        """Add a follow-up log to a prayer request"""
        prayer_request = self.get_object()

        serializer = PrayerRequestFollowUpSerializer(
            data={**request.data, "prayer_request": prayer_request.id}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)

        # Update request status if needed
        if request.data.get("update_status"):
            new_status = request.data.get("update_status")
            if new_status in dict(PrayerRequest.STATUS_CHOICES):
                prayer_request.status = new_status
                prayer_request.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsAdminOrPastorReadOnly],
    )
    def mark_completed(self, request, pk=None):
        """Mark a prayer request as completed"""
        prayer_request = self.get_object()
        prayer_request.mark_completed()

        # Optionally add a completion note
        if request.data.get("notes"):
            PrayerRequestFollowUp.objects.create(
                prayer_request=prayer_request,
                action_type="note",
                notes=request.data["notes"],
                created_by=request.user,
            )

        return Response(
            PrayerRequestSerializer(prayer_request).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def my_requests(self, request):
        """
        Get prayer requests for a specific member.
        Query param: ?member_id=123
        """
        member_id = request.query_params.get("member_id")

        if not member_id:
            return Response(
                {"detail": "member_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = PrayerRequest.objects.filter(requester_id=member_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def assigned_to_me(self, request):
        """Get prayer requests assigned to the current user"""
        queryset = PrayerRequest.objects.filter(assigned_to=request.user)
        serializer = PrayerRequestSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def pending_assignment(self, request):
        """Get prayer requests that need assignment"""
        queryset = PrayerRequest.objects.filter(status="pending", assigned_to__isnull=True)
        serializer = PrayerRequestSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get prayer request statistics"""
        return Response(get_prayer_request_statistics())

    @action(detail=False, methods=["get"])
    def download(self, request):
        """Download prayer requests as CSV"""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="prayer_requests.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "ID",
                "Title",
                "Category",
                "Status",
                "Priority",
                "Requester",
                "Assigned To",
                "Submitted At",
                "Updated At",
            ]
        )

        for pr in self.get_queryset():
            writer.writerow(
                [
                    pr.id,
                    pr.title,
                    pr.get_category_display(),
                    pr.get_status_display(),
                    pr.get_priority_display(),
                    pr.requester_display_name,
                    pr.assigned_to.get_full_name() if pr.assigned_to else "",
                    pr.submitted_at.strftime("%Y-%m-%d %H:%M"),
                    pr.updated_at.strftime("%Y-%m-%d %H:%M"),
                ]
            )

        return response


class PrayerRequestFollowUpViewSet(viewsets.ModelViewSet):
    """ViewSet for managing prayer request follow-ups"""

    serializer_class = PrayerRequestFollowUpSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPastorReadOnly]
    pagination_class = CustomPageNumberPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["prayer_request", "action_type", "created_by"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = PrayerRequestFollowUp.objects.select_related("prayer_request", "created_by")

        # Filter private notes for non-pastor users
        if user.role not in ["super_admin", "pastor", "elder", "admin"]:
            queryset = queryset.filter(is_private=False)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
