from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Role, Volunteer, Event, Assignment, Availability
from .serializers import (
    RoleSerializer, VolunteerSerializer, EventSerializer,
    AssignmentSerializer, AvailabilitySerializer
)
from . import services
from django.core.exceptions import ValidationError

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class VolunteerViewSet(viewsets.ModelViewSet):
    queryset = Volunteer.objects.all()
    serializer_class = VolunteerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def assignments(self, request, pk=None):
        volunteer = self.get_object()
        qs = volunteer.assignments.all()
        page = self.paginate_queryset(qs)
        serializer = AssignmentSerializer(page or qs, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def available_volunteers(self, request, pk=None):
        event = self.get_object()
        role_ids = request.query_params.getlist("role")
        volunteers = services.get_available_volunteers_for_event(event, roles=role_ids or None)
        page = self.paginate_queryset(volunteers)
        serializer = VolunteerSerializer(page or volunteers, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related("volunteer", "event").all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        volunteer = serializer.validated_data["volunteer"]
        event = serializer.validated_data["event"]
        role = serializer.validated_data.get("role")
        force = request.data.get("force", False)
        try:
            assignment = services.assign_volunteer_to_event(volunteer, event, role=role, force=force)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        out = AssignmentSerializer(assignment)
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def confirm(self, request, pk=None):
        assignment = self.get_object()
        try:
            assignment = services.confirm_assignment(assignment)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AssignmentSerializer(assignment).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def decline(self, request, pk=None):
        assignment = self.get_object()
        assignment = services.decline_assignment(assignment)
        return Response(AssignmentSerializer(assignment).data)

class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.select_related("volunteer").all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]
