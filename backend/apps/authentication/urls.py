from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    CurrentUserView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    RegisterView,
    ResetPasswordView,
    UserManagementViewSet,
    VerifyResetTokenView,
)

app_name = "authentication"

router = DefaultRouter()
router.register(r"users", UserManagementViewSet, basename="user")

urlpatterns = [
    # Authentication endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh"),
    # User endpoints
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    # Password reset endpoints
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("verify-reset-token/", VerifyResetTokenView.as_view(), name="verify-reset-token"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    # User management (Super Admin)
    path("", include(router.urls)),
]
