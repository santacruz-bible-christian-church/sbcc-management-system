"""Custom exceptions for business logic"""

class SBCCBaseException(Exception):
    """Base exception for SBCC system"""
    pass

class MemberAlreadyExistsError(SBCCBaseException):
    """Raised when trying to create duplicate member"""
    pass

class InsufficientPermissionsError(SBCCBaseException):
    """Raised when user lacks required permissions"""
    pass

class ResourceNotFoundError(SBCCBaseException):
    """Raised when requested resource doesn't exist"""
    pass