from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication


class OrganizationJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        user, token = result
        organization_id = request.headers.get("X-Organization-ID")
        if organization_id is not None:
            if (
                not organization_id.isdigit()
                or not user.organizations.filter(pk=organization_id).exists()
            ):
                raise PermissionDenied("You do not belong to this organization.")
            # Each tab sends its organization so an old request cannot cross companies.
            user.active_organization_id = int(organization_id)
        elif (
            user.active_organization_id
            and not user.organizations.filter(pk=user.active_organization_id).exists()
        ):
            user.active_organization_id = None
        return user, token
