from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import TypographyPreference
from accounts.organizations import require_organization


class TypographySerializer(serializers.Serializer):
    font_family = serializers.CharField(max_length=100, allow_blank=True)
    font_size = serializers.IntegerField(min_value=12, max_value=24)

    def validate_font_family(self, value):
        if any(ord(character) < 32 or ord(character) == 127 for character in value):
            raise serializers.ValidationError("Enter a single font family name.")
        return value


class TypographyPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        preference = TypographyPreference.objects.filter(
            user=request.user,
            organization_id=require_organization(request.user),
        ).first()
        return Response(
            TypographySerializer(preference).data
            if preference
            else {"font_family": "", "font_size": 16}
        )

    def put(self, request):
        organization_id = require_organization(request.user)
        serializer = TypographySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        preference, _ = TypographyPreference.objects.update_or_create(
            user=request.user,
            organization_id=organization_id,
            defaults=serializer.validated_data,
        )
        return Response(TypographySerializer(preference).data)
