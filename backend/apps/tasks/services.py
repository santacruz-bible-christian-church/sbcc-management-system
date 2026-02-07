from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from .models import Task


def get_upcoming_tasks(days=7, ministry=None, assigned_to=None):
    """
    Get tasks with end_date in the next N days
    For dashboard widget: "Upcoming Tasks"
    """
    today = timezone.now().date()
    deadline = today + timedelta(days=days)

    queryset = Task.objects.filter(
        end_date__gte=today,
        end_date__lte=deadline,
        status="pending",
        is_active=True,
    ).select_related("created_by", "assigned_to", "ministry")

    if ministry:
        queryset = queryset.filter(ministry=ministry)

    if assigned_to:
        queryset = queryset.filter(assigned_to=assigned_to)

    return queryset.order_by("end_date", "-priority")


def get_overdue_tasks(ministry=None, assigned_to=None):
    """
    Get tasks past end_date that are not completed
    For dashboard widget: "Late Tasks"
    """
    today = timezone.now().date()

    queryset = Task.objects.filter(
        end_date__lt=today,
        status__in=["pending", "in_progress", "overdue"],
        is_active=True,
    ).select_related("created_by", "assigned_to", "ministry")

    if ministry:
        queryset = queryset.filter(ministry=ministry)

    if assigned_to:
        queryset = queryset.filter(assigned_to=assigned_to)

    return queryset.order_by("end_date", "-priority")


def get_in_progress_tasks(ministry=None, assigned_to=None):
    """
    Get tasks currently in progress
    For dashboard widget: "Tasks in Progress"
    """
    queryset = Task.objects.filter(
        status="in_progress",
        is_active=True,
    ).select_related("created_by", "assigned_to", "ministry")

    if ministry:
        queryset = queryset.filter(ministry=ministry)

    if assigned_to:
        queryset = queryset.filter(assigned_to=assigned_to)

    return queryset.order_by("end_date", "-priority")


def get_task_statistics(ministry=None, assigned_to=None):
    """
    Get task statistics for dashboard
    Returns counts by status, priority, etc.
    """
    queryset = Task.objects.filter(is_active=True)

    if ministry:
        queryset = queryset.filter(ministry=ministry)

    if assigned_to:
        queryset = queryset.filter(assigned_to=assigned_to)

    today = timezone.now().date()

    stats = {
        "total": queryset.count(),
        "by_status": dict(
            queryset.values("status").annotate(count=Count("id")).values_list("status", "count")
        ),
        "by_priority": dict(
            queryset.values("priority").annotate(count=Count("id")).values_list("priority", "count")
        ),
        "overdue": queryset.filter(
            end_date__lt=today, status__in=["pending", "in_progress", "overdue"]
        ).count(),
        "due_this_week": queryset.filter(
            end_date__gte=today,
            end_date__lt=today + timedelta(days=7),
            status__in=["pending", "in_progress"],
        ).count(),
        "completed_this_month": queryset.filter(
            completed_at__year=today.year,
            completed_at__month=today.month,
            status="completed",
        ).count(),
    }

    return stats


def update_task_progress(task, progress_percentage, user):
    """
    Update task progress and auto-update status
    """
    task.progress_percentage = progress_percentage

    # Auto-update status based on progress
    if progress_percentage == 0:
        task.status = "pending"
    elif 0 < progress_percentage < 100:
        task.status = "in_progress"
    elif progress_percentage == 100:
        task.status = "completed"
        task.completed_at = timezone.now()
        task.completed_by = user

    task.save()
    return task


def mark_task_completed(task, user):
    """Mark task as completed"""
    task.status = "completed"
    task.progress_percentage = 100
    task.completed_at = timezone.now()
    task.completed_by = user
    task.save()
    return task


def update_overdue_tasks():
    """
    Batch update tasks to mark them as overdue
    Should be run periodically (e.g., daily cron job)
    """
    today = timezone.now().date()

    updated = Task.objects.filter(
        end_date__lt=today,
        status__in=["pending", "in_progress"],
        is_active=True,
    ).update(status="overdue")

    return updated
