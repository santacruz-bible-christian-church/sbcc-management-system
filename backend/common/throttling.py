"""Custom throttling classes for rate limiting sensitive endpoints."""

from rest_framework.throttling import SimpleRateThrottle


class _BaseIdentThrottle(SimpleRateThrottle):
    """Throttle by user ID when authenticated, otherwise by IP."""

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class AuthSensitiveThrottle(_BaseIdentThrottle):
    """
    Throttle for authentication-sensitive endpoints.
    Applies to: login, password reset, token verification.
    Rate: 5 requests per minute per user/IP.
    """

    scope = "auth_sensitive"


class PublicPostThrottle(_BaseIdentThrottle):
    """
    Throttle for public POST endpoints.
    Applies to: prayer request submission.
    Rate: 10 requests per minute per user/IP.
    """

    scope = "public_post"
