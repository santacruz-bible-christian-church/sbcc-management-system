"""
Public API views for prayer requests.
No authentication required - for homepage consumption.
"""

from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PrayerRequest


class PublicPrayerRequestSubmitSerializer(serializers.Serializer):
    """Serializer for public prayer request submission."""

    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    category = serializers.ChoiceField(
        choices=PrayerRequest.CATEGORY_CHOICES,
        default="other",
    )
    requester_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    requester_email = serializers.EmailField(required=False, allow_blank=True)
    requester_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    is_anonymous = serializers.BooleanField(default=False)

    def validate(self, data):
        """Validate that name is provided if not anonymous."""
        if not data.get("is_anonymous") and not data.get("requester_name"):
            raise serializers.ValidationError(
                {"requester_name": "Name is required unless submitting anonymously."}
            )
        return data

    def create(self, validated_data):
        """Create a new prayer request."""
        return PrayerRequest.objects.create(
            title=validated_data["title"],
            description=validated_data["description"],
            category=validated_data.get("category", "other"),
            requester_name=validated_data.get("requester_name", ""),
            requester_email=validated_data.get("requester_email", ""),
            requester_phone=validated_data.get("requester_phone", ""),
            is_anonymous=validated_data.get("is_anonymous", False),
            status="pending",
        )


class PublicPrayerRequestSubmitView(APIView):
    """
    POST /api/public/prayer-requests/submit/

    Public endpoint for submitting prayer requests.
    No authentication required.

    Request Body:
        title (str): Prayer request title (required)
        description (str): Prayer request details (required)
        category (str): Category code (optional, default: "other")
        requester_name (str): Requester name (required unless anonymous)
        requester_email (str): Requester email (optional)
        requester_phone (str): Requester phone (optional)
        is_anonymous (bool): Submit anonymously (optional, default: false)
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PublicPrayerRequestSubmitSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prayer_request = serializer.save()

        return Response(
            {
                "message": "Prayer request submitted successfully.",
                "id": prayer_request.id,
                "title": prayer_request.title,
                "status": prayer_request.status,
            },
            status=status.HTTP_201_CREATED,
        )
