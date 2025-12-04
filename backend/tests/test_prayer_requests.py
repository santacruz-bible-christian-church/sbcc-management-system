from datetime import date
from unittest.mock import patch

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.prayer_requests.models import PrayerRequest, PrayerRequestFollowUp


@pytest.fixture
def pastor_user(create_user):
    """Create a pastor user."""
    return create_user(
        username="pastor",
        email="pastor@example.com",
        role="pastor",
        is_staff=True,
    )


@pytest.fixture
def pastor_client(api_client, pastor_user):
    """Return an authenticated API client for pastor user."""
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(pastor_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def member_profile(db, user):
    """Create a member profile for the test user."""
    from apps.members.models import Member

    return Member.objects.create(
        user=user,
        first_name="Test",
        last_name="Member",
        email="testmember@example.com",
        phone="1234567890",
        date_of_birth=date(1990, 1, 1),
        is_active=True,
    )


@pytest.fixture
def prayer_request(db, member_profile):
    """Create a basic prayer request."""
    return PrayerRequest.objects.create(
        title="Test Prayer Request",
        description="Please pray for my health.",
        category="health",
        requester=member_profile,
        status="pending",
        priority="medium",
    )


@pytest.fixture
def assigned_prayer_request(db, member_profile, pastor_user):
    """Create an assigned prayer request."""
    return PrayerRequest.objects.create(
        title="Assigned Prayer Request",
        description="This request has been assigned.",
        category="family",
        requester=member_profile,
        status="assigned",
        priority="high",
        assigned_to=pastor_user,
        assigned_at=timezone.now(),
    )


@pytest.fixture
def public_prayer_request(db):
    """Create a public prayer request."""
    return PrayerRequest.objects.create(
        title="Public Prayer Request",
        description="Please pray for our community.",
        category="other",
        is_public=True,
        requester_name="Community Member",
        status="pending",
    )


@pytest.fixture
def follow_up(db, prayer_request, pastor_user):
    """Create a follow-up for a prayer request."""
    return PrayerRequestFollowUp.objects.create(
        prayer_request=prayer_request,
        action_type="prayed",
        notes="Prayed for this request during service.",
        created_by=pastor_user,
    )


# =============================================================================
# Model Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestModel:
    """Tests for the PrayerRequest model."""

    def test_prayer_request_str(self, prayer_request):
        """Test string representation."""
        assert "Test Prayer Request" in str(prayer_request)
        assert "Pending" in str(prayer_request)

    def test_requester_display_name_with_member(self, prayer_request):
        """Test requester_display_name with member requester."""
        assert prayer_request.requester_display_name == "Test Member"

    def test_requester_display_name_anonymous(self, prayer_request):
        """Test requester_display_name when anonymous."""
        prayer_request.is_anonymous = True
        prayer_request.save()
        assert prayer_request.requester_display_name == "Anonymous"

    def test_requester_display_name_non_member(self, db):
        """Test requester_display_name for non-member submission."""
        pr = PrayerRequest.objects.create(
            title="Non-member Request",
            description="Test",
            requester_name="John Visitor",
        )
        assert pr.requester_display_name == "John Visitor"

    def test_assign_to(self, prayer_request, pastor_user, admin_user):
        """Test assigning a prayer request."""
        prayer_request.assign_to(pastor_user, assigned_by=admin_user)

        prayer_request.refresh_from_db()
        assert prayer_request.assigned_to == pastor_user
        assert prayer_request.assigned_by == admin_user
        assert prayer_request.assigned_at is not None
        assert prayer_request.status == "assigned"

    def test_mark_completed(self, prayer_request):
        """Test marking a prayer request as completed."""
        prayer_request.mark_completed()

        prayer_request.refresh_from_db()
        assert prayer_request.status == "completed"
        assert prayer_request.completed_at is not None


@pytest.mark.django_db
class TestPrayerRequestFollowUpModel:
    """Tests for the PrayerRequestFollowUp model."""

    def test_follow_up_str(self, follow_up):
        """Test string representation."""
        assert "Prayed For" in str(follow_up)
        assert "Test Prayer Request" in str(follow_up)


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

    def test_member_sees_own_and_public_requests(
        self, auth_client, prayer_request, public_prayer_request, member_profile
    ):
        """Test that members see only their own and public requests."""
        url = reverse("prayer-request-list")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [r["title"] for r in response.data["results"]]
        assert "Test Prayer Request" in titles  # Own request
        assert "Public Prayer Request" in titles  # Public request


# =============================================================================
# Submission Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestSubmission:
    """Tests for prayer request submission."""

    def test_submit_as_authenticated_member(self, auth_client, member_profile):
        """Test submitting a prayer request as authenticated member."""
        url = reverse("prayer-request-submit")
        response = auth_client.post(
            url,
            {
                "title": "New Prayer Request",
                "description": "Please pray for me.",
                "category": "spiritual",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert PrayerRequest.objects.filter(title="New Prayer Request").exists()

        pr = PrayerRequest.objects.get(title="New Prayer Request")
        assert pr.requester == member_profile

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

    def test_my_requests(self, auth_client, prayer_request, member_profile):
        """Test getting user's own prayer requests."""
        url = reverse("prayer-request-my-requests")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Test Prayer Request"

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
# Service Tests
# =============================================================================
@pytest.mark.django_db
class TestPrayerRequestServices:
    """Tests for prayer request services."""

    @patch("apps.prayer_requests.services.send_mail")
    def test_notify_assignment_sends_email(self, mock_send_mail, assigned_prayer_request):
        """Test that notify_assignment sends an email."""
        from apps.prayer_requests.services import notify_assignment

        result = notify_assignment(assigned_prayer_request)

        assert result is True
        mock_send_mail.assert_called_once()

    def test_notify_assignment_no_assignee(self, prayer_request):
        """Test notify_assignment when no assigned user."""
        from apps.prayer_requests.services import notify_assignment

        result = notify_assignment(prayer_request)
        assert result is False

    def test_get_statistics(self, prayer_request, assigned_prayer_request):
        """Test get_prayer_request_statistics."""
        from apps.prayer_requests.services import get_prayer_request_statistics

        stats = get_prayer_request_statistics()

        assert stats["total"] == 2
        assert stats["pending"] == 1
        assert stats["assigned"] == 1
        assert "by_category" in stats
        assert "by_priority" in stats


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

    def test_list_follow_ups_as_member_excludes_private(
        self, auth_client, follow_up, member_profile
    ):
        """Test that members don't see private follow-ups."""
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
