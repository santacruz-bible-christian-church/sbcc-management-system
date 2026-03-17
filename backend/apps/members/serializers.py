from rest_framework import serializers

from .models import FamilyMember, Member


class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = ["id", "name", "relationship", "birthdate"]


class MemberSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(source="ministry.name", read_only=True, allow_null=True)
    ministry_2_name = serializers.CharField(
        source="ministry_2.name", read_only=True, allow_null=True
    )
    ministry_3_name = serializers.CharField(
        source="ministry_3.name", read_only=True, allow_null=True
    )
    ministries = serializers.SerializerMethodField(read_only=True)
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
            "ministry_2",
            "ministry_3",
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
            "ministry_2_name",
            "ministry_3_name",
            "ministries",
            "status",
            "archived_at",
            "created_at",
            "updated_at",
            # Membership and attendance tracking
            "full_name",
            "membership_date",
            "last_attended",
            "attendance_rate",
            "consecutive_absences",
        ]
        read_only_fields = [
            "id",
            "full_name",
            "membership_date",
            "created_at",
            "updated_at",
            "archived_at",
            "last_attended",
            "attendance_rate",
            "consecutive_absences",
        ]

    def get_ministries(self, obj):
        ministries = []
        seen = set()
        slots = [obj.ministry, obj.ministry_2, obj.ministry_3]

        for ministry in slots:
            if not ministry or ministry.id in seen:
                continue
            seen.add(ministry.id)
            ministries.append({"id": ministry.id, "name": ministry.name})

        return ministries

    def validate(self, attrs):
        selected_ministries = [
            attrs.get("ministry", getattr(self.instance, "ministry", None)),
            attrs.get("ministry_2", getattr(self.instance, "ministry_2", None)),
            attrs.get("ministry_3", getattr(self.instance, "ministry_3", None)),
        ]

        selected_ids = [m.id for m in selected_ministries if m is not None]
        if len(selected_ids) != len(set(selected_ids)):
            raise serializers.ValidationError(
                {"ministries": "Please select distinct ministries for slots 1 to 3."}
            )

        return attrs

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
