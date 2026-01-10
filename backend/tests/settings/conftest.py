import pytest

from apps.settings.models import SystemSettings, TeamMember


@pytest.fixture
def settings_data():
    """Full settings data for updates."""
    return {
        "app_name": "New Church App",
        "church_name": "New Church Name",
        "tagline": "Faith, Hope, Love",
        "mission": "To spread the gospel",
        "vision": "A church for everyone",
        "history": "Founded in 2020",
        "statement_of_faith": "We believe in one God",
        "address": "123 Church Street, City",
        "phone": "+63 912 345 6789",
        "email": "info@newchurch.org",
        "facebook_url": "https://facebook.com/newchurch",
        "youtube_url": "https://youtube.com/newchurch",
        "instagram_url": "https://instagram.com/newchurch",
        "service_schedule": "Sunday 9:00 AM, Wednesday 7:00 PM",
    }


@pytest.fixture
def system_settings(db):
    """Create system settings instance."""
    return SystemSettings.get_settings()


@pytest.fixture
def configured_settings(db):
    """Create system settings with custom values."""
    settings = SystemSettings.get_settings()
    settings.app_name = "SBCC Management System"
    settings.church_name = "Santa Cruz Bible Christian Church"
    settings.tagline = "Growing in Faith Together"
    settings.mission = "To glorify God and make disciples"
    settings.vision = "A Christ-centered community"
    settings.address = "Santa Cruz, Laguna"
    settings.phone = "0912-345-6789"
    settings.email = "info@sbcc.org"
    settings.facebook_url = "https://facebook.com/sbcc"
    settings.service_schedule = "Sunday 9:00 AM"
    settings.save()
    return settings


@pytest.fixture
def member_user(create_user):
    """Create a regular member user."""
    return create_user(
        username="member_user",
        email="member@example.com",
        role="member",
    )


@pytest.fixture
def member_client(api_client, member_user):
    """Return an authenticated API client for member user."""
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(member_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


# Team Member Fixtures
@pytest.fixture
def team_member(db):
    """Create a basic team member."""
    return TeamMember.objects.create(
        name="John Pastor",
        role="pastor",
        title="Senior Pastor",
        bio="Serving since 2010",
        order=1,
        is_active=True,
    )


@pytest.fixture
def inactive_team_member(db):
    """Create an inactive team member."""
    return TeamMember.objects.create(
        name="Jane Elder",
        role="elder",
        title="Board Member",
        bio="Retired elder",
        order=10,
        is_active=False,
    )


@pytest.fixture
def team_member_data():
    """Data for creating a new team member."""
    return {
        "name": "New Member",
        "role": "deacon",
        "title": "Deacon",
        "bio": "A new team member",
        "order": 5,
        "is_active": True,
    }


@pytest.fixture
def multiple_team_members(db):
    """Create multiple team members for testing ordering."""
    members = []
    members.append(
        TeamMember.objects.create(
            name="Pastor A", role="pastor", title="Senior Pastor", order=1, is_active=True
        )
    )
    members.append(
        TeamMember.objects.create(
            name="Elder B", role="elder", title="Elder", order=2, is_active=True
        )
    )
    members.append(
        TeamMember.objects.create(
            name="Deacon C", role="deacon", title="Deacon", order=3, is_active=True
        )
    )
    members.append(
        TeamMember.objects.create(
            name="Staff D", role="staff", title="Secretary", order=4, is_active=False
        )
    )
    return members
