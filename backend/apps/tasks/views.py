from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import Task, TaskAttachment, TaskComment
from .serializers import (
    TaskAttachmentSerializer,
    TaskCommentSerializer,
    TaskDashboardSerializer,
    TaskListSerializer,
    TaskSerializer,
)
from .services import (
    get_in_progress_tasks,
    get_overdue_tasks,
    get_task_statistics,
    get_upcoming_tasks,
    mark_task_completed,
    update_task_progress,
)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Task management

    Permissions:
    - Admin and Ministry Leaders can create, update, delete tasks
    - All authenticated users can view tasks
    - Users can see tasks assigned to them or their ministry
    """

    queryset = Task.objects.select_related(
        "created_by", "assigned_to", "ministry", "completed_by"
    ).prefetch_related("comments", "attachments")
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "ministry", "assigned_to", "created_by"]
    search_fields = ["title", "description", "notes"]
    ordering_fields = ["start_date", "end_date", "priority", "created_at", "progress_percentage"]
    ordering = ["-priority", "end_date"]

    def get_serializer_class(self):
        """Use lightweight serializer for list views"""
        if self.action == "list":
            return TaskListSerializer
        elif self.action in ["dashboard_upcoming", "dashboard_overdue", "dashboard_in_progress"]:
            return TaskDashboardSerializer
        return TaskSerializer

    def get_queryset(self):
        """
        Filter queryset based on user role:
        - Admin/Pastor: see all tasks
        - Ministry Leader: see tasks in their ministry
        - Others: see tasks assigned to them
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Admin and pastors see all
        if user.role in ["admin", "pastor"]:
            return queryset

        # Ministry leaders see their ministry's tasks
        if user.role == "ministry_leader":
            led_ministries = user.led_ministries.values_list("id", flat=True)
            return queryset.filter(ministry_id__in=led_ministries) | queryset.filter(
                assigned_to=user
            )

        # Others see only tasks assigned to them
        return queryset.filter(assigned_to=user)

    @transaction.atomic
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def update_progress(self, request, pk=None):
        """
        Update task progress
        POST /api/tasks/{id}/update_progress/
        Body: {"progress_percentage": 50}
        """
        task = self.get_object()
        progress = request.data.get("progress_percentage")

        if progress is None:
            return Response(
                {"detail": "progress_percentage is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            progress = int(progress)
            if progress < 0 or progress > 100:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {"detail": "progress_percentage must be between 0 and 100"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = update_task_progress(task, progress, request.user)
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def mark_completed(self, request, pk=None):
        """
        Mark task as completed
        POST /api/tasks/{id}/mark_completed/
        """
        task = self.get_object()

        if task.status == "completed":
            return Response(
                {"detail": "Task is already completed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = mark_task_completed(task, request.user)
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reopen(self, request, pk=None):
        """
        Reopen a completed or cancelled task
        POST /api/tasks/{id}/reopen/
        """
        task = self.get_object()

        if task.status not in ["completed", "cancelled"]:
            return Response(
                {"detail": "Only completed or cancelled tasks can be reopened"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Use update() to bypass save() method's auto-completion logic
        Task.objects.filter(pk=task.pk).update(
            status="in_progress",
            completed_at=None,
            completed_by=None,
        )
        task.refresh_from_db()

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """
        Cancel a task
        POST /api/tasks/{id}/cancel/
        """
        task = self.get_object()

        if task.status == "completed":
            return Response(
                {"detail": "Cannot cancel a completed task"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task.status = "cancelled"
        task.save()

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def dashboard_upcoming(self, request):
        """
        Get upcoming tasks for dashboard widget
        GET /api/tasks/dashboard_upcoming/?days=7&ministry=1
        """
        days = int(request.query_params.get("days", 7))
        ministry_id = request.query_params.get("ministry")
        assigned_to_id = request.query_params.get("assigned_to")

        tasks = get_upcoming_tasks(
            days=days,
            ministry=ministry_id if ministry_id else None,
            assigned_to=assigned_to_id if assigned_to_id else None,
        )

        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def dashboard_overdue(self, request):
        """
        Get overdue tasks for dashboard widget
        GET /api/tasks/dashboard_overdue/?ministry=1
        """
        ministry_id = request.query_params.get("ministry")
        assigned_to_id = request.query_params.get("assigned_to")

        tasks = get_overdue_tasks(
            ministry=ministry_id if ministry_id else None,
            assigned_to=assigned_to_id if assigned_to_id else None,
        )

        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def dashboard_in_progress(self, request):
        """
        Get in-progress tasks for dashboard widget
        GET /api/tasks/dashboard_in_progress/?ministry=1
        """
        ministry_id = request.query_params.get("ministry")
        assigned_to_id = request.query_params.get("assigned_to")

        tasks = get_in_progress_tasks(
            ministry=ministry_id if ministry_id else None,
            assigned_to=assigned_to_id if assigned_to_id else None,
        )

        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def statistics(self, request):
        """
        Get task statistics for dashboard
        GET /api/tasks/statistics/?ministry=1
        """
        ministry_id = request.query_params.get("ministry")
        assigned_to_id = request.query_params.get("assigned_to")

        stats = get_task_statistics(
            ministry=ministry_id if ministry_id else None,
            assigned_to=assigned_to_id if assigned_to_id else None,
        )

        return Response(stats)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_tasks(self, request):
        """
        Get tasks assigned to current user
        GET /api/tasks/my_tasks/
        """
        tasks = Task.objects.filter(
            assigned_to=request.user,
            is_active=True,
        ).select_related("created_by", "ministry")

        # Apply filters
        status_filter = request.query_params.get("status")
        if status_filter:
            tasks = tasks.filter(status=status_filter)

        serializer = TaskListSerializer(tasks, many=True)
        return Response(serializer.data)


class TaskCommentViewSet(viewsets.ModelViewSet):
    """ViewSet for Task Comments"""

    queryset = TaskComment.objects.select_related("task", "user")
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter comments by task if provided"""
        queryset = super().get_queryset()
        task_id = self.request.query_params.get("task")

        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset

    def perform_create(self, serializer):
        """Set user to current user"""
        serializer.save(user=self.request.user)


class TaskAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Task Attachments"""

    queryset = TaskAttachment.objects.select_related("task", "uploaded_by")
    serializer_class = TaskAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter attachments by task if provided"""
        queryset = super().get_queryset()
        task_id = self.request.query_params.get("task")

        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset

    def perform_create(self, serializer):
        """Set uploaded_by to current user and extract file metadata"""
        file_obj = self.request.FILES.get("file")
        serializer.save(
            uploaded_by=self.request.user,
            file_name=file_obj.name if file_obj else "",
            file_size=file_obj.size if file_obj else 0,
        )
