"""Custom DRF permissions"""

from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read for all authenticated users
    Write only for admins
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.role == 'admin'

class IsMinistryLeaderOrAdmin(permissions.BasePermission):
    """Check if user is ministry leader or admin"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['admin', 'ministry_leader']

class IsOwnerOrAdmin(permissions.BasePermission):
    """Check if user is the owner of the object or an admin"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # Check if object has 'created_by' or 'submitted_by' field
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        if hasattr(obj, 'submitted_by'):
            return obj.submitted_by == request.user
        
        return False

class CanAccessMinistry(permissions.BasePermission):
    """Check if user has access to the ministry"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'pastor']:
            return True
        
        if request.user.role == 'ministry_leader':
            # Check if user leads this ministry
            if hasattr(obj, 'ministry'):
                return obj.ministry.leader == request.user
        
        return False