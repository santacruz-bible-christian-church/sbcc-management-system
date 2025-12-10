from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.tasks.models import Task, TaskAttachment, TaskComment

User = get_user_model()


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
