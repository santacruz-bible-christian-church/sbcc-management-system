"""
Fixtures for events tests.
"""

from datetime import timedelta

import pytest
from django.utils import timezone

from apps.events.models import Event, EventRegistration
from apps.members.models import Member


@pytest.fixture
def event_factory(admin_user, ministry):
    """Factory to create events with custom parameters."""

    def _create_event(
        title="Test Event",
        days_offset=7,
        event_type="service",
        status_val="published",
        **kwargs,
    ):
        date = timezone.now() + timedelta(days=days_offset)
        defaults = {
            "title": title,
            "description": "Event description",
            "event_type": event_type,
            "status": status_val,
            "date": date,
            "end_date": date + timedelta(hours=2),
            "location": "Main Hall",
            "organizer": admin_user,
            "ministry": ministry,
        }
        defaults.update(kwargs)
        return Event.objects.create(**defaults)

    return _create_event


@pytest.fixture
def event(event_factory):
    """Create a basic upcoming published event."""
    return event_factory(title="Sunday Service")


@pytest.fixture
def past_event(event_factory):
    """Create a past published event."""
    return event_factory(
        title="Past Fellowship",
        days_offset=-7,
        event_type="fellowship",
        status_val="completed",
    )


@pytest.fixture
def draft_event(event_factory):
    """Create a draft event."""
    return event_factory(
        title="Draft Event",
        days_offset=14,
        status_val="draft",
    )


@pytest.fixture
def full_event(event_factory):
    """Create an event at full capacity."""
    return event_factory(
        title="Full Event",
        days_offset=3,
        max_attendees=2,
    )


@pytest.fixture
def member_for_event(db, ministry):
    """Create a member for event registration tests."""
    return Member.objects.create(
        first_name="Test",
        last_name="Member",
        email="testmember@example.com",
        ministry=ministry,
    )


@pytest.fixture
def second_member(db, ministry):
    """Create a second member for event registration tests."""
    return Member.objects.create(
        first_name="Second",
        last_name="Member",
        email="secondmember@example.com",
        ministry=ministry,
    )


@pytest.fixture
def event_registration(event, member_for_event):
    """Create an event registration."""
    return EventRegistration.objects.create(
        event=event,
        member=member_for_event,
        notes="Test registration",
    )
