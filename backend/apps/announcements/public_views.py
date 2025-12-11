"""
Public API views for announcements.
No authentication required - for homepage consumption.
"""

from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Announcement


class PublicAnnouncementSerializer(serializers.ModelSerializer):
    """Lightweight serializer for public announcement display."""

    ministry_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "body",
            "audience",
            "ministry_name",
            "publish_at",
            "expire_at",
            "created_at",
        ]

    def get_ministry_name(self, obj):
        return obj.ministry.name if obj.ministry else None


class PublicAnnouncementsView(APIView):
    """
    GET /api/public/announcements/

    Public endpoint for fetching published announcements.
    No authentication required.

    Query Parameters:
        ministry (int): Optional filter by ministry ID
        limit (int): Max number of results (default: 10, max: 50)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()

        # Base queryset: active, published, not expired
        queryset = (
            Announcement.objects.select_related("ministry")
            .filter(is_active=True, publish_at__lte=now)
            .filter(Q(expire_at__isnull=True) | Q(expire_at__gt=now))
        )

        # Filter by ministry if provided
        ministry_id = request.query_params.get("ministry")
        if ministry_id:
            queryset = queryset.filter(
                Q(audience="all") | Q(audience="ministry", ministry_id=ministry_id)
            )
        else:
            # If no ministry specified, only return "all" audience announcements
            queryset = queryset.filter(audience="all")

        # Apply limit
        try:
            limit = min(int(request.query_params.get("limit", 10)), 50)
        except (ValueError, TypeError):
            limit = 10

        queryset = queryset.order_by("-publish_at")[:limit]

        serializer = PublicAnnouncementSerializer(queryset, many=True)
        return Response(
            {
                "count": len(serializer.data),
                "results": serializer.data,
            }
        )
