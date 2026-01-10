import pytest
from django.urls import reverse
from rest_framework import status

from apps.settings.models import SystemSettings, TeamMember


# =============================================================================
# Permission Tests
# =============================================================================
@pytest.mark.django_db
class TestSystemSettingsPermissions:
    """Test access control for system settings."""

    def test_admin_can_get_settings(self, admin_client, system_settings):
        """Admin can retrieve full settings."""
        url = reverse("system-settings")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "app_name" in response.data
        assert "updated_by" in response.data

    def test_admin_can_update_settings(self, admin_client, system_settings):
        """Admin can update settings."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {"app_name": "Admin Updated App"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["app_name"] == "Admin Updated App"

    def test_member_cannot_get_settings(self, member_client, system_settings):
        """Regular member cannot access admin settings endpoint."""
        url = reverse("system-settings")
        response = member_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_member_cannot_update_settings(self, member_client, system_settings):
        """Regular member cannot update settings."""
        url = reverse("system-settings")
        response = member_client.patch(
            url,
            {"app_name": "Hacked Name"},
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_pastor_cannot_update_settings(self, pastor_client, system_settings):
        """Pastor cannot update settings (admin only)."""
        url = reverse("system-settings")
        response = pastor_client.patch(
            url,
            {"app_name": "Pastor Update"},
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_access_admin_settings(self, api_client, system_settings):
        """Unauthenticated users cannot access admin settings."""
        url = reverse("system-settings")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# =============================================================================
# Admin API Endpoint Tests
# =============================================================================
@pytest.mark.django_db
class TestSystemSettingsAdminEndpoint:
    """Test admin settings API endpoints."""

    def test_get_settings(self, admin_client, configured_settings):
        """GET /api/settings/ returns full settings."""
        url = reverse("system-settings")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["app_name"] == "SBCC Management System"
        assert response.data["church_name"] == "Santa Cruz Bible Christian Church"
        assert response.data["tagline"] == "Growing in Faith Together"
        assert response.data["facebook_url"] == "https://facebook.com/sbcc"
        assert "updated_at" in response.data
        assert "updated_by_name" in response.data

    def test_put_full_update(self, admin_client, system_settings, settings_data):
        """PUT /api/settings/ performs full update."""
        url = reverse("system-settings")
        response = admin_client.put(url, settings_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["app_name"] == "New Church App"
        assert response.data["church_name"] == "New Church Name"
        assert response.data["mission"] == "To spread the gospel"

    def test_patch_partial_update(self, admin_client, configured_settings):
        """PATCH /api/settings/ performs partial update."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {"app_name": "Partially Updated App"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["app_name"] == "Partially Updated App"
        # Other fields should remain unchanged
        assert response.data["church_name"] == "Santa Cruz Bible Christian Church"

    def test_update_tracks_user(self, admin_client, admin_user, system_settings):
        """Update tracks which admin made the change."""
        url = reverse("system-settings")
        admin_client.patch(
            url,
            {"app_name": "Tracked Update"},
            format="json",
        )

        system_settings.refresh_from_db()
        assert system_settings.updated_by == admin_user

    def test_update_branding(self, admin_client, system_settings):
        """PRD: Editable app name (church name changes)."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {
                "app_name": "Renamed Church App",
                "church_name": "Renamed Bible Church",
                "tagline": "New tagline here",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["app_name"] == "Renamed Church App"
        assert response.data["church_name"] == "Renamed Bible Church"
        assert response.data["tagline"] == "New tagline here"

    def test_update_about_page_content(self, admin_client, system_settings):
        """PRD: About page auto-update based on config."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {
                "mission": "Our new mission statement",
                "vision": "Our new vision statement",
                "history": "Church history updated",
                "statement_of_faith": "We believe...",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["mission"] == "Our new mission statement"
        assert response.data["vision"] == "Our new vision statement"
        assert response.data["history"] == "Church history updated"
        assert response.data["statement_of_faith"] == "We believe..."

    def test_update_contact_info(self, admin_client, system_settings):
        """Update contact information."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {
                "address": "456 New Address, City",
                "phone": "+63 999 888 7777",
                "email": "contact@church.org",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["address"] == "456 New Address, City"
        assert response.data["phone"] == "+63 999 888 7777"
        assert response.data["email"] == "contact@church.org"

    def test_update_social_media_links(self, admin_client, system_settings):
        """Update social media URLs."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {
                "facebook_url": "https://facebook.com/newpage",
                "youtube_url": "https://youtube.com/newchannel",
                "instagram_url": "https://instagram.com/newaccount",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["facebook_url"] == "https://facebook.com/newpage"
        assert response.data["youtube_url"] == "https://youtube.com/newchannel"
        assert response.data["instagram_url"] == "https://instagram.com/newaccount"

    def test_update_service_schedule(self, admin_client, system_settings):
        """Update service schedule."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {"service_schedule": "Sunday 8:00 AM & 10:30 AM\nWednesday 7:00 PM"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "Sunday 8:00 AM" in response.data["service_schedule"]


# =============================================================================
# Public API Endpoint Tests
# =============================================================================
@pytest.mark.django_db
class TestPublicSettingsEndpoint:
    """Test public settings API endpoint."""

    def test_public_settings_no_auth_required(self, api_client, configured_settings):
        """GET /api/public/settings/ works without authentication."""
        url = reverse("public-settings")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_public_settings_returns_branding(self, api_client, configured_settings):
        """Public endpoint returns branding information."""
        url = reverse("public-settings")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["app_name"] == "SBCC Management System"
        assert response.data["church_name"] == "Santa Cruz Bible Christian Church"
        assert response.data["tagline"] == "Growing in Faith Together"

    def test_public_settings_returns_about_info(self, api_client, configured_settings):
        """Public endpoint returns about page content."""
        url = reverse("public-settings")
        response = api_client.get(url)

        assert response.data["mission"] == "To glorify God and make disciples"
        assert response.data["vision"] == "A Christ-centered community"

    def test_public_settings_returns_contact_info(self, api_client, configured_settings):
        """Public endpoint returns contact information."""
        url = reverse("public-settings")
        response = api_client.get(url)

        assert response.data["address"] == "Santa Cruz, Laguna"
        assert response.data["phone"] == "0912-345-6789"
        assert response.data["email"] == "info@sbcc.org"

    def test_public_settings_returns_social_links(self, api_client, configured_settings):
        """Public endpoint returns social media links."""
        url = reverse("public-settings")
        response = api_client.get(url)

        assert response.data["facebook_url"] == "https://facebook.com/sbcc"

    def test_public_settings_excludes_metadata(self, api_client, configured_settings):
        """Public endpoint does not expose updated_by metadata."""
        url = reverse("public-settings")
        response = api_client.get(url)

        assert "updated_by" not in response.data
        assert "updated_by_name" not in response.data
        assert "updated_at" not in response.data

    def test_public_settings_authenticated_user(self, auth_client, configured_settings):
        """Authenticated users can also access public settings."""
        url = reverse("public-settings")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK


# =============================================================================
# Serializer Tests
# =============================================================================
@pytest.mark.django_db
class TestSettingsSerializers:
    """Test serializer behavior."""

    def test_admin_serializer_includes_metadata(self, admin_client, admin_user, system_settings):
        """Admin serializer includes updated_by metadata."""
        system_settings.updated_by = admin_user
        system_settings.save()

        url = reverse("system-settings")
        response = admin_client.get(url)

        assert "updated_by" in response.data
        assert "updated_by_name" in response.data
        assert "updated_at" in response.data

    def test_updated_by_name_with_full_name(self, admin_client, admin_user, system_settings):
        """updated_by_name shows full name if available."""
        admin_user.first_name = "John"
        admin_user.last_name = "Admin"
        admin_user.save()

        system_settings.updated_by = admin_user
        system_settings.save()

        url = reverse("system-settings")
        response = admin_client.get(url)

        assert response.data["updated_by_name"] == "John Admin"

    def test_updated_by_name_falls_back_to_username(
        self, admin_client, admin_user, system_settings
    ):
        """updated_by_name falls back to username if no full name."""
        admin_user.first_name = ""
        admin_user.last_name = ""
        admin_user.save()

        system_settings.updated_by = admin_user
        system_settings.save()

        url = reverse("system-settings")
        response = admin_client.get(url)

        assert response.data["updated_by_name"] == admin_user.username

    def test_updated_by_name_null_when_no_user(self, admin_client, system_settings):
        """updated_by_name is null when no user set."""
        url = reverse("system-settings")
        response = admin_client.get(url)

        assert response.data["updated_by_name"] is None

    def test_read_only_fields_cannot_be_set(self, admin_client, system_settings):
        """Read-only fields are ignored in updates."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {
                "id": 999,
                "updated_by": 999,
                "app_name": "Valid Update",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        system_settings.refresh_from_db()
        assert system_settings.pk == 1  # id unchanged
        assert response.data["app_name"] == "Valid Update"


# =============================================================================
# Validation Tests
# =============================================================================
@pytest.mark.django_db
class TestSettingsValidation:
    """Test field validation."""

    def test_invalid_email_rejected(self, admin_client, system_settings):
        """Invalid email format is rejected."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {"email": "not-an-email"},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_url_rejected(self, admin_client, system_settings):
        """Invalid URL format is rejected."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {"facebook_url": "not-a-url"},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_valid_url_accepted(self, admin_client, system_settings):
        """Valid URL is accepted."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {"facebook_url": "https://facebook.com/validpage"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

    def test_empty_optional_fields_allowed(self, admin_client, system_settings):
        """Empty optional fields are allowed."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {
                "tagline": "",
                "mission": "",
                "facebook_url": "",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

    def test_app_name_max_length(self, admin_client, system_settings):
        """App name respects max length."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {"app_name": "A" * 256},  # exceeds 255 max
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


# =============================================================================
# Edge Cases
# =============================================================================
@pytest.mark.django_db
class TestSettingsEdgeCases:
    """Edge cases and special scenarios."""

    def test_settings_auto_created_on_first_access(self, admin_client):
        """Settings are created automatically on first API access."""
        assert SystemSettings.objects.count() == 0

        url = reverse("system-settings")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert SystemSettings.objects.count() == 1

    def test_public_endpoint_creates_settings_if_missing(self, api_client):
        """Public endpoint also creates settings if missing."""
        assert SystemSettings.objects.count() == 0

        url = reverse("public-settings")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert SystemSettings.objects.count() == 1

    def test_concurrent_updates_last_write_wins(self, admin_client, system_settings):
        """Concurrent updates result in last write winning."""
        url = reverse("system-settings")

        # First update
        admin_client.patch(url, {"app_name": "First Update"}, format="json")

        # Second update
        response = admin_client.patch(url, {"app_name": "Second Update"}, format="json")

        assert response.data["app_name"] == "Second Update"

    def test_multiline_text_fields(self, admin_client, system_settings):
        """Multiline text is preserved in text fields."""
        url = reverse("system-settings")
        multiline_text = "Line 1\nLine 2\nLine 3"

        response = admin_client.patch(
            url,
            {"service_schedule": multiline_text},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["service_schedule"] == multiline_text

    def test_unicode_content(self, admin_client, system_settings):
        """Unicode content is handled correctly."""
        url = reverse("system-settings")
        response = admin_client.patch(
            url,
            {
                "church_name": "Iglesia ni Cristo 教会",
                "tagline": "믿음으로 함께 成長",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["church_name"] == "Iglesia ni Cristo 教会"
        assert response.data["tagline"] == "믿음으로 함께 成長"


# =============================================================================
# Team Member API Tests
# =============================================================================
@pytest.mark.django_db
class TestTeamMemberPermissions:
    """Test access control for team members."""

    def test_admin_can_list_team_members(self, admin_client, team_member):
        """Admin can list team members."""
        url = reverse("team-member-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_admin_can_create_team_member(self, admin_client, team_member_data):
        """Admin can create team members."""
        url = reverse("team-member-list")
        response = admin_client.post(url, team_member_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED

    def test_member_cannot_create_team_member(self, member_client, team_member_data):
        """Regular member cannot create team members."""
        url = reverse("team-member-list")
        response = member_client.post(url, team_member_data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_team_member(self, api_client, team_member_data):
        """Unauthenticated users cannot create team members."""
        url = reverse("team-member-list")
        response = api_client.post(url, team_member_data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTeamMemberCRUD:
    """Test team member CRUD operations."""

    def test_create_team_member(self, admin_client, team_member_data):
        """Create a new team member."""
        url = reverse("team-member-list")
        response = admin_client.post(url, team_member_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "New Member"
        assert response.data["role"] == "deacon"
        assert TeamMember.objects.filter(name="New Member").exists()

    def test_list_team_members(self, admin_client, multiple_team_members):
        """List all team members."""
        url = reverse("team-member-list")
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 4

    def test_retrieve_team_member(self, admin_client, team_member):
        """Retrieve a single team member."""
        url = reverse("team-member-detail", kwargs={"pk": team_member.pk})
        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "John Pastor"

    def test_update_team_member(self, admin_client, team_member):
        """Update a team member."""
        url = reverse("team-member-detail", kwargs={"pk": team_member.pk})
        response = admin_client.patch(
            url,
            {"title": "Lead Pastor"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        team_member.refresh_from_db()
        assert team_member.title == "Lead Pastor"

    def test_delete_team_member(self, admin_client, team_member):
        """Delete a team member."""
        pk = team_member.pk
        url = reverse("team-member-detail", kwargs={"pk": pk})
        response = admin_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not TeamMember.objects.filter(pk=pk).exists()


@pytest.mark.django_db
class TestPublicTeamEndpoint:
    """Test public team API endpoint."""

    def test_public_team_no_auth_required(self, api_client, team_member):
        """GET /api/public/team/ works without authentication."""
        url = reverse("public-team")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_public_team_returns_only_active_members(
        self, api_client, team_member, inactive_team_member
    ):
        """Public endpoint returns only active team members."""
        url = reverse("public-team")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        names = [m["name"] for m in response.data]
        assert "John Pastor" in names
        assert "Jane Elder" not in names  # Inactive

    def test_public_team_ordered_by_order_field(self, api_client, multiple_team_members):
        """Public team is ordered by order field."""
        url = reverse("public-team")
        response = api_client.get(url)

        # Only active members should be returned, in order
        orders = [m.get("order") for m in response.data if m.get("order")]
        # Filter nulls and check ordering
        assert orders == sorted(orders) if orders else True

    def test_public_team_limited_fields(self, api_client, team_member):
        """Public endpoint returns limited fields."""
        url = reverse("public-team")
        response = api_client.get(url)

        member = response.data[0]
        assert "name" in member
        assert "title" in member
        assert "role_display" in member
        assert "is_active" not in member  # Not in public serializer
        assert "created_at" not in member
