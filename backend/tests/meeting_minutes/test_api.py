"""
API endpoint tests for Meeting Minutes.
Tests CRUD operations, filtering, search, and permissions.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestMeetingMinutesListCreate:
    """Tests for listing and creating meeting minutes."""

    def test_list_requires_authentication(self, api_client):
        """Test that listing requires authentication."""
        url = reverse("meeting-minutes-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_meeting_minutes(self, admin_client, meeting_minutes, finance_meeting):
        """Test listing all meeting minutes."""
        url = reverse("meeting-minutes-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 2

    def test_create_meeting_minutes(self, admin_client, ministry):
        """Test creating new meeting minutes."""
        url = reverse("meeting-minutes-list")
        data = {
            "title": "New Board Meeting",
            "meeting_date": "2025-12-01",
            "category": "general",
            "content": "Meeting content here.",
            "ministry": ministry.id,
        }

        response = admin_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "New Board Meeting"
        assert "created_by_name" in response.data

    def test_create_sets_created_by(self, admin_client, admin_user):
        """Test that created_by is automatically set."""
        url = reverse("meeting-minutes-list")
        data = {
            "title": "Auto Creator Test",
            "meeting_date": "2025-12-01",
            "category": "general",
            "content": "Content",
        }

        response = admin_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        from apps.meeting_minutes.models import MeetingMinutes

        meeting = MeetingMinutes.objects.get(id=response.data["id"])
        assert meeting.created_by == admin_user

    def test_filter_by_category(self, admin_client, meeting_minutes, finance_meeting):
        """Test filtering by category."""
        url = reverse("meeting-minutes-list")
        response = admin_client.get(url, {"category": "finance"})

        assert response.status_code == status.HTTP_200_OK
        assert all(m["category"] == "finance" for m in response.data["results"])

    def test_filter_by_ministry(self, admin_client, meeting_minutes, ministry):
        """Test filtering by ministry."""
        url = reverse("meeting-minutes-list")
        response = admin_client.get(url, {"ministry": ministry.id})

        assert response.status_code == status.HTTP_200_OK
        assert all(m["ministry"] == ministry.id for m in response.data["results"])

    def test_filter_by_date_range(self, admin_client, meeting_minutes_factory):
        """Test filtering by date range."""
        from datetime import date

        meeting_minutes_factory(title="January Meeting", meeting_date=date(2025, 1, 15))
        meeting_minutes_factory(title="December Meeting", meeting_date=date(2025, 12, 15))

        url = reverse("meeting-minutes-list")
        response = admin_client.get(
            url,
            {
                "meeting_date_after": "2025-12-01",
                "meeting_date_before": "2025-12-31",
            },
        )

        assert response.status_code == status.HTTP_200_OK
        titles = [m["title"] for m in response.data["results"]]
        assert "December Meeting" in titles
        assert "January Meeting" not in titles


@pytest.mark.django_db
class TestMeetingMinutesRetrieveUpdateDelete:
    """Tests for retrieve, update, and delete operations."""

    def test_retrieve_meeting_minutes(self, admin_client, meeting_minutes):
        """Test retrieving single meeting minutes."""
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == meeting_minutes.title
        assert "attachments" in response.data
        assert "versions" in response.data

    def test_update_meeting_minutes(self, admin_client, meeting_minutes):
        """Test updating meeting minutes."""
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        response = admin_client.patch(
            url,
            {"title": "Updated Title", "content": "Updated content"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        meeting_minutes.refresh_from_db()
        assert meeting_minutes.title == "Updated Title"

    def test_update_creates_version(self, admin_client, meeting_minutes):
        """Test that updating content creates a version."""
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_minutes.pk})
        original_content = meeting_minutes.content

        response = admin_client.patch(
            url,
            {"content": "Significantly updated content"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        # Check version was created
        assert meeting_minutes.versions.filter(content=original_content).exists()

    def test_hard_delete(self, admin_client, meeting_minutes):
        """Test hard delete (permanently removes) meeting minutes."""
        from apps.meeting_minutes.models import MeetingMinutes

        meeting_id = meeting_minutes.pk
        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_id})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        # Record should be completely deleted
        assert not MeetingMinutes.objects.filter(pk=meeting_id).exists()

    def test_hard_delete_cascades_attachments(self, admin_client, meeting_attachment):
        """Test that deleting meeting also deletes attachments."""
        from apps.meeting_minutes.models import MeetingMinutes, MeetingMinutesAttachment

        meeting = meeting_attachment.meeting_minutes
        meeting_id = meeting.pk
        attachment_id = meeting_attachment.pk

        url = reverse("meeting-minutes-detail", kwargs={"pk": meeting_id})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        # Both meeting and attachment should be deleted
        assert not MeetingMinutes.objects.filter(pk=meeting_id).exists()
        assert not MeetingMinutesAttachment.objects.filter(pk=attachment_id).exists()


@pytest.mark.django_db
class TestMeetingMinutesSearch:
    """Tests for search endpoint."""

    def test_search_endpoint(self, admin_client, meeting_minutes_factory):
        """Test the search endpoint."""
        meeting_minutes_factory(title="Budget Review", content="Financial planning")
        meeting_minutes_factory(title="Worship Planning", content="Song selection")

        url = reverse("meeting-minutes-search")
        response = admin_client.get(url, {"q": "Budget"})

        assert response.status_code == status.HTTP_200_OK
        titles = [m["title"] for m in response.data]
        assert "Budget Review" in titles

    def test_search_with_category(self, admin_client, meeting_minutes_factory):
        """Test search with category filter."""
        meeting_minutes_factory(title="Finance Budget", category="finance")
        meeting_minutes_factory(title="General Budget", category="general")

        url = reverse("meeting-minutes-search")
        response = admin_client.get(url, {"q": "Budget", "category": "finance"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["category"] == "finance"


@pytest.mark.django_db
class TestMeetingMinutesVersions:
    """Tests for version control endpoints."""

    def test_list_versions(self, admin_client, meeting_with_versions):
        """Test listing version history."""
        url = reverse("meeting-minutes-versions", kwargs={"pk": meeting_with_versions.pk})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_get_specific_version(self, admin_client, meeting_with_versions):
        """Test getting a specific version."""
        url = reverse(
            "meeting-minutes-version-detail",
            kwargs={"pk": meeting_with_versions.pk, "version_number": 1},
        )
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["version_number"] == 1

    def test_restore_version(self, admin_client, meeting_with_versions):
        """Test restoring to a previous version."""
        url = reverse(
            "meeting-minutes-restore",
            kwargs={"pk": meeting_with_versions.pk, "version_number": 1},
        )
        response = admin_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        meeting_with_versions.refresh_from_db()
        # Content should be restored from version 1


@pytest.mark.django_db
class TestMeetingMinutesAttachments:
    """Tests for attachment endpoints."""

    def test_upload_attachment(self, admin_client, meeting_minutes):
        """Test uploading an attachment."""
        from django.core.files.uploadedfile import SimpleUploadedFile

        url = reverse("meeting-minutes-attachments-list")
        test_file = SimpleUploadedFile("test.pdf", b"PDF content")

        response = admin_client.post(
            url,
            {"meeting_minutes": meeting_minutes.id, "file": test_file},
            format="multipart",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["file_name"] == "test.pdf"

    def test_list_attachments(self, admin_client, meeting_attachment):
        """Test listing attachments."""
        url = reverse("meeting-minutes-attachments-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1

    def test_filter_attachments_by_meeting(self, admin_client, meeting_minutes, meeting_attachment):
        """Test filtering attachments by meeting."""
        url = reverse("meeting-minutes-attachments-list")
        response = admin_client.get(url, {"meeting_minutes": meeting_minutes.id})

        assert response.status_code == status.HTTP_200_OK
        assert all(a["meeting_minutes"] == meeting_minutes.id for a in response.data["results"])

    def test_delete_attachment(self, admin_client, meeting_attachment):
        """Test deleting an attachment."""
        url = reverse(
            "meeting-minutes-attachments-detail",
            kwargs={"pk": meeting_attachment.pk},
        )
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestMeetingMinutesCategories:
    """Tests for category endpoint."""

    def test_list_categories(self, admin_client):
        """Test listing available categories."""
        url = reverse("meeting-minutes-categories")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert any(c["value"] == "finance" for c in response.data)
        assert any(c["value"] == "worship" for c in response.data)
