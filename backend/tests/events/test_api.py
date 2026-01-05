"""
Tests for Event API endpoints.
Covers CRUD operations, registration actions, filtering, and integration tests.
"""

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.events.models import Event, EventRegistration
from apps.members.models import Member


# =============================================================================
# CRUD Tests
# =============================================================================
@pytest.mark.django_db
class TestEventCRUD:
    """Tests for event CRUD operations."""

    def test_create_event(self, admin_client, admin_user, ministry):
        """Test creating an event."""
        date = timezone.now() + timedelta(days=7)
        response = admin_client.post(
            reverse("event-list"),
            {
                "title": "Bible Study",
                "description": "Weekly Bible Study",
                "event_type": "bible_study",
                "status": "published",
                "date": date.isoformat(),
                "end_date": (date + timedelta(hours=2)).isoformat(),
                "location": "Room 101",
                "ministry": ministry.id,
                "organizer": admin_user.id,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "Bible Study"
        assert Event.objects.filter(title="Bible Study").exists()

    def test_create_event_without_required_fields(self, admin_client):
        """Test creating event without required fields fails."""
        response = admin_client.post(
            reverse("event-list"),
            {"title": "Incomplete Event"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "date" in response.data or "location" in response.data

    def test_retrieve_event(self, auth_client, event):
        """Test retrieving an event."""
        url = reverse("event-detail", kwargs={"pk": event.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Sunday Service"

    def test_update_event(self, admin_client, event):
        """Test updating an event."""
        url = reverse("event-detail", kwargs={"pk": event.pk})
        response = admin_client.patch(
            url,
            {"title": "Updated Service", "description": "Updated description"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        event.refresh_from_db()
        assert event.title == "Updated Service"
        assert event.description == "Updated description"

    def test_delete_event(self, admin_client, event):
        """Test deleting an event."""
        url = reverse("event-detail", kwargs={"pk": event.pk})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Event.objects.filter(pk=event.pk).exists()


# =============================================================================
# Registration Tests
# =============================================================================
@pytest.mark.django_db
class TestEventRegistration:
    """Tests for event registration actions."""

    def test_register_member(self, auth_client, event, member_for_event):
        """Test registering a member for an event."""
        url = reverse("event-register", kwargs={"pk": event.pk})
        response = auth_client.post(
            url,
            {"member_id": member_for_event.id, "notes": "Looking forward to it!"},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert EventRegistration.objects.filter(event=event, member=member_for_event).exists()

    def test_register_requires_member_id(self, auth_client, event):
        """Test that registration requires member_id."""
        url = reverse("event-register", kwargs={"pk": event.pk})
        response = auth_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "member_id" in response.data["detail"]

    def test_register_nonexistent_member(self, auth_client, event):
        """Test registering a nonexistent member fails."""
        url = reverse("event-register", kwargs={"pk": event.pk})
        response = auth_client.post(url, {"member_id": 99999}, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_double_registration_fails(self, auth_client, event, event_registration):
        """Test that double registration is prevented."""
        url = reverse("event-register", kwargs={"pk": event.pk})
        response = auth_client.post(
            url,
            {"member_id": event_registration.member.id},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Already registered" in response.data["detail"]

    def test_register_full_event_fails(
        self, auth_client, full_event, member_for_event, second_member
    ):
        """Test that registration for full event fails."""
        # Fill the event (max_attendees=2)
        EventRegistration.objects.create(event=full_event, member=member_for_event)
        EventRegistration.objects.create(event=full_event, member=second_member)

        # Create a third member
        third_member = Member.objects.create(
            first_name="Third",
            last_name="Member",
            email="third@example.com",
        )

        url = reverse("event-register", kwargs={"pk": full_event.pk})
        response = auth_client.post(url, {"member_id": third_member.id}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "full" in response.data["detail"].lower()

    def test_unregister_member(self, auth_client, event, event_registration):
        """Test unregistering a member from an event."""
        url = reverse("event-unregister", kwargs={"pk": event.pk})
        response = auth_client.delete(url, QUERY_STRING=f"member_id={event_registration.member.id}")

        assert response.status_code == status.HTTP_200_OK
        assert not EventRegistration.objects.filter(
            event=event, member=event_registration.member
        ).exists()

    def test_unregister_requires_member_id(self, auth_client, event):
        """Test that unregister requires member_id."""
        url = reverse("event-unregister", kwargs={"pk": event.pk})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unregister_not_registered_fails(self, auth_client, event, member_for_event):
        """Test unregistering when not registered fails."""
        url = reverse("event-unregister", kwargs={"pk": event.pk})
        response = auth_client.delete(url, QUERY_STRING=f"member_id={member_for_event.id}")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Not registered" in response.data["detail"]

    def test_get_registrations(self, auth_client, event, event_registration):
        """Test getting all registrations for an event."""
        url = reverse("event-registrations", kwargs={"pk": event.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["member"] == event_registration.member.id


# =============================================================================
# Filter and Search Tests
# =============================================================================
@pytest.mark.django_db
class TestEventFiltersAndSearch:
    """Tests for event filtering and search."""

    def test_filter_by_status(self, admin_client, event, draft_event):
        """Test filtering events by status."""
        url = reverse("event-list")
        response = admin_client.get(url, {"status": "published"})

        assert response.status_code == status.HTTP_200_OK
        titles = [e["title"] for e in response.data["results"]]
        assert "Sunday Service" in titles
        assert "Draft Event" not in titles

    def test_filter_by_event_type(self, admin_client, event, past_event):
        """Test filtering events by event type."""
        url = reverse("event-list")
        response = admin_client.get(url, {"event_type": "fellowship"})

        assert response.status_code == status.HTTP_200_OK
        assert all(e["event_type"] == "fellowship" for e in response.data["results"])

    def test_search_events(self, admin_client, event, past_event):
        """Test searching events by title/description."""
        url = reverse("event-list")
        response = admin_client.get(url, {"search": "Sunday"})

        assert response.status_code == status.HTTP_200_OK
        titles = [e["title"] for e in response.data["results"]]
        assert "Sunday Service" in titles

    def test_ordering(self, admin_client, event, past_event):
        """Test ordering events."""
        url = reverse("event-list")

        # Order by date ascending
        response = admin_client.get(url, {"ordering": "date"})
        assert response.status_code == status.HTTP_200_OK
        dates = [e["date"] for e in response.data["results"]]
        assert dates == sorted(dates)

        # Order by date descending
        response = admin_client.get(url, {"ordering": "-date"})
        dates = [e["date"] for e in response.data["results"]]
        assert dates == sorted(dates, reverse=True)


# =============================================================================
# Integration Tests
# =============================================================================
@pytest.mark.django_db
class TestEventIntegration:
    """Integration tests for complete workflows."""

    def test_complete_event_workflow(self, admin_client, admin_user, ministry):
        """Test complete event lifecycle: create, register, check capacity."""
        # 1. Create event with limited capacity
        date = timezone.now() + timedelta(days=7)
        response = admin_client.post(
            reverse("event-list"),
            {
                "title": "Workshop",
                "event_type": "other",
                "status": "published",
                "date": date.isoformat(),
                "end_date": (date + timedelta(hours=2)).isoformat(),
                "location": "Conference Room",
                "max_attendees": 2,
                "organizer": admin_user.id,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        event_id = response.data["id"]

        # 2. Create members and register
        member1 = Member.objects.create(first_name="Member", last_name="One", email="m1@test.com")
        member2 = Member.objects.create(first_name="Member", last_name="Two", email="m2@test.com")
        member3 = Member.objects.create(first_name="Member", last_name="Three", email="m3@test.com")

        # Register first two
        url = reverse("event-register", kwargs={"pk": event_id})
        admin_client.post(url, {"member_id": member1.id}, format="json")
        admin_client.post(url, {"member_id": member2.id}, format="json")

        # 3. Verify event is full
        event = Event.objects.get(id=event_id)
        assert event.is_full
        assert event.registered_count == 2

        # 4. Third registration should fail
        response = admin_client.post(url, {"member_id": member3.id}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # 5. Unregister one member
        unregister_url = reverse("event-unregister", kwargs={"pk": event_id})
        admin_client.delete(unregister_url, QUERY_STRING=f"member_id={member1.id}")

        # 6. Now third can register
        response = admin_client.post(url, {"member_id": member3.id}, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # 7. Verify registrations
        registrations_url = reverse("event-registrations", kwargs={"pk": event_id})
        response = admin_client.get(registrations_url)
        assert len(response.data) == 2
        member_ids = [r["member"] for r in response.data]
        assert member1.id not in member_ids
        assert member2.id in member_ids
        assert member3.id in member_ids
