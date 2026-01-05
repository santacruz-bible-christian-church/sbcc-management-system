"""
Tests for Event model properties and methods.
"""

from datetime import timedelta

import pytest
from django.utils import timezone

from apps.events.models import Event, EventRegistration


# =============================================================================
# Model Property Tests
# =============================================================================
@pytest.mark.django_db
class TestEventModelProperties:
    """Tests for event model properties."""

    def test_is_full_property(self, full_event, member_for_event, second_member):
        """Test is_full property."""
        assert not full_event.is_full

        EventRegistration.objects.create(event=full_event, member=member_for_event)
        assert not full_event.is_full

        EventRegistration.objects.create(event=full_event, member=second_member)
        assert full_event.is_full

    def test_available_slots_property(self, full_event, member_for_event):
        """Test available_slots property."""
        assert full_event.available_slots == 2

        EventRegistration.objects.create(event=full_event, member=member_for_event)
        assert full_event.available_slots == 1

    def test_registered_count_property(self, event, member_for_event, second_member):
        """Test registered_count property."""
        assert event.registered_count == 0

        EventRegistration.objects.create(event=event, member=member_for_event)
        assert event.registered_count == 1

        EventRegistration.objects.create(event=event, member=second_member)
        assert event.registered_count == 2

    def test_unlimited_capacity_event(self, event):
        """Test event without max_attendees (unlimited capacity)."""
        assert event.max_attendees is None
        assert event.available_slots is None
        assert not event.is_full

    def test_event_string_representation(self, event):
        """Test event __str__ method."""
        assert event.title in str(event)

    def test_event_registration_string_representation(self, event_registration):
        """Test event registration __str__ method."""
        assert event_registration.member.full_name in str(event_registration)
        assert event_registration.event.title in str(event_registration)
