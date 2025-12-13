from datetime import timedelta

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone

from apps.tasks.models import Task, TaskAttachment, TaskComment


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
    return task_factory(
        title="Organize Youth Camp",
        days_offset_start=-30,
        days_offset_end=-10,
        status_val="completed",
        progress=100,
        priority="high",
        completed_at=timezone.now() - timedelta(days=10),
        completed_by=user,
    )


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
