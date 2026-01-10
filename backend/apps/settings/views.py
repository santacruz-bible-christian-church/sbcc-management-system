from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdmin

from .models import SystemSettings, TeamMember
from .serializers import (
    PublicSettingsSerializer,
    PublicTeamMemberSerializer,
    SystemSettingsSerializer,
    TeamMemberSerializer,
)


class SystemSettingsView(APIView):
    """
    API endpoint for system settings management.

    GET: Retrieve current settings (admin only for full data)
    PUT/PATCH: Update settings (admin only)
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """Get current system settings."""
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        """Full update of system settings."""
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(
            settings,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Partial update of system settings."""
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(
            settings,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)


class PublicSettingsView(APIView):
    """
    Public API endpoint for branding and about information.
    No authentication required.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """Get public system settings (branding, contact, about)."""
        settings = SystemSettings.get_settings()
        serializer = PublicSettingsSerializer(settings, context={"request": request})
        return Response(serializer.data)


class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing team members.

    GET /api/team/ - List all team members
    POST /api/team/ - Create a new team member
    GET /api/team/{id}/ - Get team member details
    PUT/PATCH /api/team/{id}/ - Update team member
    DELETE /api/team/{id}/ - Delete team member
    """

    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class PublicTeamView(APIView):
    """
    Public API endpoint for team members.
    Returns only active team members for the public site.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """Get active team members for public display."""
        team = TeamMember.objects.filter(is_active=True).order_by("order", "name")
        serializer = PublicTeamMemberSerializer(team, many=True, context={"request": request})
        return Response(serializer.data)
