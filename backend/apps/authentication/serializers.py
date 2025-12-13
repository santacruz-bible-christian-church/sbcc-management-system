from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users (Super Admin only)"""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
        ]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
            "email": {"required": True},
        }

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        """Prevent creating super_admin unless you are one"""
        request = self.context.get("request")
        if value == "super_admin" and request:
            if not (request.user.is_superuser or request.user.role == "super_admin"):
                raise serializers.ValidationError(
                    "Only super admins can create super admin accounts."
                )
        return value

    def create(self, validated_data):
        """Create new user"""
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users (Super Admin only)"""

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
        ]

    def validate_email(self, value):
        """Check if email already exists for another user"""
        instance = self.instance
        if User.objects.filter(email=value).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        """Prevent assigning super_admin unless you are one"""
        request = self.context.get("request")
        if value == "super_admin" and request:
            if not (request.user.is_superuser or request.user.role == "super_admin"):
                raise serializers.ValidationError("Only super admins can assign super admin role.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password2 = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone",
            "role",
        ]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
            "email": {"required": True},
        }

    def validate(self, attrs):
        """Validate passwords match"""
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """Create new user"""
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["username"] = user.username
        token["email"] = user.email
        token["role"] = user.role
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name

        return token

    def validate(self, attrs):
        """Validate and return token with user data"""
        data = super().validate(attrs)

        # Add user data to response
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "role": self.user.role,
            "phone": self.user.phone,
        }

        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, write_only=True, validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate new passwords match"""
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        return attrs

    def validate_old_password(self, value):
        """Validate old password is correct"""
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self, **kwargs):
        """Update user password"""
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


# ============ Password Reset Serializers ============


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password request"""

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Check if user with this email exists"""
        try:
            self.user = User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            # Don't reveal if email exists or not (security)
            pass
        return value

    def save(self):
        """Create reset token and send email"""
        from .models import PasswordResetToken

        if hasattr(self, "user"):
            token_obj = PasswordResetToken.create_token(self.user)

            # Build reset URL
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            reset_url = f"{frontend_url}/reset-password?token={token_obj.token}"

            # Send email
            send_mail(
                subject="Password Reset Request - SBCC Management System",
                message=f"""
Hello {self.user.first_name},

You requested to reset your password. Click the link below to reset it:

{reset_url}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

---
SBCC Management System
                """.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.user.email],
                fail_silently=False,
            )

            return token_obj

        return None


class VerifyResetTokenSerializer(serializers.Serializer):
    """Serializer to verify reset token"""

    token = serializers.CharField(required=True)

    def validate_token(self, value):
        """Validate token exists and is valid"""
        from .models import PasswordResetToken

        try:
            token_obj = PasswordResetToken.objects.get(token=value)
            if not token_obj.is_valid:
                raise serializers.ValidationError(
                    "This reset link has expired or already been used."
                )
            self.token_obj = token_obj
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid reset token.")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password with token"""

    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, write_only=True, validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate passwords match"""
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

    def validate_token(self, value):
        """Validate token exists and is valid"""
        from .models import PasswordResetToken

        try:
            token_obj = PasswordResetToken.objects.get(token=value)
            if not token_obj.is_valid:
                raise serializers.ValidationError(
                    "This reset link has expired or already been used."
                )
            self.token_obj = token_obj
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid reset token.")
        return value

    def save(self):
        """Reset the user's password"""
        user = self.token_obj.user
        user.set_password(self.validated_data["new_password"])
        user.save()

        # Mark token as used
        self.token_obj.used = True
        self.token_obj.save()

        return user
