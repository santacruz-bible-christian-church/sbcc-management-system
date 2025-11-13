from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Event, EventRegistration
from .serializers import EventRegistrationSerializer, EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("organizer", "ministry").all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def register(self, request, pk=None):
        """Register current user for this event"""
        event = self.get_object()

        if event.is_full:
            return Response({"detail": "Event is full"}, status=status.HTTP_400_BAD_REQUEST)

        member = request.user.member_profile
        registration, created = EventRegistration.objects.get_or_create(
            event=event, member=member, defaults={"notes": request.data.get("notes", "")}
        )

        if not created:
            return Response({"detail": "Already registered"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"])
    def unregister(self, request, pk=None):
        """Unregister current user from this event"""
        event = self.get_object()
        member = request.user.member_profile

        try:
            registration = EventRegistration.objects.get(event=event, member=member)
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
        registrations = event.registrations.select_related("member__user").all()
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)


class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.select_related("event", "member").all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
