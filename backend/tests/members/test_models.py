"""
Tests for Member model properties and methods.
"""

from datetime import date

import pytest

from apps.members.models import FamilyMember, Member


@pytest.mark.django_db
class TestMemberModel:
    """Tests for Member model."""

    def test_string_representation(self, member):
        """Test __str__ method returns full name."""
        assert str(member) == "John Doe"

    def test_full_name_property(self, member):
        """Test full_name property."""
        assert member.full_name == "John Doe"

    def test_default_values(self, ministry):
        """Test model default values."""
        member = Member.objects.create(
            first_name="Default",
            last_name="Test",
            ministry=ministry,
        )

        assert member.status == "active"
        assert member.is_active is True
        assert member.attendance_rate == 0
        assert member.consecutive_absences == 0

    def test_status_choices(self, member, inactive_member, archived_member):
        """Test different status values."""
        assert member.status == "active"
        assert inactive_member.status == "inactive"
        assert archived_member.status == "archived"

    def test_timestamps(self, member):
        """Test that timestamps are auto-populated."""
        assert member.created_at is not None
        assert member.updated_at is not None
        assert member.membership_date is not None

    def test_ministry_relationship(self, member, ministry):
        """Test ministry foreign key relationship."""
        assert member.ministry == ministry
        assert member.ministry.name is not None


@pytest.mark.django_db
class TestFamilyMemberModel:
    """Tests for FamilyMember model."""

    def test_family_member_creation(self, member_with_family):
        """Test family members are created correctly."""
        assert member_with_family.family_members.count() == 2

    def test_family_member_relationships(self, member_with_family):
        """Test family member relationships."""
        relationships = list(
            member_with_family.family_members.values_list("relationship", flat=True)
        )
        assert "Spouse" in relationships
        assert "Child" in relationships

    def test_family_member_cascade_delete(self, member_with_family):
        """Test family members are deleted when member is deleted."""
        member_id = member_with_family.id
        family_count = member_with_family.family_members.count()
        assert family_count == 2

        member_with_family.delete()

        assert not FamilyMember.objects.filter(member_id=member_id).exists()
