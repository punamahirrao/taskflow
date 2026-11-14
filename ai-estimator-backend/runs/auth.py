import secrets
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class ServiceTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        expected = settings.HOST_SERVICE_TOKEN
        provided = request.headers.get("Authorization", "").removeprefix("Bearer ")
        if not expected or not secrets.compare_digest(provided, expected):
            raise AuthenticationFailed("Invalid service credentials")
        return (None, "host-service")
