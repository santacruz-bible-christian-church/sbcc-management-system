from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdmin

from .models import SystemSettings
from .serializers import PublicSettingsSerializer, SystemSettingsSerializer


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
