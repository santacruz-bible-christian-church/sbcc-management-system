from datetime import date, timedelta
from unittest.mock import Mock, patch

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.tasks.models import Task, TaskAttachment, TaskComment
from apps.tasks.services import (
    get_in_progress_tasks,
    get_overdue_tasks,
    get_task_statistics,
    get_upcoming_tasks,
    mark_task_completed,
    update_overdue_tasks,
    update_task_progress,
)

User = get_user_model()


# =============================================================================
# Fixtures
# =============================================================================
@pytest.fixture
def ministry_leader_user(create_user):
    """Create a ministry leader user."""
    return create_user(
        username="ministry_leader",
        email="leader@example.com",
        role="ministry_leader",
    )


@pytest.fixture
def ministry_leader_client(api_client, ministry_leader_user):
    """Return an authenticated API client for ministry leader."""
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(ministry_leader_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def pastor_user(create_user):
    """Create a pastor user."""
    return create_user(username="pastor", email="pastor@example.com", role="pastor", is_staff=True)


@pytest.fixture
def pastor_client(api_client, pastor_user):
    """Return an authenticated API client for pastor."""
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(pastor_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def ministry(db, ministry_leader_user):
    """Create a ministry."""
    from apps.ministries.models import Ministry

    return Ministry.objects.create(
        name="Youth Ministry",
        description="Youth ministry activities",
        leader=ministry_leader_user,
        is_active=True,
    )


@pytest.fixture
def task_factory(admin_user, user, ministry):
    """Factory to create tasks with custom parameters."""

    def _create_task(
        title="Test Task",
        days_offset_start=0,
        days_offset_end=7,
        status_val="pending",
        progress=0,
        **kwargs,
    ):
        today = timezone.now().date()
        defaults = {
            "title": title,
            "description": "Task description",
            "priority": "medium",
            "status": status_val,
            "start_date": today + timedelta(days=days_offset_start),
            "end_date": today + timedelta(days=days_offset_end),
            "progress_percentage": progress,
            "created_by": admin_user,
            "assigned_to": user,
            "ministry": ministry,
        }
        defaults.update(kwargs)
        return Task.objects.create(**defaults)

    return _create_task


@pytest.fixture
def task(task_factory):
    """Create a basic pending task."""
    return task_factory(title="Prepare Sunday Service Materials")


@pytest.fixture
def in_progress_task(task_factory):
    """Create a task in progress."""
    return task_factory(
        title="Update Church Website",
        days_offset_start=-2,
        days_offset_end=5,
        status_val="in_progress",
        progress=50,
        priority="high",
    )


@pytest.fixture
def overdue_task(task_factory):
    """Create an overdue task."""
    return task_factory(
        title="Submit Annual Report",
        days_offset_start=-14,
        days_offset_end=-2,
        status_val="overdue",
        progress=30,
        priority="urgent",
    )


@pytest.fixture
def completed_task(task_factory, user):
    """Create a completed task."""
    task = task_factory(
        title="Organize Youth Camp",
        days_offset_start=-30,
        days_offset_end=-10,
        status_val="completed",
        progress=100,
        priority="high",
        completed_at=timezone.now() - timedelta(days=10),
        completed_by=user,
    )
    return task


@pytest.fixture
def task_comment(task, admin_user):
    """Create a task comment."""
    return TaskComment.objects.create(
        task=task, user=admin_user, comment="This is progressing well!"
    )


@pytest.fixture
def task_attachment(task, admin_user):
    """Create a task attachment."""
    return TaskAttachment.objects.create(
        task=task,
        uploaded_by=admin_user,
        file=SimpleUploadedFile("test_doc.pdf", b"file content"),
        file_name="test_doc.pdf",
        file_size=1024,
    )


# =============================================================================
# Model Tests
# =============================================================================
@pytest.mark.django_db
class TestTaskModel:
    """Tests for the Task model."""

    def test_task_str_and_creation(self, task):
        """Test string representation and creation."""
        assert "Prepare Sunday Service Materials" in str(task)
        assert "Pending" in str(task)
        assert task.priority == "medium"
        assert task.status == "pending"
        assert task.progress_percentage == 0

    @pytest.mark.parametrize(
        "field,value,expected_error",
        [
            ("end_date", -10, "End date must be after start date"),
            ("progress_percentage", 150, "Progress must be between 0 and 100"),
        ],
    )
    def test_validation_errors(self, db, admin_user, field, value, expected_error):
        """Test validation for various fields."""
        today = timezone.now().date()
        kwargs = {
            "title": "Invalid Task",
            "start_date": today,
            "end_date": today + timedelta(days=7),
            "created_by": admin_user,
        }

        if field == "end_date":
            kwargs["end_date"] = today + timedelta(days=value)
        elif field == "progress_percentage":
            kwargs[field] = value

        task = Task(**kwargs)
        with pytest.raises(ValidationError) as exc_info:
            task.full_clean()
        assert expected_error in str(exc_info.value)

    @pytest.mark.parametrize(
        "task_fixture,property_name,expected",
        [
            ("overdue_task", "is_overdue", True),
            ("task", "is_overdue", False),
            ("task", "days_remaining", 7),
            ("completed_task", "days_remaining", 0),
            ("task", "duration_days", 7),
        ],
    )
    def test_properties(self, request, task_fixture, property_name, expected):
        """Test computed properties."""
        task_obj = request.getfixturevalue(task_fixture)
        assert getattr(task_obj, property_name) == expected

    def test_timeline_progress_percentage(self, db, admin_user, in_progress_task, overdue_task):
        """Test timeline progress calculations."""
        today = timezone.now().date()

        # Future task
        future_task = Task.objects.create(
            title="Future Task",
            start_date=today + timedelta(days=5),
            end_date=today + timedelta(days=10),
            created_by=admin_user,
        )
        assert future_task.timeline_progress_percentage == 0

        # In progress - 2 days elapsed out of 7
        expected = int((2 / 7) * 100)
        assert in_progress_task.timeline_progress_percentage == expected

        # Past due
        assert overdue_task.timeline_progress_percentage == 100

    def test_auto_status_updates(self, db, admin_user, user):
        """Test automatic status updates on save."""
        today = timezone.now().date()

        # Auto-overdue
        past_task = Task.objects.create(
            title="Past Task",
            start_date=today - timedelta(days=10),
            end_date=today - timedelta(days=1),
            status="in_progress",
            created_by=admin_user,
            assigned_to=user,
        )
        past_task.refresh_from_db()
        assert past_task.status == "overdue"

        # Auto-complete on 100%
        complete_task = Task.objects.create(
            title="Almost Done",
            start_date=today,
            end_date=today + timedelta(days=7),
            status="in_progress",
            progress_percentage=100,
            created_by=admin_user,
            assigned_to=user,
        )
        complete_task.refresh_from_db()
        assert complete_task.status == "completed"
        assert complete_task.completed_at is not None


@pytest.mark.django_db
class TestRelatedModels:
    """Tests for TaskComment and TaskAttachment models."""

    def test_comment(self, task_comment):
        """Test comment creation and representation."""
        assert "admin" in str(task_comment)
        assert task_comment.comment == "This is progressing well!"

    def test_attachment(self, task_attachment):
        """Test attachment creation and representation."""
        assert "test_doc.pdf" in str(task_attachment)
        assert task_attachment.file_size == 1024


# =============================================================================
# Permission Tests
# =============================================================================
@pytest.mark.django_db
class TestPermissions:
    """Tests for task permissions and access control."""

    def test_authentication_required(self, api_client):
        """Test that listing tasks requires authentication."""
        assert api_client.get(reverse("task-list")).status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.parametrize(
        "client_fixture,min_count", [("admin_client", 3), ("pastor_client", 2)]
    )
    def test_admin_and_pastor_see_all(
        self, request, client_fixture, task, in_progress_task, overdue_task, min_count
    ):
        """Test that admins and pastors can see all tasks."""
        client = request.getfixturevalue(client_fixture)
        response = client.get(reverse("task-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= min_count

    def test_ministry_leader_sees_own_ministry_only(
        self, ministry_leader_client, ministry_leader_user, ministry, admin_user
    ):
        """Test ministry leaders see only their ministry's tasks."""
        from apps.ministries.models import Ministry

        today = timezone.now().date()

        # Own ministry task
        Task.objects.create(
            title="Youth Ministry Task",
            start_date=today,
            end_date=today + timedelta(days=7),
            created_by=admin_user,
            ministry=ministry,
        )

        # Other ministry task
        other_ministry = Ministry.objects.create(name="Music Ministry")
        Task.objects.create(
            title="Music Ministry Task",
            start_date=today,
            end_date=today + timedelta(days=7),
            created_by=admin_user,
            ministry=other_ministry,
        )

        response = ministry_leader_client.get(reverse("task-list"))
        titles = [t["title"] for t in response.data["results"]]
        assert "Youth Ministry Task" in titles
        assert "Music Ministry Task" not in titles

    def test_member_sees_only_assigned_tasks(self, auth_client, user, task, admin_user):
        """Test regular members see only assigned tasks."""
        today = timezone.now().date()
        other_user = User.objects.create_user(username="other", password="pass")
        Task.objects.create(
            title="Someone Else's Task",
            start_date=today,
            end_date=today + timedelta(days=7),
            created_by=admin_user,
            assigned_to=other_user,
        )

        response = auth_client.get(reverse("task-list"))
        titles = [t["title"] for t in response.data["results"]]
        assert "Prepare Sunday Service Materials" in titles
        assert "Someone Else's Task" not in titles


# =============================================================================
# CRUD and Actions Tests
# =============================================================================
@pytest.mark.django_db
class TestTaskCRUD:
    """Tests for task CRUD operations."""

    def test_create_task(self, admin_client, admin_user, ministry, user):
        """Test creating a task."""
        today = timezone.now().date()
        response = admin_client.post(
            reverse("task-list"),
            {
                "title": "New Task",
                "description": "Task description",
                "priority": "high",
                "start_date": today.isoformat(),
                "end_date": (today + timedelta(days=7)).isoformat(),
                "assigned_to": user.id,
                "ministry": ministry.id,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "New Task"
        assert Task.objects.get(title="New Task").created_by == admin_user

    def test_create_invalid_timeline(self, admin_client):
        """Test creating task with invalid timeline."""
        today = timezone.now().date()
        response = admin_client.post(
            reverse("task-list"),
            {
                "title": "Invalid Timeline",
                "start_date": (today + timedelta(days=10)).isoformat(),
                "end_date": today.isoformat(),
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "end_date" in response.data

    def test_retrieve_update_delete(self, auth_client, admin_client, task):
        """Test retrieve, update, and delete operations."""
        url = reverse("task-detail", kwargs={"pk": task.pk})

        # Retrieve
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "comments" in response.data

        # Update
        response = admin_client.patch(
            url, {"title": "Updated", "priority": "urgent"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        task.refresh_from_db()
        assert task.title == "Updated"

        # Delete
        response = admin_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Task.objects.filter(pk=task.pk).exists()


@pytest.mark.django_db
class TestTaskActions:
    """Tests for custom task actions."""

    @pytest.mark.parametrize("progress,expected_status", [(75, "in_progress"), (100, "completed")])
    def test_update_progress(self, auth_client, task, progress, expected_status):
        """Test updating task progress."""
        response = auth_client.post(
            reverse("task-update-progress", kwargs={"pk": task.pk}),
            {"progress_percentage": progress},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        task.refresh_from_db()
        assert task.progress_percentage == progress
        assert task.status == expected_status

    def test_update_progress_invalid(self, auth_client, task):
        """Test invalid progress update."""
        response = auth_client.post(
            reverse("task-update-progress", kwargs={"pk": task.pk}),
            {"progress_percentage": 150},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_mark_completed(self, auth_client, task, user, completed_task):
        """Test marking tasks as completed."""
        response = auth_client.post(reverse("task-mark-completed", kwargs={"pk": task.pk}))
        assert response.status_code == status.HTTP_200_OK
        task.refresh_from_db()
        assert task.status == "completed"
        assert task.completed_by == user

        # Already completed
        response = auth_client.post(
            reverse("task-mark-completed", kwargs={"pk": completed_task.pk})
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_reopen_and_cancel(self, auth_client, task, completed_task):
        """Test reopening and cancelling tasks."""
        # Reopen completed
        response = auth_client.post(reverse("task-reopen", kwargs={"pk": completed_task.pk}))
        assert response.status_code == status.HTTP_200_OK
        completed_task.refresh_from_db()
        assert completed_task.status == "in_progress"

        # Can't reopen non-completed
        response = auth_client.post(reverse("task-reopen", kwargs={"pk": task.pk}))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Cancel pending task
        response = auth_client.post(reverse("task-cancel", kwargs={"pk": task.pk}))
        assert response.status_code == status.HTTP_200_OK
        task.refresh_from_db()
        assert task.status == "cancelled"

        # Mark the reopened task as completed again, then try to cancel it
        completed_task.status = "completed"
        completed_task.save()

        # Can't cancel completed
        response = auth_client.post(reverse("task-cancel", kwargs={"pk": completed_task.pk}))
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# =============================================================================
# Dashboard and Filtering Tests
# =============================================================================
@pytest.mark.django_db
class TestDashboardAndFilters:
    """Tests for dashboard endpoints and filtering."""

    def test_dashboard_endpoints(self, admin_client, task, in_progress_task, overdue_task):
        """Test all dashboard endpoints."""
        # Upcoming tasks
        response = admin_client.get(reverse("task-dashboard-upcoming"), {"days": 7})
        titles = [t["title"] for t in response.data]
        assert "Prepare Sunday Service Materials" in titles
        assert "Submit Annual Report" not in titles

        # Overdue tasks
        response = admin_client.get(reverse("task-dashboard-overdue"))
        titles = [t["title"] for t in response.data]
        assert "Submit Annual Report" in titles

        # In progress tasks
        response = admin_client.get(reverse("task-dashboard-in-progress"))
        titles = [t["title"] for t in response.data]
        assert "Update Church Website" in titles

    def test_statistics(
        self, admin_client, task, in_progress_task, overdue_task, completed_task, ministry
    ):
        """Test task statistics."""
        response = admin_client.get(reverse("task-statistics"))
        assert response.data["total"] >= 4
        assert "by_status" in response.data
        assert "overdue" in response.data

        # Filtered by ministry
        response = admin_client.get(reverse("task-statistics"), {"ministry": ministry.id})
        assert response.data["total"] >= 1

    def test_my_tasks(self, auth_client, task, in_progress_task, admin_user):
        """Test getting current user's tasks."""
        other_user = User.objects.create_user(username="other", password="pass")
        today = timezone.now().date()
        Task.objects.create(
            title="Other User Task",
            start_date=today,
            end_date=today + timedelta(days=7),
            created_by=admin_user,
            assigned_to=other_user,
        )

        response = auth_client.get(reverse("task-my-tasks"))
        titles = [t["title"] for t in response.data]
        assert "Prepare Sunday Service Materials" in titles
        assert "Other User Task" not in titles

        # Filtered by status
        response = auth_client.get(reverse("task-my-tasks"), {"status": "pending"})
        assert all(t["status"] == "pending" for t in response.data)

    @pytest.mark.parametrize(
        "filter_param,filter_value,field_check",
        [
            ("status", "in_progress", "status"),
            ("priority", "high", "priority"),
        ],
    )
    def test_filters(
        self, admin_client, task, in_progress_task, filter_param, filter_value, field_check
    ):
        """Test filtering tasks."""
        response = admin_client.get(reverse("task-list"), {filter_param: filter_value})
        assert response.status_code == status.HTTP_200_OK
        assert all(t[field_check] == filter_value for t in response.data["results"])

    def test_search_and_ordering(self, admin_client, task, overdue_task):
        """Test search and ordering."""
        # Search
        response = admin_client.get(reverse("task-list"), {"search": "Sunday Service"})
        titles = [t["title"] for t in response.data["results"]]
        assert "Prepare Sunday Service Materials" in titles

        # Ordering
        response = admin_client.get(reverse("task-list"), {"ordering": "-priority"})
        assert response.data["results"][0]["priority"] == "urgent"


# =============================================================================
# Comments and Attachments Tests
# =============================================================================
@pytest.mark.django_db
class TestCommentsAndAttachments:
    """Tests for task comments and attachments."""

    def test_comment_crud(self, auth_client, task, user, task_comment):
        """Test comment CRUD operations."""
        url_list = reverse("task-comment-list")

        # List
        response = auth_client.get(url_list)
        assert response.data["count"] >= 1

        # Filter by task
        response = auth_client.get(url_list, {"task": task.id})
        assert all(c["task"] == task.id for c in response.data["results"])

        # Create
        response = auth_client.post(
            url_list, {"task": task.id, "comment": "Great progress!"}, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        comment = TaskComment.objects.get(comment="Great progress!")
        assert comment.user == user

        # Update
        url_detail = reverse("task-comment-detail", kwargs={"pk": task_comment.pk})
        response = auth_client.patch(url_detail, {"comment": "Updated"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        task_comment.refresh_from_db()
        assert task_comment.comment == "Updated"

        # Delete
        response = auth_client.delete(url_detail)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_attachment_crud(self, auth_client, task, user, task_attachment):
        """Test attachment CRUD operations."""
        url_list = reverse("task-attachment-list")

        # List and filter
        response = auth_client.get(url_list)
        assert response.data["count"] >= 1
        response = auth_client.get(url_list, {"task": task.id})
        assert all(a["task"] == task.id for a in response.data["results"])

        # Create
        test_file = SimpleUploadedFile("test.txt", b"content")
        response = auth_client.post(
            url_list, {"task": task.id, "file": test_file}, format="multipart"
        )
        assert response.status_code == status.HTTP_201_CREATED
        attachment = TaskAttachment.objects.get(file_name="test.txt")
        assert attachment.uploaded_by == user

        # Delete
        url_detail = reverse("task-attachment-detail", kwargs={"pk": task_attachment.pk})
        response = auth_client.delete(url_detail)
        assert response.status_code == status.HTTP_204_NO_CONTENT


# =============================================================================
# Service Tests
# =============================================================================
@pytest.mark.django_db
class TestServices:
    """Tests for task service functions."""

    def test_get_tasks_by_status(self, task, in_progress_task, overdue_task):
        """Test getting tasks by status."""
        upcoming = list(get_upcoming_tasks(days=7))
        assert task in upcoming
        assert overdue_task not in upcoming

        overdue = list(get_overdue_tasks())
        assert overdue_task in overdue
        assert task not in overdue

        in_progress = list(get_in_progress_tasks())
        assert in_progress_task in in_progress

    def test_task_statistics(self, task, in_progress_task, overdue_task, completed_task):
        """Test getting task statistics."""
        stats = get_task_statistics()
        assert stats["total"] >= 4
        assert "by_status" in stats
        assert stats["overdue"] >= 1

    @pytest.mark.parametrize(
        "progress,expected_status", [(60, "in_progress"), (0, "pending"), (100, "completed")]
    )
    def test_update_task_progress(self, task, in_progress_task, user, progress, expected_status):
        """Test updating task progress."""
        test_task = in_progress_task if progress == 0 else task
        updated = update_task_progress(test_task, progress, user)
        assert updated.progress_percentage == progress
        assert updated.status == expected_status

    def test_mark_completed(self, task, user):
        """Test marking task as completed."""
        completed = mark_task_completed(task, user)
        assert completed.status == "completed"
        assert completed.progress_percentage == 100
        assert completed.completed_by == user

    def test_update_overdue_tasks(self, db, admin_user, user):
        """Test batch updating overdue tasks."""
        today = timezone.now().date()

        # Create with future date, then update to past
        task1 = Task.objects.create(
            title="Past Task 1",
            start_date=today - timedelta(days=10),
            end_date=today + timedelta(days=1),
            status="pending",
            created_by=admin_user,
            assigned_to=user,
        )
        Task.objects.filter(id=task1.id).update(end_date=today - timedelta(days=1))

        task2 = Task.objects.create(
            title="Past Task 2",
            start_date=today - timedelta(days=5),
            end_date=today + timedelta(days=1),
            status="in_progress",
            created_by=admin_user,
            assigned_to=user,
        )
        Task.objects.filter(id=task2.id).update(end_date=today - timedelta(days=1))

        task1.refresh_from_db()
        task2.refresh_from_db()
        assert task1.status == "pending"
        assert task2.status == "in_progress"

        updated_count = update_overdue_tasks()
        assert updated_count >= 2

        task1.refresh_from_db()
        task2.refresh_from_db()
        assert task1.status == "overdue"
        assert task2.status == "overdue"


# =============================================================================
# Serializer Tests
# =============================================================================
@pytest.mark.django_db
class TestSerializers:
    """Tests for task serializers."""

    def test_task_serializer(self, task):
        """Test task serializer includes all fields."""
        from apps.tasks.serializers import TaskSerializer

        data = TaskSerializer(task).data
        computed_fields = [
            "is_overdue",
            "days_remaining",
            "duration_days",
            "timeline_progress_percentage",
        ]
        related_fields = ["created_by_name", "assigned_to_name", "ministry_name"]

        for field in computed_fields + related_fields:
            assert field in data

    def test_lightweight_serializers(self, task):
        """Test lightweight serializers."""
        from apps.tasks.serializers import TaskDashboardSerializer, TaskListSerializer

        # List serializer excludes heavy fields
        list_data = TaskListSerializer(task).data
        assert "comments" not in list_data
        assert "attachments" not in list_data

        # Dashboard serializer has minimal fields
        dashboard_data = TaskDashboardSerializer(task).data
        expected = ["id", "title", "priority", "status", "end_date", "progress_percentage"]
        for field in expected:
            assert field in dashboard_data


# =============================================================================
# Integration Tests
# =============================================================================
@pytest.mark.django_db
class TestIntegration:
    """Integration tests for complete workflows."""

    def test_complete_workflow(self, admin_client, admin_user, user, ministry):
        """Test complete task lifecycle."""
        today = timezone.now().date()

        # 1. Create
        response = admin_client.post(
            reverse("task-list"),
            {
                "title": "Integration Test",
                "priority": "high",
                "start_date": today.isoformat(),
                "end_date": (today + timedelta(days=7)).isoformat(),
                "assigned_to": user.id,
                "ministry": ministry.id,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        task_id = response.data["id"]

        # 2. Add comment
        response = admin_client.post(
            reverse("task-comment-list"),
            {"task": task_id, "comment": "Starting work"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

        # 3. Update progress
        response = admin_client.post(
            reverse("task-update-progress", kwargs={"pk": task_id}),
            {"progress_percentage": 50},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # 4. Complete
        response = admin_client.post(reverse("task-mark-completed", kwargs={"pk": task_id}))
        assert response.status_code == status.HTTP_200_OK

        # 5. Verify
        task = Task.objects.get(id=task_id)
        assert task.status == "completed"
        assert task.progress_percentage == 100
        assert task.comments.count() == 1

    def test_ministry_leader_workflow(
        self, ministry_leader_client, ministry_leader_user, ministry, user
    ):
        """Test ministry leader can manage their ministry's tasks."""
        today = timezone.now().date()
        task = Task.objects.create(
            title="Ministry Leader Task",
            start_date=today,
            end_date=today + timedelta(days=7),
            created_by=ministry_leader_user,
            assigned_to=user,
            ministry=ministry,
        )

        # Can see and update
        response = ministry_leader_client.get(reverse("task-list"))
        titles = [t["title"] for t in response.data["results"]]
        assert "Ministry Leader Task" in titles

        response = ministry_leader_client.patch(
            reverse("task-detail", kwargs={"pk": task.pk}),
            {"priority": "urgent"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
