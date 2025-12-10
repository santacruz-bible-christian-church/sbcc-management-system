import pytest

from apps.prayer_requests.models import PrayerRequest


@pytest.mark.django_db
class TestPrayerRequestModel:
    """Tests for the PrayerRequest model."""

    def test_prayer_request_str(self, prayer_request):
        """Test string representation."""
        assert "Test Prayer Request" in str(prayer_request)
        assert "Pending" in str(prayer_request)

    def test_requester_display_name_with_member(self, prayer_request):
        """Test requester_display_name with member requester."""
        assert prayer_request.requester_display_name == "Test Member"

    def test_requester_display_name_anonymous(self, prayer_request):
        """Test requester_display_name when anonymous."""
        prayer_request.is_anonymous = True
        prayer_request.save()
        assert prayer_request.requester_display_name == "Anonymous"

    def test_requester_display_name_non_member(self, db):
        """Test requester_display_name for non-member submission."""
        pr = PrayerRequest.objects.create(
            title="Non-member Request",
            description="Test",
            requester_name="John Visitor",
        )
        assert pr.requester_display_name == "John Visitor"

    def test_assign_to(self, prayer_request, pastor_user, admin_user):
        """Test assigning a prayer request."""
        prayer_request.assign_to(pastor_user, assigned_by=admin_user)

        prayer_request.refresh_from_db()
        assert prayer_request.assigned_to == pastor_user
        assert prayer_request.assigned_by == admin_user
        assert prayer_request.assigned_at is not None
        assert prayer_request.status == "assigned"

    def test_mark_completed(self, prayer_request):
        """Test marking a prayer request as completed."""
        prayer_request.mark_completed()

        prayer_request.refresh_from_db()
        assert prayer_request.status == "completed"
        assert prayer_request.completed_at is not None


@pytest.mark.django_db
class TestPrayerRequestFollowUpModel:
    """Tests for the PrayerRequestFollowUp model."""

    def test_follow_up_str(self, follow_up):
        """Test string representation."""
        assert "Prayed For" in str(follow_up)
        assert "Test Prayer Request" in str(follow_up)
