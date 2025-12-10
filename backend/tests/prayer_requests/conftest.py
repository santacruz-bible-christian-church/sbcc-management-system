from datetime import date

import pytest
from django.utils import timezone

from apps.prayer_requests.models import PrayerRequest, PrayerRequestFollowUp


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
