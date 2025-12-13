from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class that only allows super admins.
    Super admin = user.role == 'super_admin' OR user.is_superuser
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.role == "super_admin"


class IsAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission class for admin or super admin users.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ["super_admin", "admin"] or request.user.is_superuser
