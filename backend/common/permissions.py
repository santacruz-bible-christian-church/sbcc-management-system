"""Custom DRF permissions"""

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin or super_admin users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role in ["super_admin", "admin"])
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read for all authenticated users
    Write only for admins/super_admins
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role in ["super_admin", "admin"])
        )


class IsMinistryLeaderOrAdmin(permissions.BasePermission):
    """Check if user is ministry leader, admin, or super_admin"""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.role in ["super_admin", "admin", "ministry_leader"]
            )
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Check if user is the owner of the object or an admin/super_admin"""

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role in ["super_admin", "admin"]:
            return True

        # Check if object has 'created_by' or 'submitted_by' field
        if hasattr(obj, "created_by"):
            return obj.created_by == request.user
        if hasattr(obj, "submitted_by"):
            return obj.submitted_by == request.user

        return False


class CanAccessMinistry(permissions.BasePermission):
    """Check if user has access to the ministry"""

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role in ["super_admin", "admin", "pastor"]:
            return True

        if request.user.role == "ministry_leader":
            # Check if user leads this ministry
            if hasattr(obj, "ministry"):
                return obj.ministry.leader == request.user

        return False
