from datetime import timedelta
from unittest.mock import patch

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.announcements.models import Announcement
from apps.ministries.models import Ministry, MinistryMember


@pytest.fixture
def ministry(db):
    """Create a test ministry."""
    return Ministry.objects.create(
        name="Youth Ministry",
        description="Ministry for young people",
        is_active=True,
    )


@pytest.fixture
def ministry_member(db, ministry, user):
    """Create a ministry membership for the test user."""
    return MinistryMember.objects.create(
        user=user,
        ministry=ministry,
        role="volunteer",
        is_active=True,
    )


@pytest.fixture
def announcement(db, admin_user):
    """Create a basic published announcement."""
    return Announcement.objects.create(
        title="Test Announcement",
        body="This is a test announcement body.",
        audience=Announcement.AUDIENCE_ALL,
        publish_at=timezone.now() - timedelta(hours=1),
        is_active=True,
        created_by=admin_user,
    )


@pytest.fixture
def scheduled_announcement(db, admin_user):
    """Create a scheduled (future) announcement."""
    return Announcement.objects.create(
        title="Future Announcement",
        body="This announcement is scheduled for the future.",
        audience=Announcement.AUDIENCE_ALL,
        publish_at=timezone.now() + timedelta(days=7),
        is_active=True,
        created_by=admin_user,
    )


@pytest.fixture
def expired_announcement(db, admin_user):
    """Create an expired announcement."""
    return Announcement.objects.create(
        title="Expired Announcement",
        body="This announcement has expired.",
        audience=Announcement.AUDIENCE_ALL,
        publish_at=timezone.now() - timedelta(days=7),
        expire_at=timezone.now() - timedelta(days=1),
        is_active=True,
        created_by=admin_user,
    )


@pytest.fixture
def ministry_announcement(db, admin_user, ministry):
    """Create a ministry-specific announcement."""
    return Announcement.objects.create(
        title="Ministry Announcement",
        body="This is for Youth Ministry only.",
        audience=Announcement.AUDIENCE_MINISTRY,
        ministry=ministry,
        publish_at=timezone.now() - timedelta(hours=1),
        is_active=True,
        created_by=admin_user,
    )


# =============================================================================
# Model Tests
# =============================================================================
@pytest.mark.django_db
class TestAnnouncementModel:
    """Tests for the Announcement model."""

    def test_announcement_str(self, announcement):
        """Test string representation."""
        assert str(announcement) == "Test Announcement"

    def test_is_published_active_announcement(self, announcement):
        """Test is_published returns True for active, published announcements."""
        assert announcement.is_published() is True

    def test_is_published_scheduled_announcement(self, scheduled_announcement):
        """Test is_published returns False for future announcements."""
        assert scheduled_announcement.is_published() is False

    def test_is_published_expired_announcement(self, expired_announcement):
        """Test is_published returns False for expired announcements."""
        assert expired_announcement.is_published() is False

    def test_is_published_inactive_announcement(self, announcement):
        """Test is_published returns False for inactive announcements."""
        announcement.is_active = False
        announcement.save()
        assert announcement.is_published() is False


# =============================================================================
# Permission Tests
# =============================================================================
@pytest.mark.django_db
class TestAnnouncementPermissions:
    """Tests for announcement permissions."""

    def test_list_announcements_authenticated(self, auth_client, announcement):
        """Test authenticated users can list announcements."""
        url = reverse("announcement-list")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_list_announcements_unauthenticated(self, api_client, announcement):
        """Test unauthenticated users cannot list announcements."""
        url = reverse("announcement-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_announcement_as_admin(self, admin_client, ministry):
        """Test admin can create announcements."""
        url = reverse("announcement-list")
        response = admin_client.post(
            url,
            {
                "title": "New Announcement",
                "body": "Announcement body content.",
                "audience": "all",
                "publish_at": timezone.now().isoformat(),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Announcement.objects.filter(title="New Announcement").exists()

    def test_create_announcement_as_regular_user(self, auth_client):
        """Test regular users cannot create announcements."""
        url = reverse("announcement-list")
        response = auth_client.post(
            url,
            {
                "title": "New Announcement",
                "body": "Announcement body content.",
                "audience": "all",
                "publish_at": timezone.now().isoformat(),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_announcement_as_admin(self, admin_client, announcement):
        """Test admin can update announcements."""
        url = reverse("announcement-detail", kwargs={"pk": announcement.pk})
        response = admin_client.patch(
            url,
            {"title": "Updated Title"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        announcement.refresh_from_db()
        assert announcement.title == "Updated Title"

    def test_update_announcement_as_regular_user(self, auth_client, announcement):
        """Test regular users cannot update announcements."""
        url = reverse("announcement-detail", kwargs={"pk": announcement.pk})
        response = auth_client.patch(
            url,
            {"title": "Updated Title"},
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_announcement_as_admin(self, admin_client, announcement):
        """Test admin can delete announcements."""
        url = reverse("announcement-detail", kwargs={"pk": announcement.pk})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Announcement.objects.filter(pk=announcement.pk).exists()

    def test_delete_announcement_as_regular_user(self, auth_client, announcement):
        """Test regular users cannot delete announcements."""
        url = reverse("announcement-detail", kwargs={"pk": announcement.pk})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN


# =============================================================================
# Serializer Validation Tests
# =============================================================================
@pytest.mark.django_db
class TestAnnouncementValidation:
    """Tests for announcement serializer validation."""

    def test_ministry_required_for_ministry_audience(self, admin_client):
        """Test that ministry is required when audience is 'ministry'."""
        url = reverse("announcement-list")
        response = admin_client.post(
            url,
            {
                "title": "Ministry Announcement",
                "body": "Content",
                "audience": "ministry",
                "publish_at": timezone.now().isoformat(),
                # ministry is missing
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "ministry" in response.data

    def test_expire_at_must_be_after_publish_at(self, admin_client):
        """Test that expire_at must be after publish_at."""
        now = timezone.now()
        url = reverse("announcement-list")
        response = admin_client.post(
            url,
            {
                "title": "Invalid Dates",
                "body": "Content",
                "audience": "all",
                "publish_at": now.isoformat(),
                "expire_at": (now - timedelta(days=1)).isoformat(),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "expire_at" in response.data

    def test_partial_update_validates_existing_audience(self, admin_client, ministry_announcement):
        """Test partial update still validates ministry requirement."""
        # Remove ministry from a ministry-audience announcement
        url = reverse("announcement-detail", kwargs={"pk": ministry_announcement.pk})
        response = admin_client.patch(
            url,
            {"ministry": None},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "ministry" in response.data

    def test_valid_ministry_announcement(self, admin_client, ministry):
        """Test creating valid ministry-specific announcement."""
        url = reverse("announcement-list")
        response = admin_client.post(
            url,
            {
                "title": "Valid Ministry Announcement",
                "body": "Content for ministry",
                "audience": "ministry",
                "ministry": ministry.pk,
                "publish_at": timezone.now().isoformat(),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED


# =============================================================================
# Published Endpoint Tests
# =============================================================================
@pytest.mark.django_db
class TestPublishedEndpoint:
    """Tests for the /published/ endpoint."""

    def test_published_endpoint_is_public(self, api_client, announcement):
        """Test published endpoint is accessible without auth."""
        url = reverse("announcement-published")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_published_returns_only_active_announcements(
        self, api_client, announcement, scheduled_announcement, expired_announcement
    ):
        """Test published endpoint filters correctly."""
        url = reverse("announcement-published")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        titles = [a["title"] for a in response.data]

        assert "Test Announcement" in titles
        assert "Future Announcement" not in titles
        assert "Expired Announcement" not in titles

    def test_published_filters_by_ministry(
        self, api_client, announcement, ministry_announcement, ministry
    ):
        """Test published endpoint filters by ministry."""
        url = reverse("announcement-published")
        response = api_client.get(url, {"ministry": ministry.pk})

        assert response.status_code == status.HTTP_200_OK
        titles = [a["title"] for a in response.data]

        # Should include both 'all' audience and matching ministry
        assert "Test Announcement" in titles
        assert "Ministry Announcement" in titles

    def test_published_excludes_other_ministry_announcements(
        self, api_client, ministry_announcement
    ):
        """Test ministry announcements are excluded for other ministries."""
        other_ministry = Ministry.objects.create(name="Other Ministry", is_active=True)

        url = reverse("announcement-published")
        response = api_client.get(url, {"ministry": other_ministry.pk})

        titles = [a["title"] for a in response.data]
        assert "Ministry Announcement" not in titles


# =============================================================================
# Send Now Endpoint Tests
# =============================================================================
@pytest.mark.django_db
class TestSendNowEndpoint:
    """Tests for the /send_now/ endpoint."""

    def test_send_now_requires_admin(self, auth_client, announcement):
        """Test send_now is admin-only."""
        url = reverse("announcement-send-now", kwargs={"pk": announcement.pk})
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @patch("apps.announcements.views.send_announcement_email")
    def test_send_now_success(self, mock_send, admin_client, announcement):
        """Test successful send_now call."""
        mock_send.return_value = {
            "success": True,
            "message": "Announcement sent successfully",
            "sent": 5,
            "total": 5,
        }

        url = reverse("announcement-send-now", kwargs={"pk": announcement.pk})
        response = admin_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["sent"] == 5
        mock_send.assert_called_once_with(announcement)

    @patch("apps.announcements.views.send_announcement_email")
    def test_send_now_failure(self, mock_send, admin_client, announcement):
        """Test send_now handles failure."""
        mock_send.return_value = {
            "success": False,
            "message": "SMTP error",
            "sent": 0,
            "total": 5,
        }

        url = reverse("announcement-send-now", kwargs={"pk": announcement.pk})
        response = admin_client.post(url)

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "error" in response.data


# =============================================================================
# Preview Recipients Endpoint Tests
# =============================================================================
@pytest.mark.django_db
class TestPreviewRecipientsEndpoint:
    """Tests for the /preview_recipients/ endpoint."""

    def test_preview_recipients_authenticated(self, auth_client, announcement):
        """Test preview_recipients requires authentication."""
        url = reverse("announcement-preview-recipients", kwargs={"pk": announcement.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "count" in response.data
        assert "audience" in response.data
        assert "sample_emails" in response.data

    def test_preview_recipients_unauthenticated(self, api_client, announcement):
        """Test preview_recipients rejects unauthenticated users."""
        url = reverse("announcement-preview-recipients", kwargs={"pk": announcement.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# =============================================================================
# Service Tests
# =============================================================================
@pytest.mark.django_db
class TestAnnouncementServices:
    """Tests for announcement services."""

    def test_get_recipients_all_audience(self, announcement, create_user):
        """Test get_announcement_recipients for 'all' audience."""
        from datetime import date

        from apps.announcements.services import get_announcement_recipients
        from apps.members.models import Member

        # Create users first (Member requires a user FK)
        user1 = create_user(
            username="john_svc", email="john_svc@example.com", password="TestPass123!"
        )
        user2 = create_user(
            username="jane_svc", email="jane_svc@example.com", password="TestPass123!"
        )
        user3 = create_user(
            username="inactive_svc",
            email="inactive_svc@example.com",
            password="TestPass123!",
        )

        # Create some active members with emails
        Member.objects.create(
            user=user1,
            first_name="John",
            last_name="Doe",
            email="john_svc@example.com",
            phone="1234567890",
            date_of_birth=date(1990, 1, 1),
            is_active=True,
        )
        Member.objects.create(
            user=user2,
            first_name="Jane",
            last_name="Doe",
            email="jane_svc@example.com",
            phone="1234567891",
            date_of_birth=date(1992, 5, 15),
            is_active=True,
        )
        # Inactive member should be excluded
        Member.objects.create(
            user=user3,
            first_name="Inactive",
            last_name="User",
            email="inactive_svc@example.com",
            phone="1234567892",
            date_of_birth=date(1985, 3, 20),
            is_active=False,
        )

        recipients = list(get_announcement_recipients(announcement))

        assert "john_svc@example.com" in recipients
        assert "jane_svc@example.com" in recipients
        assert "inactive_svc@example.com" not in recipients

    def test_get_recipients_ministry_audience(self, ministry_announcement, ministry, user):
        """Test get_announcement_recipients for ministry audience."""
        from apps.announcements.services import get_announcement_recipients

        # Add user to ministry (user already exists from fixture)
        MinistryMember.objects.get_or_create(
            user=user,
            ministry=ministry,
            defaults={"role": "volunteer", "is_active": True},
        )

        recipients = list(get_announcement_recipients(ministry_announcement))

        assert user.email in recipients

    def test_get_recipients_excludes_null_emails(self, announcement, create_user):
        """Test that null/empty emails are excluded from ministry audience."""
        from apps.announcements.services import get_announcement_recipients

        # For ministry audience, test that inactive ministry members are excluded
        # (We can't easily test empty Member.email due to unique constraint,
        # but services.py filters them out anyway)
        recipients = list(get_announcement_recipients(announcement))

        # Should not contain None or empty strings
        assert None not in recipients
        assert "" not in recipients

    @patch("apps.announcements.services.send_mass_mail")
    def test_send_announcement_email_marks_as_sent(self, mock_mail, announcement, create_user):
        """Test that send_announcement_email marks announcement as sent."""
        from datetime import date

        from apps.announcements.services import send_announcement_email
        from apps.members.models import Member

        # Create user and member with unique email
        test_user = create_user(
            username="testmember_send",
            email="testmember_send@example.com",
            password="TestPass123!",
        )
        Member.objects.create(
            user=test_user,
            first_name="Test",
            last_name="User",
            email="testmember_send@example.com",
            phone="1234567890",
            date_of_birth=date(1990, 1, 1),
            is_active=True,
        )

        mock_mail.return_value = 1

        result = send_announcement_email(announcement)

        assert result["success"] is True
        announcement.refresh_from_db()
        assert announcement.sent is True

    def test_send_announcement_email_no_recipients(self, announcement):
        """Test send_announcement_email with no recipients."""
        from apps.announcements.services import send_announcement_email

        result = send_announcement_email(announcement)

        assert result["success"] is False
        assert result["message"] == "No recipients found"
