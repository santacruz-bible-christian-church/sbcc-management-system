from datetime import date, timedelta

import pytest
from django.urls import reverse
from rest_framework import status

from apps.members.models import Member
from apps.visitors.models import Visitor


# =============================================================================
# CRUD Endpoints
# =============================================================================
@pytest.mark.django_db
class TestVisitorCRUDEndpoints:
    """Test Visitor CRUD operations."""

    def test_list_visitors_authenticated(self, admin_client, multiple_visitors):
        """GET /api/visitors/ returns list of visitors."""
        url = reverse("visitor-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 4

    def test_list_visitors_unauthenticated(self, api_client):
        """Unauthenticated request is rejected."""
        url = reverse("visitor-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_visitor(self, admin_client, visitor_data):
        """POST /api/visitors/ creates new visitor."""
        url = reverse("visitor-list")
        response = admin_client.post(url, visitor_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["full_name"] == "John Doe"
        assert response.data["status"] == "visitor"
        assert response.data["follow_up_status"] == "visited_1x"

    def test_create_visitor_minimal_data(self, admin_client):
        """Visitor can be created with only full_name."""
        url = reverse("visitor-list")
        response = admin_client.post(url, {"full_name": "Minimal Visitor"}, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["full_name"] == "Minimal Visitor"

    def test_retrieve_visitor(self, admin_client, visitor):
        """GET /api/visitors/{id}/ returns visitor details."""
        url = reverse("visitor-detail", kwargs={"pk": visitor.id})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["full_name"] == "Jane Smith"
        assert "visit_count" in response.data
        assert "status_display" in response.data

    def test_update_visitor(self, admin_client, visitor):
        """PUT /api/visitors/{id}/ updates visitor."""
        url = reverse("visitor-detail", kwargs={"pk": visitor.id})
        response = admin_client.put(
            url,
            {
                "full_name": "Jane Smith Updated",
                "phone": "09171111111",
                "email": "jane.updated@example.com",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["full_name"] == "Jane Smith Updated"

    def test_partial_update_visitor(self, admin_client, visitor):
        """PATCH /api/visitors/{id}/ partially updates visitor."""
        url = reverse("visitor-detail", kwargs={"pk": visitor.id})
        response = admin_client.patch(
            url,
            {"notes": "Updated notes"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["notes"] == "Updated notes"

    def test_delete_visitor(self, admin_client, visitor):
        """DELETE /api/visitors/{id}/ removes visitor."""
        url = reverse("visitor-detail", kwargs={"pk": visitor.id})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Visitor.objects.filter(id=visitor.id).exists()


# =============================================================================
# Check-in Endpoints
# =============================================================================
@pytest.mark.django_db
class TestVisitorCheckInEndpoint:
    """Test visitor check-in functionality."""

    def test_check_in_visitor(self, admin_client, visitor):
        """POST /api/visitors/{id}/check_in/ records attendance."""
        url = reverse("visitor-check-in", kwargs={"pk": visitor.id})
        response = admin_client.post(
            url,
            {"service_date": str(date.today())},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["visitor"] == visitor.id
        assert response.data["service_date"] == str(date.today())

    def test_check_in_without_date_uses_today(self, admin_client, visitor):
        """Check-in without service_date defaults to today."""
        url = reverse("visitor-check-in", kwargs={"pk": visitor.id})
        response = admin_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["service_date"] == str(date.today())

    def test_check_in_duplicate_fails(self, admin_client, visitor):
        """Duplicate check-in on same date fails."""
        url = reverse("visitor-check-in", kwargs={"pk": visitor.id})
        admin_client.post(url, {"service_date": str(date.today())}, format="json")

        response = admin_client.post(
            url,
            {"service_date": str(date.today())},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already been checked in" in response.data["error"]

    def test_check_in_different_dates_allowed(self, admin_client, visitor):
        """Visitor can check in on different dates."""
        url = reverse("visitor-check-in", kwargs={"pk": visitor.id})

        response1 = admin_client.post(
            url,
            {"service_date": str(date.today() - timedelta(days=7))},
            format="json",
        )
        response2 = admin_client.post(
            url,
            {"service_date": str(date.today())},
            format="json",
        )

        assert response1.status_code == status.HTTP_201_CREATED
        assert response2.status_code == status.HTTP_201_CREATED


# =============================================================================
# Convert to Member Endpoints
# =============================================================================
@pytest.mark.django_db
class TestVisitorConvertToMemberEndpoint:
    """PRD: Convert visitor → member (one-click migration)."""

    def test_convert_visitor_to_member(self, admin_client, db):
        """POST /api/visitors/{id}/convert_to_member/ creates member."""
        visitor = Visitor.objects.create(
            full_name="Convert Test",
            phone="09171111111",
            email="convert.test@example.com",
        )

        url = reverse("visitor-convert-to-member", kwargs={"pk": visitor.id})
        response = admin_client.post(
            url,
            {"date_of_birth": "1990-05-15"},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["message"] == "Visitor converted to member successfully"
        assert "member_id" in response.data

        # Verify visitor updated
        visitor.refresh_from_db()
        assert visitor.status == "member"
        assert visitor.converted_to_member is not None

        # Verify member created
        member = Member.objects.get(id=response.data["member_id"])
        assert member.first_name == "Convert"
        assert member.last_name == "Test"

    def test_convert_with_phone_override(self, admin_client, db):
        """Phone can be overridden during conversion."""
        visitor = Visitor.objects.create(
            full_name="Phone Override",
            phone="09170000000",
            email="phone.override@example.com",
        )

        url = reverse("visitor-convert-to-member", kwargs={"pk": visitor.id})
        response = admin_client.post(
            url,
            {
                "date_of_birth": "1990-05-15",
                "phone": "09180000000",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        member = Member.objects.get(id=response.data["member_id"])
        assert member.phone == "09180000000"

    def test_convert_already_converted_fails(self, admin_client, db):
        """Cannot convert visitor that's already a member."""
        visitor = Visitor.objects.create(
            full_name="Already Converted",
            email="already.converted@example.com",
        )

        url = reverse("visitor-convert-to-member", kwargs={"pk": visitor.id})
        # First conversion
        admin_client.post(url, {"date_of_birth": "1990-05-15"}, format="json")

        # Second attempt
        response = admin_client.post(
            url,
            {"date_of_birth": "1990-05-15"},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already been converted" in response.data["error"]

    def test_convert_without_dob_fails(self, admin_client, visitor):
        """date_of_birth is required for conversion."""
        url = reverse("visitor-convert-to-member", kwargs={"pk": visitor.id})
        response = admin_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_convert_visitor_without_email(self, admin_client, db):
        """Visitor without email gets placeholder email."""
        visitor = Visitor.objects.create(
            full_name="No Email Visitor",
            phone="09171234567",
        )

        url = reverse("visitor-convert-to-member", kwargs={"pk": visitor.id})
        response = admin_client.post(
            url,
            {"date_of_birth": "1995-01-01"},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        member = Member.objects.get(id=response.data["member_id"])
        assert "@placeholder.local" in member.email


# =============================================================================
# Attendance Endpoints
# =============================================================================
@pytest.mark.django_db
class TestVisitorAttendanceEndpoints:
    """Test VisitorAttendance ViewSet."""

    def test_list_attendance_records(self, admin_client, visitor_with_attendance):
        """GET /api/visitors/attendance/ returns attendance records."""
        url = reverse("visitor-attendance-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        data = (
            response.data if isinstance(response.data, list) else response.data.get("results", [])
        )
        assert len(data) >= 2

    def test_create_attendance_record(self, admin_client, visitor):
        """POST /api/visitors/attendance/ creates record."""
        url = reverse("visitor-attendance-list")
        response = admin_client.post(
            url,
            {
                "visitor": visitor.id,
                "service_date": str(date.today()),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["visitor"] == visitor.id

    def test_attendance_includes_visitor_name(self, admin_client, visitor_with_attendance):
        """Attendance response includes visitor_name."""
        url = reverse("visitor-attendance-list")
        response = admin_client.get(url)

        data = (
            response.data if isinstance(response.data, list) else response.data.get("results", [])
        )
        assert len(data) > 0
        assert data[0]["visitor_name"] == "Jane Smith"


# =============================================================================
# Serializer Tests
# =============================================================================
@pytest.mark.django_db
class TestVisitorSerializer:
    """Test serializer output."""

    def test_serializer_includes_computed_fields(self, admin_client, visitor_with_attendance):
        """Serializer includes visit_count and display fields."""
        url = reverse("visitor-detail", kwargs={"pk": visitor_with_attendance.id})
        response = admin_client.get(url)

        assert response.data["visit_count"] == 2
        assert response.data["status_display"] == "Visitor"
        assert response.data["follow_up_status_display"] == "Visited 2x"

    def test_serializer_read_only_fields(self, admin_client, visitor):
        """Read-only fields cannot be set via API."""
        url = reverse("visitor-detail", kwargs={"pk": visitor.id})
        response = admin_client.patch(
            url,
            {"converted_to_member": 999},  # Should be ignored
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        visitor.refresh_from_db()
        assert visitor.converted_to_member is None


# =============================================================================
# Edge Cases & Validation
# =============================================================================
@pytest.mark.django_db
class TestVisitorEdgeCases:
    """Edge cases and validation tests."""

    def test_visitor_with_single_name(self, admin_client, db):
        """Single-word name conversion splits correctly."""
        visitor = Visitor.objects.create(
            full_name="Madonna",
            email="madonna@example.com",
        )

        url = reverse("visitor-convert-to-member", kwargs={"pk": visitor.id})
        response = admin_client.post(
            url,
            {"date_of_birth": "1958-08-16"},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        member = Member.objects.get(id=response.data["member_id"])
        assert member.first_name == "Madonna"
        assert member.last_name == ""

    def test_visitor_email_validation(self, admin_client):
        """Invalid email is rejected."""
        url = reverse("visitor-list")
        response = admin_client.post(
            url,
            {
                "full_name": "Test User",
                "email": "invalid-email",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_visitor_with_long_name(self, admin_client, db):
        """Names with multiple parts are handled."""
        visitor = Visitor.objects.create(
            full_name="Maria Clara De Los Santos",
            email="maria.clara@example.com",
        )

        url = reverse("visitor-convert-to-member", kwargs={"pk": visitor.id})
        response = admin_client.post(
            url,
            {"date_of_birth": "1990-01-01"},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        member = Member.objects.get(id=response.data["member_id"])
        assert member.first_name == "Maria"
        assert member.last_name == "Clara De Los Santos"

    def test_check_in_future_date(self, admin_client, visitor):
        """Check-in for future date is allowed (pre-registration)."""
        url = reverse("visitor-check-in", kwargs={"pk": visitor.id})
        future_date = date.today() + timedelta(days=7)
        response = admin_client.post(
            url,
            {"service_date": str(future_date)},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

    def test_check_in_past_date(self, admin_client, visitor):
        """Check-in for past date is allowed (back-filling)."""
        url = reverse("visitor-check-in", kwargs={"pk": visitor.id})
        past_date = date.today() - timedelta(days=30)
        response = admin_client.post(
            url,
            {"service_date": str(past_date)},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
