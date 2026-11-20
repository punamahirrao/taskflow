from rest_framework import status
from rest_framework.exceptions import APIException


class ApiException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "The request could not be completed."
    default_code = "api_error"


class ValidationException(ApiException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "The submitted data is invalid."
    default_code = "validation_error"


class PermissionException(ApiException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to perform this action."
    default_code = "permission_denied"


class BusinessRuleException(ApiException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "The requested operation conflicts with a business rule."
    default_code = "business_rule_violation"
