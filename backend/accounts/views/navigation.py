from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import NavigationPreference
from accounts.organizations import require_organization

# Stable identifiers shared with the frontend navigation catalog. Routes stay fixed.
MENU_IDS = {
    "dashboard",
    "my-work",
    "projects",
    "backlog",
    "sprint-train",
    "boards",
    "releases",
    "documents",
    "goals",
    "planning",
    "roadmap",
    "project-plans",
    "charts",
    "milestones",
    "dependencies",
    "calendar",
    "reports",
    "templates",
    "ai-estimator",
    "settings",
}
ICON_IDS = {
    "layout-dashboard",
    "list-todo",
    "folder-kanban",
    "layers",
    "train-front",
    "columns-3",
    "flag",
    "file-text",
    "target",
    "chart-gantt",
    "map",
    "bar-chart-3",
    "milestone",
    "git-branch",
    "calendar-days",
    "sparkles",
    "settings",
    "settings-2",
    "home",
    "briefcase",
    "building-2",
    "users",
    "user",
    "clipboard-list",
    "check-circle",
    "circle",
    "star",
    "heart",
    "bookmark",
    "bell",
    "clock",
    "compass",
    "globe",
    "grid-2x2",
    "lightbulb",
    "rocket",
    "shield",
    "tag",
    "trophy",
    "zap",
    "workflow",
    "wrench",
    "search",
    "database",
}


class MenuItemSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=60, required=False, allow_blank=False)
    icon = serializers.ChoiceField(choices=sorted(ICON_IDS), required=False)
    color = serializers.ChoiceField(
        choices=("violet", "blue", "teal", "amber", "rose", "cyan"), required=False
    )

    def to_internal_value(self, data):
        if isinstance(data, dict) and set(data) - {"label", "icon", "color"}:
            raise serializers.ValidationError(
                "Only the menu name, icon and color can be customized."
            )
        return super().to_internal_value(data)

    def validate_label(self, value):
        if any(ord(character) < 32 or ord(character) == 127 for character in value):
            raise serializers.ValidationError("Use a single-line menu name.")
        return value


class NavigationSerializer(serializers.Serializer):
    items = serializers.DictField(child=MenuItemSerializer(), allow_empty=True)

    def validate_items(self, value):
        if set(value) - MENU_IDS:
            raise serializers.ValidationError("Choose a link from the left-hand menu.")
        return {key: item for key, item in value.items() if item}


class NavigationPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization_id = require_organization(request.user)
        preference = NavigationPreference.objects.filter(
            user=request.user, organization_id=organization_id
        ).first()
        return Response({"items": preference.items if preference else {}})

    def put(self, request):
        organization_id = require_organization(request.user)
        serializer = NavigationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        preference, _ = NavigationPreference.objects.update_or_create(
            user=request.user,
            organization_id=organization_id,
            defaults={"items": serializer.validated_data["items"]},
        )
        return Response({"items": preference.items})
