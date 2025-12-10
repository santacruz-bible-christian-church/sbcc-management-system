import pytest

from apps.settings.models import SystemSettings


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
