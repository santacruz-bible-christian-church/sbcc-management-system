"""
Tests for Member API endpoints.
Covers CRUD operations, custom actions, filtering, and integration tests.
"""

from datetime import date

import pytest
from django.urls import reverse
from rest_framework import status

from apps.members.models import Member


# =============================================================================
# CRUD Tests
# =============================================================================
@pytest.mark.django_db
class TestMemberCRUD:
    """Tests for member CRUD operations."""

    def test_create_member(self, admin_client, ministry):
        """Test creating a member."""
        url = reverse("member-list")
        response = admin_client.post(
            url,
            {
                "first_name": "Jane",
                "last_name": "Smith",
                "email": "jane.smith@example.com",
                "phone": "123-456-7890",
                "gender": "female",
                "ministry": ministry.id,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["first_name"] == "Jane"
        assert response.data["status"] == "active"  # Default
        assert Member.objects.filter(email="jane.smith@example.com").exists()

    def test_create_member_minimal(self, admin_client, ministry):
        """Test creating a member with minimal fields."""
        url = reverse("member-list")
        response = admin_client.post(
            url,
            {
                "first_name": "Minimal",
                "last_name": "Member",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "active"

    def test_create_member_with_family(self, admin_client, ministry):
        """Test creating a member with family members."""
        url = reverse("member-list")
        response = admin_client.post(
            url,
            {
                "first_name": "Parent",
                "last_name": "Member",
                "email": "parent@example.com",
                "ministry": ministry.id,
                "family_members": [
                    {"name": "Spouse Name", "relationship": "Spouse"},
                    {"name": "Child Name", "relationship": "Child", "birthdate": "2015-01-01"},
                ],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert len(response.data["family_members"]) == 2

    def test_list_members(self, admin_client, member, inactive_member):
        """Test listing all members."""
        url = reverse("member-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) >= 2

    def test_retrieve_member(self, admin_client, member):
        """Test retrieving a single member."""
        url = reverse("member-detail", kwargs={"pk": member.pk})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "John"
        assert response.data["last_name"] == "Doe"
        assert response.data["full_name"] == "John Doe"

    def test_update_member(self, admin_client, member):
        """Test updating a member."""
        url = reverse("member-detail", kwargs={"pk": member.pk})
        response = admin_client.patch(
            url,
            {"phone": "555-555-5555", "occupation": "Engineer"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        member.refresh_from_db()
        assert member.phone == "555-555-5555"
        assert member.occupation == "Engineer"

    def test_delete_member(self, admin_client, member):
        """Test deleting a member."""
        pk = member.pk
        url = reverse("member-detail", kwargs={"pk": pk})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Member.objects.filter(pk=pk).exists()


# =============================================================================
# Archive/Restore Tests
# =============================================================================
@pytest.mark.django_db
class TestMemberArchiveRestore:
    """Tests for archive/restore functionality."""

    def test_archive_member(self, admin_client, member):
        """Test archiving a member."""
        url = reverse("member-archive", kwargs={"pk": member.pk})
        response = admin_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        member.refresh_from_db()
        assert member.status == "archived"
        assert member.is_active is False
        assert member.archived_at is not None

    def test_restore_archived_member(self, admin_client, archived_member):
        """Test restoring an archived member."""
        url = reverse("member-restore", kwargs={"pk": archived_member.pk})
        response = admin_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        archived_member.refresh_from_db()
        assert archived_member.status == "active"
        assert archived_member.is_active is True
        assert archived_member.archived_at is None

    def test_restore_non_archived_member_fails(self, admin_client, member):
        """Test that restoring a non-archived member fails."""
        url = reverse("member-restore", kwargs={"pk": member.pk})
        response = admin_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "not archived" in response.data["detail"].lower()

    def test_bulk_archive(self, admin_client, multiple_members):
        """Test bulk archiving members."""
        ids = [m.id for m in multiple_members[:3]]
        url = reverse("member-bulk-archive")
        response = admin_client.post(url, {"ids": ids}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["archived_count"] == 3

        for member_id in ids:
            member = Member.objects.get(id=member_id)
            assert member.status == "archived"


# =============================================================================
# Status Management Tests
# =============================================================================
@pytest.mark.django_db
class TestMemberStatusManagement:
    """Tests for status management."""

    def test_set_status(self, admin_client, multiple_members):
        """Test setting status for multiple members."""
        ids = [m.id for m in multiple_members[:2]]
        url = reverse("member-set-status")
        response = admin_client.post(
            url,
            {"ids": ids, "status": "inactive"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["updated_count"] == 2

        for member_id in ids:
            member = Member.objects.get(id=member_id)
            assert member.status == "inactive"

    def test_set_status_invalid_status(self, admin_client, multiple_members):
        """Test that invalid status values are rejected."""
        ids = [m.id for m in multiple_members[:1]]
        url = reverse("member-set-status")
        response = admin_client.post(
            url,
            {"ids": ids, "status": "invalid_status"},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


# =============================================================================
# Statistics Tests
# =============================================================================
@pytest.mark.django_db
class TestMemberStats:
    """Tests for member statistics endpoints."""

    def test_stats_endpoint(self, admin_client, member, inactive_member, archived_member):
        """Test getting member statistics."""
        url = reverse("member-stats")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "total" in response.data
        assert "active" in response.data
        assert "inactive" in response.data
        assert "archived" in response.data
        assert response.data["total"] >= 3

    def test_demographics_endpoint(self, admin_client, member, inactive_member):
        """Test getting demographics."""
        url = reverse("member-demographics")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_ministry_demographics(self, admin_client, ministry, member):
        """Test getting ministry demographics."""
        url = reverse("member-ministry-demographics")
        response = admin_client.get(url, {"ministry": ministry.id})

        assert response.status_code == status.HTTP_200_OK

    def test_ministry_demographics_requires_ministry(self, admin_client):
        """Test that ministry_demographics requires ministry parameter."""
        url = reverse("member-ministry-demographics")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


# =============================================================================
# Upcoming Events Tests
# =============================================================================
@pytest.mark.django_db
class TestUpcomingEvents:
    """Tests for upcoming birthdays/anniversaries."""

    def test_upcoming_birthdays(self, admin_client, member_with_birthday):
        """Test getting upcoming birthdays."""
        url = reverse("member-upcoming-birthdays")
        response = admin_client.get(url, {"days": 7})

        assert response.status_code == status.HTTP_200_OK
        # Response may or may not contain members depending on date logic

    def test_upcoming_anniversaries(self, admin_client, member_with_anniversary):
        """Test getting upcoming anniversaries."""
        url = reverse("member-upcoming-anniversaries")
        response = admin_client.get(url, {"days": 7})

        assert response.status_code == status.HTTP_200_OK


# =============================================================================
# Export Tests
# =============================================================================
@pytest.mark.django_db
class TestMemberExport:
    """Tests for member export functionality."""

    def test_export_pdf(self, admin_client, member, inactive_member):
        """Test exporting members as PDF."""
        url = reverse("member-export-pdf")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"
        assert "attachment" in response["Content-Disposition"]

    def test_export_pdf_with_filters(self, admin_client, member, inactive_member):
        """Test exporting PDF with filters."""
        url = reverse("member-export-pdf")
        response = admin_client.get(url, {"status": "active"})

        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"


# =============================================================================
# Filter and Search Tests
# =============================================================================
@pytest.mark.django_db
class TestMemberFiltering:
    """Tests for member filtering and search."""

    def test_filter_by_status(self, admin_client, member, inactive_member):
        """Test filtering by status."""
        url = reverse("member-list")
        response = admin_client.get(url, {"status": "active"})

        assert response.status_code == status.HTTP_200_OK
        assert all(m["status"] == "active" for m in response.data["results"])

    def test_filter_by_gender(self, admin_client, member, inactive_member):
        """Test filtering by gender."""
        url = reverse("member-list")
        response = admin_client.get(url, {"gender": "male"})

        assert response.status_code == status.HTTP_200_OK
        assert all(m["gender"] == "male" for m in response.data["results"])

    def test_search_by_name(self, admin_client, member, inactive_member):
        """Test searching by name."""
        url = reverse("member-list")
        response = admin_client.get(url, {"search": "John"})

        assert response.status_code == status.HTTP_200_OK
        # John Doe should be in results
        names = [m["first_name"] for m in response.data["results"]]
        assert "John" in names

    def test_ordering(self, admin_client, member, inactive_member):
        """Test ordering members."""
        url = reverse("member-list")
        response = admin_client.get(url, {"ordering": "first_name"})

        assert response.status_code == status.HTTP_200_OK
        names = [m["first_name"] for m in response.data["results"]]
        assert names == sorted(names)


# =============================================================================
# Integration Tests
# =============================================================================
@pytest.mark.django_db
class TestMemberIntegration:
    """Integration tests for complete workflows."""

    def test_complete_member_lifecycle(self, admin_client, ministry):
        """Test complete member lifecycle: create, update, archive, restore."""
        # 1. Create member
        url = reverse("member-list")
        response = admin_client.post(
            url,
            {
                "first_name": "Lifecycle",
                "last_name": "Test",
                "email": "lifecycle@test.com",
                "ministry": ministry.id,
                "gender": "male",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        member_id = response.data["id"]

        # 2. Update member
        detail_url = reverse("member-detail", kwargs={"pk": member_id})
        response = admin_client.patch(
            detail_url,
            {"phone": "111-222-3333", "occupation": "Developer"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # 3. Archive member
        archive_url = reverse("member-archive", kwargs={"pk": member_id})
        response = admin_client.post(archive_url)
        assert response.status_code == status.HTTP_200_OK

        # 4. Verify archived
        response = admin_client.get(detail_url)
        assert response.data["status"] == "archived"

        # 5. Restore member
        restore_url = reverse("member-restore", kwargs={"pk": member_id})
        response = admin_client.post(restore_url)
        assert response.status_code == status.HTTP_200_OK

        # 6. Verify restored
        response = admin_client.get(detail_url)
        assert response.data["status"] == "active"

        # 7. Get stats
        stats_url = reverse("member-stats")
        response = admin_client.get(stats_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["active"] >= 1
