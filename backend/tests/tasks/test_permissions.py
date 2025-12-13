from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.ministries.models import Ministry
from apps.tasks.models import Task

User = get_user_model()


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

    def test_admin_sees_all_tasks_including_others(self, admin_client, task, admin_user):
        """Test admin users see all tasks including those assigned to other users."""
        today = timezone.now().date()
        other_user = User.objects.create_user(
            username="other", password="pass", role="ministry_leader"
        )
        Task.objects.create(
            title="Someone Else's Task",
            start_date=today,
            end_date=today + timedelta(days=7),
            created_by=admin_user,
            assigned_to=other_user,
        )

        response = admin_client.get(reverse("task-list"))
        titles = [t["title"] for t in response.data["results"]]
        # Admin can see all tasks
        assert "Prepare Sunday Service Materials" in titles
        assert "Someone Else's Task" in titles
