"""
Tests for public API endpoints.
These endpoints require no authentication.
"""

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.announcements.models import Announcement
from apps.events.models import Event
from apps.ministries.models import Ministry
from apps.prayer_requests.models import PrayerRequest


# =============================================================================
# Fixtures
# =============================================================================
@pytest.fixture
def ministry(db):
    """Create a test ministry."""
    return Ministry.objects.create(name="Test Ministry", is_active=True)


@pytest.fixture
def published_announcement(db):
    """Create a published announcement."""
    return Announcement.objects.create(
        title="Published Announcement",
        body="This is a public announcement.",
        audience="all",
        is_active=True,
        publish_at=timezone.now() - timedelta(hours=1),
    )


@pytest.fixture
def future_announcement(db):
    """Create a future (not yet published) announcement."""
    return Announcement.objects.create(
        title="Future Announcement",
        body="This will be published later.",
        audience="all",
        is_active=True,
        publish_at=timezone.now() + timedelta(days=1),
    )


@pytest.fixture
def expired_announcement(db):
    """Create an expired announcement."""
    return Announcement.objects.create(
        title="Expired Announcement",
        body="This has expired.",
        audience="all",
        is_active=True,
        publish_at=timezone.now() - timedelta(days=2),
        expire_at=timezone.now() - timedelta(days=1),
    )


@pytest.fixture
def published_event(db, user):
    """Create a published upcoming event."""
    return Event.objects.create(
        title="Upcoming Event",
        description="A public event.",
        event_type="service",
        status="published",
        date=timezone.now() + timedelta(days=7),
        location="Main Hall",
        organizer=user,
    )


@pytest.fixture
def past_event(db, user):
    """Create a past event."""
    return Event.objects.create(
        title="Past Event",
        description="Already happened.",
        event_type="service",
        status="published",
        date=timezone.now() - timedelta(days=7),
        location="Main Hall",
        organizer=user,
    )


@pytest.fixture
def user(db, django_user_model):
    """Create a test user."""
    return django_user_model.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
        role="admin",
    )


# =============================================================================
# Public Announcements Tests
# =============================================================================
@pytest.mark.django_db
class TestPublicAnnouncementsAPI:
    """Tests for GET /api/public/announcements/"""

    def test_no_auth_required(self, api_client, published_announcement):
        """Test that endpoint is accessible without authentication."""
        url = reverse("public-announcements")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data
        assert "count" in response.data

    def test_returns_only_published_announcements(
        self, api_client, published_announcement, future_announcement
    ):
        """Test that only currently published announcements are returned."""
        url = reverse("public-announcements")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [a["title"] for a in response.data["results"]]

        assert "Published Announcement" in titles
        assert "Future Announcement" not in titles

    def test_excludes_expired_announcements(
        self, api_client, published_announcement, expired_announcement
    ):
        """Test that expired announcements are excluded."""
        url = reverse("public-announcements")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [a["title"] for a in response.data["results"]]

        assert "Published Announcement" in titles
        assert "Expired Announcement" not in titles

    def test_limit_parameter(self, api_client, published_announcement):
        """Test the limit query parameter."""
        url = reverse("public-announcements")
        response = api_client.get(url, {"limit": 5})

        assert response.status_code == status.HTTP_200_OK


# =============================================================================
# Public Prayer Request Submission Tests
# =============================================================================
@pytest.mark.django_db
class TestPublicPrayerRequestSubmitAPI:
    """Tests for POST /api/public/prayer-requests/submit/"""

    def test_no_auth_required_for_anonymous(self, api_client):
        """Test that anonymous submissions work without authentication."""
        url = reverse("public-prayer-request-submit")
        response = api_client.post(
            url,
            {
                "title": "Anonymous Prayer",
                "description": "Please pray for me.",
                "category": "other",
                "is_anonymous": True,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["message"] == "Prayer request submitted successfully."
        assert PrayerRequest.objects.filter(title="Anonymous Prayer").exists()

    def test_submit_with_name_and_email(self, api_client):
        """Test submission with requester contact info."""
        url = reverse("public-prayer-request-submit")
        response = api_client.post(
            url,
            {
                "title": "Named Prayer Request",
                "description": "Please pray for my family.",
                "category": "family",
                "requester_name": "John Doe",
                "requester_email": "john@example.com",
                "is_anonymous": False,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        pr = PrayerRequest.objects.get(title="Named Prayer Request")
        assert pr.requester_name == "John Doe"
        assert pr.requester_email == "john@example.com"
        assert pr.status == "pending"

    def test_name_required_if_not_anonymous(self, api_client):
        """Test that name is required for non-anonymous submissions."""
        url = reverse("public-prayer-request-submit")
        response = api_client.post(
            url,
            {
                "title": "Missing Name",
                "description": "No name provided.",
                "is_anonymous": False,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "requester_name" in response.data

    def test_validates_required_fields(self, api_client):
        """Test that required fields are validated."""
        url = reverse("public-prayer-request-submit")
        response = api_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "title" in response.data
        assert "description" in response.data


# =============================================================================
# Public Events Tests
# =============================================================================
@pytest.mark.django_db
class TestPublicEventsAPI:
    """Tests for GET /api/public/events/"""

    def test_no_auth_required(self, api_client, published_event):
        """Test that endpoint is accessible without authentication."""
        url = reverse("public-events")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data
        assert "count" in response.data

    def test_returns_only_upcoming_published_events(self, api_client, published_event, past_event):
        """Test that only upcoming published events are returned."""
        url = reverse("public-events")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [e["title"] for e in response.data["results"]]

        assert "Upcoming Event" in titles
        assert "Past Event" not in titles

    def test_filter_by_event_type(self, api_client, published_event):
        """Test filtering by event type."""
        url = reverse("public-events")
        response = api_client.get(url, {"event_type": "service"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

        # Test non-matching type
        response = api_client.get(url, {"event_type": "outreach"})
        assert len(response.data["results"]) == 0


# =============================================================================
# Public Settings Tests
# =============================================================================
@pytest.mark.django_db
class TestPublicSettingsAPI:
    """Tests for GET /api/public/settings/"""

    def test_no_auth_required(self, api_client):
        """Test that endpoint is accessible without authentication."""
        url = reverse("public-settings")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "app_name" in response.data
        assert "church_name" in response.data
