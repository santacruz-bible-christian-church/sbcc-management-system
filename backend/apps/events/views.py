from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.members.models import Member

from .models import Event, EventRegistration
from .serializers import EventRegistrationSerializer, EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("organizer", "ministry").all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def register(self, request, pk=None):
        """
        Register a member for this event.
        Body: { "member_id": 123, "notes": "optional" }
        """
        event = self.get_object()

        if event.is_full:
            return Response({"detail": "Event is full"}, status=status.HTTP_400_BAD_REQUEST)

        member_id = request.data.get("member_id")
        if not member_id:
            return Response(
                {"detail": "member_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response(
                {"detail": "Member not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        registration, created = EventRegistration.objects.get_or_create(
            event=event, member=member, defaults={"notes": request.data.get("notes", "")}
        )

        if not created:
            return Response({"detail": "Already registered"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"])
    def unregister(self, request, pk=None):
        """
        Unregister a member from this event.
        Query param: ?member_id=123
        """
        event = self.get_object()
        member_id = request.query_params.get("member_id")

        if not member_id:
            return Response(
                {"detail": "member_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            registration = EventRegistration.objects.get(event=event, member_id=member_id)
            registration.delete()
            return Response({"detail": "Unregistered successfully"})
        except EventRegistration.DoesNotExist:
            return Response(
                {"detail": "Not registered for this event"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["get"])
    def registrations(self, request, pk=None):
        """Get all registrations for this event"""
        event = self.get_object()
        registrations = event.registrations.select_related("member")
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)


class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.select_related("event", "member").all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
