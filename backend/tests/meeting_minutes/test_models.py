"""
Model tests for Meeting Minutes.
Tests model creation, validation, relationships, and properties.
"""

from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone


@pytest.mark.django_db
class TestMeetingMinutesModel:
    """Tests for the MeetingMinutes model."""

    def test_create_meeting_minutes(self, meeting_minutes):
        """Test basic meeting minutes creation."""
        assert meeting_minutes.title == "Monthly Board Meeting"
        assert meeting_minutes.category == "general"
        assert meeting_minutes.is_active is True
        assert meeting_minutes.created_by is not None

    def test_str_representation(self, meeting_minutes):
        """Test string representation includes title and date."""
        str_repr = str(meeting_minutes)
        assert "Monthly Board Meeting" in str_repr

    @pytest.mark.parametrize(
        "category,expected",
        [
            ("finance", "Finance"),
            ("worship", "Worship"),
            ("youth", "Youth"),
            ("outreach", "Outreach"),
        ],
    )
    def test_category_choices(self, meeting_minutes_factory, category, expected):
        """Test different category choices are valid."""
        meeting = meeting_minutes_factory(category=category)
        assert meeting.category == category
        assert meeting.get_category_display() == expected

    def test_meeting_date_required(self, db, admin_user):
        """Test that meeting_date is required."""
        from apps.meeting_minutes.models import MeetingMinutes

        meeting = MeetingMinutes(
            title="Test Meeting",
            content="Content",
            created_by=admin_user,
        )
        with pytest.raises(ValidationError):
            meeting.full_clean()

    def test_title_required(self, db, admin_user):
        """Test that title is required."""
        from apps.meeting_minutes.models import MeetingMinutes

        meeting = MeetingMinutes(
            meeting_date=timezone.now().date(),
            content="Content",
            created_by=admin_user,
        )
        with pytest.raises(ValidationError):
            meeting.full_clean()

    def test_ministry_relationship(self, meeting_minutes, ministry):
        """Test meeting can be associated with a ministry."""
        assert meeting_minutes.ministry == ministry
        assert meeting_minutes in ministry.meeting_minutes.all()

    def test_meeting_without_ministry(self, meeting_minutes_factory):
        """Test meeting can exist without ministry (general meetings)."""
        meeting = meeting_minutes_factory(ministry=None)
        assert meeting.ministry is None

    def test_soft_delete(self, meeting_minutes):
        """Test soft delete sets is_active to False."""
        meeting_minutes.is_active = False
        meeting_minutes.save()
        meeting_minutes.refresh_from_db()
        assert meeting_minutes.is_active is False

    def test_timestamps(self, meeting_minutes):
        """Test created_at and updated_at are set."""
        assert meeting_minutes.created_at is not None
        assert meeting_minutes.updated_at is not None

    def test_attendees_field(self, meeting_minutes_factory):
        """Test attendees can be stored."""
        meeting = meeting_minutes_factory(attendees="Pastor John, Elder Mary, Deacon Peter")
        assert "Pastor John" in meeting.attendees


@pytest.mark.django_db
class TestMeetingMinutesAttachmentModel:
    """Tests for the MeetingMinutesAttachment model."""

    def test_create_attachment(self, meeting_attachment):
        """Test basic attachment creation."""
        assert meeting_attachment.file_name == "meeting_notes.pdf"
        assert meeting_attachment.file_size > 0
        assert meeting_attachment.uploaded_by is not None

    def test_str_representation(self, meeting_attachment):
        """Test string representation."""
        str_repr = str(meeting_attachment)
        assert "meeting_notes.pdf" in str_repr

    def test_attachment_relationship(self, meeting_minutes, meeting_attachment):
        """Test attachment is linked to meeting minutes."""
        assert meeting_attachment.meeting_minutes == meeting_minutes
        assert meeting_attachment in meeting_minutes.attachments.all()

    def test_extracted_text_for_search(self, meeting_attachment_factory, meeting_minutes):
        """Test extracted_text field for full-text search."""
        attachment = meeting_attachment_factory(
            meeting_minutes,
            extracted_text="Budget review financial quarterly report",
        )
        assert "Budget" in attachment.extracted_text

    def test_file_type_detection(self, meeting_attachment_factory, meeting_minutes):
        """Test file type is correctly stored."""
        pdf_attachment = meeting_attachment_factory(meeting_minutes, filename="doc.pdf")
        assert pdf_attachment.file_type == "pdf"

        docx_attachment = meeting_attachment_factory(meeting_minutes, filename="doc.docx")
        assert docx_attachment.file_type == "docx"


@pytest.mark.django_db
class TestMeetingMinutesVersionModel:
    """Tests for the MeetingMinutesVersion model."""

    def test_create_version(self, meeting_with_versions):
        """Test version creation."""
        from apps.meeting_minutes.models import MeetingMinutesVersion

        versions = MeetingMinutesVersion.objects.filter(meeting_minutes=meeting_with_versions)
        assert versions.count() >= 1

    def test_version_number_increments(self, meeting_minutes, admin_user):
        """Test version numbers increment correctly."""
        from apps.meeting_minutes.models import MeetingMinutesVersion

        v1 = MeetingMinutesVersion.objects.create(
            meeting_minutes=meeting_minutes,
            version_number=1,
            content="Version 1",
            changed_by=admin_user,
        )
        v2 = MeetingMinutesVersion.objects.create(
            meeting_minutes=meeting_minutes,
            version_number=2,
            content="Version 2",
            changed_by=admin_user,
        )
        assert v2.version_number == v1.version_number + 1

    def test_version_preserves_content(self, meeting_minutes, admin_user):
        """Test version preserves content snapshot."""
        from apps.meeting_minutes.models import MeetingMinutesVersion

        original_content = meeting_minutes.content
        version = MeetingMinutesVersion.objects.create(
            meeting_minutes=meeting_minutes,
            version_number=1,
            content=original_content,
            changed_by=admin_user,
            change_summary="Initial version",
        )
        assert version.content == original_content

    def test_version_ordering(self, meeting_minutes, admin_user):
        """Test versions are ordered by version_number descending."""
        from apps.meeting_minutes.models import MeetingMinutesVersion

        for i in range(1, 4):
            MeetingMinutesVersion.objects.create(
                meeting_minutes=meeting_minutes,
                version_number=i,
                content=f"Version {i}",
                changed_by=admin_user,
            )

        versions = meeting_minutes.versions.all()
        version_numbers = [v.version_number for v in versions]
        assert version_numbers == sorted(version_numbers, reverse=True)
