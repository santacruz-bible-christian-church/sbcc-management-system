# tests/announcements/test_api.py
from datetime import timedelta
from unittest.mock import patch

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.announcements.models import Announcement
from apps.ministries.models import Ministry


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
# Validation Tests
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
# Photo Validation Tests
# =============================================================================
@pytest.mark.django_db
class TestAnnouncementPhotoValidation:
    """Tests for announcement photo upload validation."""

    def test_create_announcement_with_photo(self, admin_client):
        """Test creating announcement with valid photo."""
        from io import BytesIO

        from django.core.files.uploadedfile import SimpleUploadedFile
        from PIL import Image

        # Create a real valid image using PIL
        image = Image.new("RGB", (100, 100), color="red")
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        photo = SimpleUploadedFile("test.png", buffer.read(), content_type="image/png")

        url = reverse("announcement-list")
        response = admin_client.post(
            url,
            {
                "title": "Photo Announcement",
                "body": "Announcement with photo",
                "audience": "all",
                "publish_at": timezone.now().isoformat(),
                "photo_upload": photo,  # Use photo_upload for write
            },
            format="multipart",
        )

        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert Announcement.objects.filter(title="Photo Announcement").exists()
        # Verify photo field is returned as URL (not empty string)
        assert response.data["photo"] is not None
        assert "announcements/" in response.data["photo"]

    def test_photo_invalid_extension_rejected(self, admin_client):
        """Test that non-image file extensions are rejected."""
        from django.core.files.uploadedfile import SimpleUploadedFile

        pdf_file = SimpleUploadedFile(
            "document.pdf", b"fake pdf content", content_type="application/pdf"
        )

        url = reverse("announcement-list")
        response = admin_client.post(
            url,
            {
                "title": "PDF Announcement",
                "body": "Trying to upload PDF",
                "audience": "all",
                "publish_at": timezone.now().isoformat(),
                "photo_upload": pdf_file,
            },
            format="multipart",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "photo_upload" in response.data

    def test_photo_optional(self, admin_client):
        """Test that photo field is not required."""
        url = reverse("announcement-list")
        response = admin_client.post(
            url,
            {
                "title": "No Photo Announcement",
                "body": "Announcement without photo",
                "audience": "all",
                "publish_at": timezone.now().isoformat(),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        announcement = Announcement.objects.get(title="No Photo Announcement")
        assert not announcement.photo
        # Verify photo is null, not empty string
        assert response.data["photo"] is None

    def test_photo_returns_null_not_empty_string(self, admin_client, announcement):
        """Test that photo field returns null when no photo is set."""
        url = reverse("announcement-detail", kwargs={"pk": announcement.pk})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # This is the key fix - should be None, not ""
        assert response.data["photo"] is None
