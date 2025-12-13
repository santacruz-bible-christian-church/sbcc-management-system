from rest_framework import serializers

from .models import FamilyMember, Member


class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = ["id", "name", "relationship", "birthdate"]


class MemberSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    family_members = FamilyMemberSerializer(many=True, required=False)
    
    # ✅ Explicitly allow null for boolean fields
    accepted_jesus = serializers.BooleanField(required=False, allow_null=True)
    willing_to_be_baptized = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = Member
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "date_of_birth",
            "gender",
            "ministry",
            "is_active",
            # Extended personal info
            "complete_address",
            "occupation",
            "marital_status",
            "wedding_anniversary",
            # Educational background
            "elementary_school",
            "elementary_year_graduated",
            "secondary_school",
            "secondary_year_graduated",
            "vocational_school",
            "vocational_year_graduated",
            "college",
            "college_year_graduated",
            # Spiritual information
            "accepted_jesus",
            "salvation_testimony",
            "spiritual_birthday",
            "baptism_date",
            "willing_to_be_baptized",
            # Church background
            "previous_church",
            "how_introduced",
            "began_attending_since",
            # Family members
            "family_members",
            "ministry_name",
            "status",
            "archived_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "full_name",
            "membership_date",
            "created_at",
            "updated_at",
            "archived_at",
        ]

    def create(self, validated_data):
        family_members_data = validated_data.pop("family_members", [])
        member = Member.objects.create(**validated_data)

        for family_data in family_members_data:
            FamilyMember.objects.create(member=member, **family_data)

        return member

    def update(self, instance, validated_data):
        family_members_data = validated_data.pop("family_members", None)

        # Update member fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update family members if provided
        if family_members_data is not None:
            instance.family_members.all().delete()
            for family_data in family_members_data:
                FamilyMember.objects.create(member=instance, **family_data)

        return instance
