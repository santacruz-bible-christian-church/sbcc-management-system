from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import MeetingMinutes, MeetingMinutesAttachment
from .serializers import (
    MeetingMinutesAttachmentSerializer,
    MeetingMinutesListSerializer,
    MeetingMinutesSerializer,
    MeetingMinutesVersionSerializer,
)
from .services import (
    get_version,
    restore_to_version,
    search_meeting_minutes,
    update_meeting_with_version,
)


class IsMeetingMinutesEditor(permissions.BasePermission):
    """
    Permission for meeting minutes editing.
    - Super Admin, Admin, Pastor: full access
    - Ministry Leader: can create/edit for their ministry
    - Member: read only
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Read access for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write access for super_admin, admin, pastor, ministry_leader
        return request.user.is_superuser or request.user.role in [
            "super_admin",
            "admin",
            "pastor",
            "ministry_leader",
        ]

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Read access for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Super admin, admin and pastor have full access
        if request.user.is_superuser or request.user.role in ["super_admin", "admin", "pastor"]:
            return True

        # Ministry leaders can edit their ministry's meetings
        if request.user.role == "ministry_leader":
            if obj.ministry and obj.ministry.leader == request.user:
                return True
            # Can also edit if they created it
            if obj.created_by == request.user:
                return True

        return False


class MeetingMinutesViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Meeting Minutes management.

    Endpoints:
    - GET /api/meeting-minutes/ - List all meeting minutes
    - POST /api/meeting-minutes/ - Create new meeting minutes
    - GET /api/meeting-minutes/{id}/ - Get single meeting minutes
    - PATCH /api/meeting-minutes/{id}/ - Update meeting minutes
    - DELETE /api/meeting-minutes/{id}/ - Soft delete meeting minutes
    - GET /api/meeting-minutes/search/ - Search meeting minutes
    - GET /api/meeting-minutes/categories/ - List available categories
    - GET /api/meeting-minutes/{id}/versions/ - Get version history
    - GET /api/meeting-minutes/{id}/versions/{version_number}/ - Get specific version
    - POST /api/meeting-minutes/{id}/versions/{version_number}/restore/ - Restore version
    """

    queryset = (
        MeetingMinutes.objects.filter(is_active=True)
        .select_related("ministry", "created_by")
        .prefetch_related("attachments", "versions")
    )
    serializer_class = MeetingMinutesSerializer
    permission_classes = [permissions.IsAuthenticated, IsMeetingMinutesEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category", "ministry"]
    search_fields = ["title", "content", "attendees"]
    ordering_fields = ["meeting_date", "created_at", "title"]
    ordering = ["-meeting_date"]

    def get_serializer_class(self):
        """Use lightweight serializer for list views."""
        if self.action == "list":
            return MeetingMinutesListSerializer
        return MeetingMinutesSerializer

    def get_queryset(self):
        """Apply date range filters."""
        queryset = super().get_queryset()

        # Date range filters
        meeting_date_after = self.request.query_params.get("meeting_date_after")
        meeting_date_before = self.request.query_params.get("meeting_date_before")

        if meeting_date_after:
            queryset = queryset.filter(meeting_date__gte=meeting_date_after)
        if meeting_date_before:
            queryset = queryset.filter(meeting_date__lte=meeting_date_before)

        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)

    @transaction.atomic
    def perform_update(self, serializer):
        """Create version on content update."""
        instance = self.get_object()
        new_content = serializer.validated_data.get("content")

        # If content is changing, create a version
        if new_content and new_content != instance.content:
            update_meeting_with_version(
                instance,
                content=new_content,
                changed_by=self.request.user,
                change_summary="Content updated",
            )
            # Remove content from validated_data since we already updated it
            serializer.validated_data.pop("content", None)

        serializer.save()

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete."""
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=["get"])
    def search(self, request):
        """
        Search meeting minutes.
        GET /api/meeting-minutes/search/?q=budget&category=finance
        """
        query = request.query_params.get("q", "")
        category = request.query_params.get("category")
        include_attachments = (
            request.query_params.get("include_attachments", "false").lower() == "true"
        )

        results = search_meeting_minutes(
            query=query,
            category=category,
            include_attachments=include_attachments,
        )

        serializer = MeetingMinutesListSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def categories(self, request):
        """
        List available categories.
        GET /api/meeting-minutes/categories/
        """
        categories = [
            {"value": choice[0], "label": choice[1]} for choice in MeetingMinutes.CATEGORY_CHOICES
        ]
        return Response(categories)

    @action(detail=True, methods=["get"], url_path="versions")
    def versions(self, request, pk=None):
        """
        Get version history for meeting minutes.
        GET /api/meeting-minutes/{id}/versions/
        """
        meeting = self.get_object()
        versions = meeting.versions.all()
        serializer = MeetingMinutesVersionSerializer(versions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path=r"versions/(?P<version_number>\d+)")
    def version_detail(self, request, pk=None, version_number=None):
        """
        Get a specific version.
        GET /api/meeting-minutes/{id}/versions/{version_number}/
        """
        meeting = self.get_object()
        version = get_version(meeting, int(version_number))

        if not version:
            return Response(
                {"detail": "Version not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MeetingMinutesVersionSerializer(version)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        url_path=r"versions/(?P<version_number>\d+)/restore",
        url_name="restore",
    )
    def restore_version(self, request, pk=None, version_number=None):
        """
        Restore to a previous version.
        POST /api/meeting-minutes/{id}/versions/{version_number}/restore/
        """
        meeting = self.get_object()
        restored = restore_to_version(
            meeting,
            int(version_number),
            restored_by=request.user,
        )

        if not restored:
            return Response(
                {"detail": "Version not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(restored)
        return Response(serializer.data)


class MeetingMinutesAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Meeting Minutes Attachments."""

    queryset = MeetingMinutesAttachment.objects.select_related("meeting_minutes", "uploaded_by")
    serializer_class = MeetingMinutesAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["meeting_minutes"]

    def perform_create(self, serializer):
        """Set uploaded_by to current user."""
        serializer.save(uploaded_by=self.request.user)
