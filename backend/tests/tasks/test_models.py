from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.tasks.models import Task


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
