from datetime import timedelta

import pytest
from django.utils import timezone

from apps.announcements.models import Announcement
from apps.ministries.models import MinistryMember


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


@pytest.fixture
def ministry_member(db, ministry, user):
    """Create a ministry membership for the test user."""
    return MinistryMember.objects.create(
        user=user,
        ministry=ministry,
        role="volunteer",
        is_active=True,
    )
