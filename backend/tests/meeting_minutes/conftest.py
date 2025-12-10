"""
Fixtures specific to Meeting Minutes tests.
Following factory pattern for flexible test data creation.
"""

from datetime import date, timedelta

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone


@pytest.fixture
def meeting_minutes_factory(db, admin_user, ministry):
    """Factory to create meeting minutes with custom parameters."""
    from apps.meeting_minutes.models import MeetingMinutes

    def _create_meeting(
        title="Board Meeting",
        meeting_date=None,
        category="general",
        content="Meeting content here.",
        **kwargs,
    ):
        if meeting_date is None:
            meeting_date = timezone.now().date()

        defaults = {
            "title": title,
            "meeting_date": meeting_date,
            "category": category,
            "content": content,
            "created_by": admin_user,
            "ministry": ministry,
        }
        defaults.update(kwargs)
        return MeetingMinutes.objects.create(**defaults)

    return _create_meeting


@pytest.fixture
def meeting_minutes(meeting_minutes_factory):
    """Create a basic meeting minutes record."""
    return meeting_minutes_factory(
        title="Monthly Board Meeting",
        content="Discussed budget allocation and upcoming events.",
    )


@pytest.fixture
def finance_meeting(meeting_minutes_factory):
    """Create a finance category meeting."""
    return meeting_minutes_factory(
        title="Finance Committee Meeting",
        category="finance",
        content="Reviewed quarterly financial statements and approved budget.",
    )


@pytest.fixture
def worship_meeting(meeting_minutes_factory):
    """Create a worship category meeting."""
    return meeting_minutes_factory(
        title="Worship Team Planning",
        category="worship",
        content="Planned worship schedule for the next month.",
    )


@pytest.fixture
def meeting_with_versions(meeting_minutes_factory, admin_user):
    """Create meeting minutes with version history."""
    from apps.meeting_minutes.models import MeetingMinutesVersion

    meeting = meeting_minutes_factory(
        title="Versioned Meeting",
        content="Version 1 content",
    )

    # Create version history
    MeetingMinutesVersion.objects.create(
        meeting_minutes=meeting,
        version_number=1,
        content="Original content",
        changed_by=admin_user,
        change_summary="Initial creation",
    )

    return meeting


@pytest.fixture
def meeting_attachment_factory(db, admin_user):
    """Factory to create meeting attachments."""
    from apps.meeting_minutes.models import MeetingMinutesAttachment

    def _create_attachment(
        meeting_minutes, filename="document.pdf", content=b"file content", **kwargs
    ):
        defaults = {
            "meeting_minutes": meeting_minutes,
            "uploaded_by": admin_user,
            "file": SimpleUploadedFile(filename, content),
            "file_name": filename,
            "file_size": len(content),
            "file_type": filename.split(".")[-1],
        }
        defaults.update(kwargs)
        return MeetingMinutesAttachment.objects.create(**defaults)

    return _create_attachment


@pytest.fixture
def meeting_attachment(meeting_minutes, meeting_attachment_factory):
    """Create a basic meeting attachment."""
    return meeting_attachment_factory(
        meeting_minutes,
        filename="meeting_notes.pdf",
        content=b"PDF content here",
    )


@pytest.fixture
def meeting_with_searchable_attachment(meeting_minutes, meeting_attachment_factory):
    """Create meeting with attachment containing extracted text."""
    attachment = meeting_attachment_factory(
        meeting_minutes,
        filename="searchable_doc.pdf",
        extracted_text="This document contains searchable budget information and financial data.",
    )
    return meeting_minutes, attachment


# Category choices for parametrized tests
MEETING_CATEGORIES = [
    ("general", "General"),
    ("finance", "Finance"),
    ("worship", "Worship"),
    ("youth", "Youth"),
    ("outreach", "Outreach"),
    ("administrative", "Administrative"),
]
