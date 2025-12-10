import pytest

from apps.settings.models import SystemSettings


@pytest.mark.django_db
class TestSystemSettingsModel:
    """Test SystemSettings model behavior."""

    def test_singleton_pattern(self):
        """Only one SystemSettings instance can exist."""
        settings1 = SystemSettings.get_settings()
        settings2 = SystemSettings.get_settings()

        assert settings1.pk == 1
        assert settings2.pk == 1
        assert settings1.pk == settings2.pk
        assert SystemSettings.objects.count() == 1

    def test_singleton_enforced_on_save(self):
        """Multiple saves always use pk=1."""
        settings = SystemSettings(app_name="Test App")
        settings.save()

        # Try to create another instance
        settings2 = SystemSettings(app_name="Another App")
        settings2.save()

        # Should still be only one instance
        assert SystemSettings.objects.count() == 1
        assert SystemSettings.objects.first().app_name == "Another App"

    def test_default_values(self, system_settings):
        """Default values are set correctly."""
        assert system_settings.app_name == "SBCC Management System"
        assert system_settings.church_name == "Santa Cruz Bible Christian Church"
        assert system_settings.tagline == ""
        assert system_settings.mission == ""
        assert system_settings.vision == ""

    def test_str_representation(self, system_settings):
        """String representation includes update timestamp."""
        str_repr = str(system_settings)
        assert "System Settings" in str_repr
        assert "Updated:" in str_repr

    def test_get_settings_creates_if_not_exists(self, db):
        """get_settings() creates instance if none exists."""
        assert SystemSettings.objects.count() == 0

        settings = SystemSettings.get_settings()

        assert settings is not None
        assert settings.pk == 1
        assert SystemSettings.objects.count() == 1

    def test_updated_by_tracking(self, system_settings, admin_user):
        """updated_by is tracked correctly."""
        system_settings.app_name = "Updated App"
        system_settings.updated_by = admin_user
        system_settings.save()

        system_settings.refresh_from_db()
        assert system_settings.updated_by == admin_user

    def test_updated_at_auto_updates(self, system_settings):
        """updated_at is automatically updated on save."""
        original_updated_at = system_settings.updated_at

        system_settings.app_name = "Changed Name"
        system_settings.save()

        system_settings.refresh_from_db()
        assert system_settings.updated_at >= original_updated_at
