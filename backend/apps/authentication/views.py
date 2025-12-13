from django.contrib.auth import get_user_model
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .permissions import IsAdminOrSuperAdmin, IsSuperAdmin
from .serializers import (
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
    VerifyResetTokenSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user (admin/super_admin only)
    """

    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {"user": UserSerializer(user).data, "message": "User registered successfully"},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login with username/email and password
    Returns access and refresh tokens
    """

    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout user by blacklisting refresh token
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/me/
    Get current authenticated user details

    PATCH /api/auth/me/
    Update current user profile (first_name, last_name, email, phone)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """
    PUT /api/auth/change-password/
    Change user password
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)


class RefreshTokenView(TokenRefreshView):
    """
    POST /api/auth/refresh/
    Refresh access token using refresh token
    """

    pass


# ============ Password Reset Views ============


class ForgotPasswordView(generics.GenericAPIView):
    """
    POST /api/auth/forgot-password/
    Request a password reset email
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            serializer.save()
        except Exception:
            # Don't expose email sending errors
            pass

        # Always return success (don't reveal if email exists)
        return Response(
            {
                "message": "If an account with that email exists, a password reset link has been sent."
            },
            status=status.HTTP_200_OK,
        )


class VerifyResetTokenView(generics.GenericAPIView):
    """
    POST /api/auth/verify-reset-token/
    Verify if a reset token is valid
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = VerifyResetTokenSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({"valid": True, "message": "Token is valid"}, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    """
    POST /api/auth/reset-password/
    Reset password using token
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Password has been reset successfully. You can now login."},
            status=status.HTTP_200_OK,
        )


# ============ User Management Views (Super Admin) ============


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (Super Admin only)

    GET /api/auth/users/ - List all users
    POST /api/auth/users/ - Create a new user
    GET /api/auth/users/{id}/ - Get user details
    PUT /api/auth/users/{id}/ - Update user
    DELETE /api/auth/users/{id}/ - Delete user
    POST /api/auth/users/{id}/set_password/ - Set user password
    POST /api/auth/users/{id}/toggle_active/ - Toggle user active status
    """

    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "is_active"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "username", "email", "role"]
    ordering = ["-date_joined"]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        """Prevent deleting yourself or the last super admin"""
        user = self.get_object()

        # Prevent self-deletion
        if user == request.user:
            return Response(
                {"error": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent deleting last super admin
        if user.role == "super_admin" or user.is_superuser:
            super_admin_count = User.objects.filter(
                models.Q(role="super_admin") | models.Q(is_superuser=True)
            ).count()
            if super_admin_count <= 1:
                return Response(
                    {"error": "Cannot delete the last super admin account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def set_password(self, request, pk=None):
        """
        POST /api/auth/users/{id}/set_password/
        Set a new password for a user (Super Admin only)
        """
        user = self.get_object()
        password = request.data.get("password")

        if not password:
            return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({"message": f"Password updated for {user.username}."})

    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        """
        POST /api/auth/users/{id}/toggle_active/
        Toggle user active status
        """
        user = self.get_object()

        # Prevent deactivating yourself
        if user == request.user:
            return Response(
                {"error": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = not user.is_active
        user.save()

        status_text = "activated" if user.is_active else "deactivated"
        return Response({"message": f"User {user.username} has been {status_text}."})
