"""
Service layer tests for Meeting Minutes.
Tests business logic, versioning, and search functionality.
"""

import pytest
from django.utils import timezone


@pytest.mark.django_db
class TestMeetingMinutesVersioningService:
    """Tests for version control functionality."""

    def test_create_version_on_update(self, meeting_minutes, admin_user):
        """Test that updating content creates a new version."""
        from apps.meeting_minutes.services import update_meeting_with_version

        original_content = meeting_minutes.content
        new_content = "Updated meeting content with new decisions."

        updated_meeting = update_meeting_with_version(
            meeting_minutes,
            content=new_content,
            changed_by=admin_user,
            change_summary="Updated decisions section",
        )

        assert updated_meeting.content == new_content
        assert updated_meeting.versions.count() >= 1

        # Verify old content is preserved in version
        latest_version = updated_meeting.versions.first()
        assert latest_version.content == original_content

    def test_get_version_history(self, meeting_minutes, admin_user):
        """Test retrieving version history."""
        from apps.meeting_minutes.services import get_version_history, update_meeting_with_version

        # Create some versions
        for i in range(3):
            update_meeting_with_version(
                meeting_minutes,
                content=f"Content version {i + 1}",
                changed_by=admin_user,
                change_summary=f"Update {i + 1}",
            )

        history = get_version_history(meeting_minutes)
        assert len(history) >= 3

    def test_restore_to_version(self, meeting_minutes, admin_user):
        """Test restoring meeting to a previous version."""
        from apps.meeting_minutes.services import restore_to_version, update_meeting_with_version

        original_content = meeting_minutes.content

        # Update to new content
        update_meeting_with_version(
            meeting_minutes,
            content="New content",
            changed_by=admin_user,
        )

        # Restore to version 1
        restored = restore_to_version(meeting_minutes, version_number=1, restored_by=admin_user)

        assert restored.content == original_content

    def test_get_specific_version(self, meeting_with_versions):
        """Test getting a specific version."""
        from apps.meeting_minutes.services import get_version

        version = get_version(meeting_with_versions, version_number=1)
        assert version is not None
        assert version.version_number == 1


@pytest.mark.django_db
class TestMeetingMinutesSearchService:
    """Tests for search functionality."""

    def test_search_by_title(self, meeting_minutes_factory):
        """Test searching meeting minutes by title."""
        from apps.meeting_minutes.services import search_meeting_minutes

        meeting_minutes_factory(title="Budget Planning Session")
        meeting_minutes_factory(title="Worship Schedule Review")
        meeting_minutes_factory(title="Annual Budget Review")

        results = search_meeting_minutes(query="Budget")
        titles = [m.title for m in results]

        assert "Budget Planning Session" in titles
        assert "Annual Budget Review" in titles
        assert "Worship Schedule Review" not in titles

    def test_search_by_content(self, meeting_minutes_factory):
        """Test searching meeting minutes by content."""
        from apps.meeting_minutes.services import search_meeting_minutes

        meeting_minutes_factory(
            title="Meeting A",
            content="Discussed financial projections for next quarter.",
        )
        meeting_minutes_factory(
            title="Meeting B",
            content="Planned youth camp activities.",
        )

        results = search_meeting_minutes(query="financial")
        assert len(results) == 1
        assert results[0].title == "Meeting A"

    def test_search_in_attachments(self, meeting_minutes_factory, meeting_attachment_factory):
        """Test searching within attachment extracted text."""
        from apps.meeting_minutes.services import search_meeting_minutes

        meeting1 = meeting_minutes_factory(title="Meeting with Attachment")
        meeting_attachment_factory(
            meeting1,
            extracted_text="Revenue growth and profit margins analysis",
        )

        meeting2 = meeting_minutes_factory(title="Regular Meeting")  # noqa: F841

        results = search_meeting_minutes(query="Revenue", include_attachments=True)
        titles = [m.title for m in results]

        assert "Meeting with Attachment" in titles
        assert "Regular Meeting" not in titles

    def test_search_case_insensitive(self, meeting_minutes_factory):
        """Test search is case insensitive."""
        from apps.meeting_minutes.services import search_meeting_minutes

        meeting_minutes_factory(title="BUDGET Meeting")

        results_lower = search_meeting_minutes(query="budget")
        results_upper = search_meeting_minutes(query="BUDGET")
        results_mixed = search_meeting_minutes(query="Budget")

        assert len(results_lower) == len(results_upper) == len(results_mixed) == 1

    def test_search_with_category_filter(self, meeting_minutes_factory):
        """Test searching with category filter."""
        from apps.meeting_minutes.services import search_meeting_minutes

        meeting_minutes_factory(title="Finance Budget", category="finance")
        meeting_minutes_factory(title="Worship Budget", category="worship")

        results = search_meeting_minutes(query="Budget", category="finance")
        assert len(results) == 1
        assert results[0].category == "finance"

    def test_search_empty_query_returns_all(self, meeting_minutes_factory):
        """Test empty search returns all active records."""
        from apps.meeting_minutes.services import search_meeting_minutes

        meeting_minutes_factory(title="Meeting 1")
        meeting_minutes_factory(title="Meeting 2")
        meeting_minutes_factory(title="Meeting 3")

        results = search_meeting_minutes(query="")
        assert len(results) >= 3


@pytest.mark.django_db
class TestMeetingMinutesStatisticsService:
    """Tests for statistics and aggregation."""

    def test_get_meetings_by_category(self, meeting_minutes_factory):
        """Test getting meeting count by category."""
        from apps.meeting_minutes.services import get_meetings_by_category

        meeting_minutes_factory(category="finance")
        meeting_minutes_factory(category="finance")
        meeting_minutes_factory(category="worship")

        stats = get_meetings_by_category()

        assert stats.get("finance", 0) == 2
        assert stats.get("worship", 0) == 1

    def test_get_recent_meetings(self, meeting_minutes_factory):
        """Test getting recent meetings."""
        from apps.meeting_minutes.services import get_recent_meetings

        today = timezone.now().date()
        meeting_minutes_factory(title="Recent", meeting_date=today)
        meeting_minutes_factory(
            title="Old",
            meeting_date=today - timezone.timedelta(days=60),
        )

        recent = get_recent_meetings(days=30)
        titles = [m.title for m in recent]

        assert "Recent" in titles
        assert "Old" not in titles
