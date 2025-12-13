from datetime import timedelta

import pytest
from django.utils import timezone

from apps.tasks.models import Task
from apps.tasks.services import (
    get_in_progress_tasks,
    get_overdue_tasks,
    get_task_statistics,
    get_upcoming_tasks,
    mark_task_completed,
    update_overdue_tasks,
    update_task_progress,
)


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
