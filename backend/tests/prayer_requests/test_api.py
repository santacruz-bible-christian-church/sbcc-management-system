from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status

from apps.prayer_requests.models import PrayerRequest, PrayerRequestFollowUp


# =============================================================================
# Permission Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestPermissions:
    """Tests for prayer request permissions."""

    def test_list_requires_authentication(self, api_client):
        """Test that listing requires authentication."""
        url = reverse("prayer-request-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_pastor_sees_all_requests(self, pastor_client, prayer_request, public_prayer_request):
        """Test that pastors can see all prayer requests."""
        url = reverse("prayer-request-list")
        response = pastor_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [r["title"] for r in response.data["results"]]
        assert "Test Prayer Request" in titles
        assert "Public Prayer Request" in titles

    def test_authenticated_user_sees_public_requests(
        self, auth_client, prayer_request, public_prayer_request
    ):
        """Test that authenticated users can see public requests."""
        url = reverse("prayer-request-list")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [r["title"] for r in response.data["results"]]
        assert "Public Prayer Request" in titles


# =============================================================================
# Submission Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestSubmission:
    """Tests for prayer request submission."""

    def test_submit_with_member_id(self, auth_client, member_for_prayer):
        """Test submitting a prayer request linked to a member."""
        url = reverse("prayer-request-submit")
        response = auth_client.post(
            url,
            {
                "title": "New Prayer Request",
                "description": "Please pray for me.",
                "category": "spiritual",
                "member_id": member_for_prayer.id,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert PrayerRequest.objects.filter(title="New Prayer Request").exists()

        pr = PrayerRequest.objects.get(title="New Prayer Request")
        assert pr.requester == member_for_prayer

    def test_submit_as_anonymous(self, api_client):
        """Test submitting a prayer request anonymously."""
        url = reverse("prayer-request-submit")
        response = api_client.post(
            url,
            {
                "title": "Anonymous Request",
                "description": "Please pray.",
                "category": "other",
                "is_anonymous": True,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

    def test_submit_requires_name_if_not_anonymous(self, api_client):
        """Test that name is required for non-anonymous non-member submissions."""
        url = reverse("prayer-request-submit")
        response = api_client.post(
            url,
            {
                "title": "Request Without Name",
                "description": "Please pray.",
                "category": "other",
                "is_anonymous": False,
                # requester_name is missing
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "requester_name" in response.data


# =============================================================================
# Assignment Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestAssignment:
    """Tests for prayer request assignment."""

    def test_assign_to_pastor(self, admin_client, prayer_request, pastor_user):
        """Test assigning a prayer request to a pastor."""
        url = reverse("prayer-request-assign", kwargs={"pk": prayer_request.pk})
        response = admin_client.post(
            url,
            {"assigned_to": pastor_user.id},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        prayer_request.refresh_from_db()
        assert prayer_request.assigned_to == pastor_user
        assert prayer_request.status == "assigned"

    def test_cannot_assign_to_regular_member(self, admin_client, prayer_request, user):
        """Test that cannot assign to a regular member."""
        url = reverse("prayer-request-assign", kwargs={"pk": prayer_request.pk})
        response = admin_client.post(
            url,
            {"assigned_to": user.id},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch("apps.prayer_requests.services.send_mail")
    def test_assignment_sends_notification(
        self, mock_send_mail, admin_client, prayer_request, pastor_user
    ):
        """Test that assignment triggers notification."""
        url = reverse("prayer-request-assign", kwargs={"pk": prayer_request.pk})
        admin_client.post(
            url,
            {"assigned_to": pastor_user.id},
            format="json",
        )

        mock_send_mail.assert_called_once()


# =============================================================================
# Follow-up Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestFollowUp:
    """Tests for prayer request follow-ups."""

    def test_add_follow_up(self, pastor_client, prayer_request):
        """Test adding a follow-up to a prayer request."""
        url = reverse("prayer-request-add-follow-up", kwargs={"pk": prayer_request.pk})
        response = pastor_client.post(
            url,
            {
                "action_type": "called",
                "notes": "Called and prayed with the requester.",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert prayer_request.follow_ups.count() == 1

    def test_add_follow_up_with_status_update(self, pastor_client, prayer_request):
        """Test adding a follow-up and updating status."""
        url = reverse("prayer-request-add-follow-up", kwargs={"pk": prayer_request.pk})
        response = pastor_client.post(
            url,
            {
                "action_type": "prayed",
                "notes": "Prayed during service.",
                "update_status": "in_progress",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        prayer_request.refresh_from_db()
        assert prayer_request.status == "in_progress"

    def test_mark_completed(self, pastor_client, prayer_request):
        """Test marking a prayer request as completed."""
        url = reverse("prayer-request-mark-completed", kwargs={"pk": prayer_request.pk})
        response = pastor_client.post(
            url,
            {"notes": "Request has been answered."},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        prayer_request.refresh_from_db()
        assert prayer_request.status == "completed"
        assert prayer_request.completed_at is not None
        assert prayer_request.follow_ups.filter(notes="Request has been answered.").exists()


# =============================================================================
# Custom Endpoint Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestCustomEndpoints:
    """Tests for custom prayer request endpoints."""

    def test_my_requests(self, auth_client, prayer_request, member_for_prayer):
        """Test getting prayer requests for a specific member."""
        url = reverse("prayer-request-my-requests")
        response = auth_client.get(url, {"member_id": member_for_prayer.id})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Test Prayer Request"

    def test_my_requests_requires_member_id(self, auth_client):
        """Test that my_requests requires member_id parameter."""
        url = reverse("prayer-request-my-requests")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_assigned_to_me(self, pastor_client, assigned_prayer_request):
        """Test getting prayer requests assigned to current user."""
        url = reverse("prayer-request-assigned-to-me")
        response = pastor_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Assigned Prayer Request"

    def test_pending_assignment(self, admin_client, prayer_request, assigned_prayer_request):
        """Test getting prayer requests pending assignment."""
        url = reverse("prayer-request-pending-assignment")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [r["title"] for r in response.data]
        assert "Test Prayer Request" in titles
        assert "Assigned Prayer Request" not in titles

    def test_statistics(self, admin_client, prayer_request, assigned_prayer_request):
        """Test getting prayer request statistics."""
        url = reverse("prayer-request-statistics")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["total"] == 2
        assert response.data["pending"] == 1
        assert response.data["assigned"] == 1


# =============================================================================
# Follow-up ViewSet Tests
# =============================================================================
@pytest.mark.django_db
class TestFollowUpViewSet:
    """Tests for the PrayerRequestFollowUpViewSet."""

    def test_list_follow_ups_as_pastor(self, pastor_client, follow_up):
        """Test listing follow-ups as pastor (sees private)."""
        url = reverse("prayer-follow-up-list")
        response = pastor_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_follow_ups_as_member_excludes_private(self, auth_client, follow_up):
        """Test that regular users don't see private follow-ups."""
        url = reverse("prayer-follow-up-list")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Private follow-ups should be excluded
        assert len(response.data["results"]) == 0

    def test_create_follow_up(self, pastor_client, prayer_request):
        """Test creating a follow-up via the viewset."""
        url = reverse("prayer-follow-up-list")
        response = pastor_client.post(
            url,
            {
                "prayer_request": prayer_request.id,
                "action_type": "visited",
                "notes": "Home visit made.",
                "is_private": False,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert PrayerRequestFollowUp.objects.filter(notes="Home visit made.").exists()
