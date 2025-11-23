from rest_framework import serializers
from .models import Role, Volunteer, Event, Assignment, Availability, Rotation, RotationMember
from django.utils import timezone

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ("id", "name", "description")

class VolunteerSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), many=True, write_only=True, required=False)

    class Meta:
        model = Volunteer
        fields = ("id", "first_name", "last_name", "email", "phone", "notes", "is_active", "created_at", "roles", "role_ids")
        read_only_fields = ("created_at",)

    def create(self, validated_data):
        role_ids = validated_data.pop("role_ids", [])
        volunteer = Volunteer.objects.create(**validated_data)
        if role_ids:
            volunteer.roles.set(role_ids)
        return volunteer

    def update(self, instance, validated_data):
        role_ids = validated_data.pop("role_ids", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if role_ids is not None:
            instance.roles.set(role_ids)
        return instance

class EventSerializer(serializers.ModelSerializer):
    required_roles = RoleSerializer(many=True, read_only=True)
    required_role_ids = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), many=True, write_only=True, required=False)
    confirmed_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Event
        fields = ("id", "title", "description", "location", "start", "end", "capacity", "required_roles", "required_role_ids", "created_at", "confirmed_count")
        read_only_fields = ("created_at", "confirmed_count")

    def validate(self, data):
        start = data.get("start", getattr(self.instance, "start", None))
        end = data.get("end", getattr(self.instance, "end", None))
        if start and end and start >= end:
            raise serializers.ValidationError("Event start must be before end.")
        return data

    def create(self, validated_data):
        role_ids = validated_data.pop("required_role_ids", [])
        event = Event.objects.create(**validated_data)
        if role_ids:
            event.required_roles.set(role_ids)
        return event

    def update(self, instance, validated_data):
        role_ids = validated_data.pop("required_role_ids", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if role_ids is not None:
            instance.required_roles.set(role_ids)
        return instance

class AssignmentSerializer(serializers.ModelSerializer):
    volunteer = serializers.PrimaryKeyRelatedField(queryset=Volunteer.objects.all())
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all())
    status = serializers.ChoiceField(choices=Assignment.Status.choices, required=False)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Assignment
        fields = ("id", "volunteer", "event", "role", "status", "notes", "assigned_at", "responded_at")
        read_only_fields = ("assigned_at", "responded_at")

class AvailabilitySerializer(serializers.ModelSerializer):
    volunteer = serializers.PrimaryKeyRelatedField(queryset=Volunteer.objects.all())
    class Meta:
        model = Availability
        fields = ("id", "volunteer", "date", "start_time", "end_time", "notes")

class RotationMemberSerializer(serializers.ModelSerializer):
    volunteer = VolunteerSerializer(read_only=True)
    volunteer_id = serializers.PrimaryKeyRelatedField(source="volunteer", queryset=Volunteer.objects.all(), write_only=True)

    class Meta:
        model = RotationMember
        fields = ("id", "rotation", "volunteer", "volunteer_id", "last_assigned", "priority")
        read_only_fields = ("last_assigned",)

class RotationSerializer(serializers.ModelSerializer):
    members = RotationMemberSerializer(many=True, read_only=True)
    class Meta:
        model = Rotation
        fields = ("id", "name", "description", "role", "created_at", "members")
        read_only_fields = ("created_at",)