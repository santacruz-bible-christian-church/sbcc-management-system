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


class IsAdminOrPastorReadOnly(permissions.BasePermission):
    """
    Allow read for all authenticated users.
    Write for admins/super_admins and pastors.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser or request.user.role in ["super_admin", "admin", "pastor"]
            )
        )


def _user_is_admin(user):
    return user and (user.is_superuser or user.role in ["super_admin", "admin"])


def _user_is_ministry_leader(user):
    return user and user.role == "ministry_leader"


def _leader_owns_ministry(user, ministry_id):
    if not (user and ministry_id):
        return False
    from apps.ministries.models import Ministry

    return Ministry.objects.filter(pk=ministry_id, leader=user).exists()


def _ministry_id_from_obj(obj):
    if hasattr(obj, "ministry_id"):
        return obj.ministry_id
    if hasattr(obj, "ministry"):
        return getattr(obj.ministry, "id", None)
    if hasattr(obj, "shift"):
        return getattr(obj.shift, "ministry_id", None)
    return None


def _ministry_id_from_request(request):
    data = getattr(request, "data", {}) or {}
    ministry_id = data.get("ministry") or data.get("ministry_id")
    if ministry_id:
        return ministry_id
    shift_id = data.get("shift") or data.get("shift_id")
    if shift_id:
        from apps.ministries.models import Shift

        try:
            shift = Shift.objects.only("ministry_id").get(pk=shift_id)
            return shift.ministry_id
        except Shift.DoesNotExist:
            return None
    return None


class IsAdminOrMinistryLeaderForMinistry(permissions.BasePermission):
    """
    Ministries:
    - Read: all authenticated users
    - Write: admin/super_admin or ministry leader
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return _user_is_admin(request.user) or _user_is_ministry_leader(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if _user_is_admin(request.user):
            return True
        return _user_is_ministry_leader(request.user)


class IsAdminOrMinistryLeaderForRelated(permissions.BasePermission):
    """
    Ministry-related objects (members, shifts, assignments):
    - Read: all authenticated users
    - Write: admin/super_admin or ministry leader
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if _user_is_admin(request.user):
            return True
        return _user_is_ministry_leader(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if _user_is_admin(request.user):
            return True
        return _user_is_ministry_leader(request.user)


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
