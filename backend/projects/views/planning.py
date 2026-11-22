from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.organizations import can_manage_organization, require_organization
from projects.access import visible_projects
from projects.models import PlanningItem
from tasks.models import Task


class PlanningItemSerializer(serializers.ModelSerializer):
    tasks = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(), many=True, required=False
    )
    related_releases = serializers.SerializerMethodField()

    class Meta:
        model = PlanningItem
        fields = (
            "id",
            "kind",
            "name",
            "description",
            "status",
            "target_date",
            "tasks",
            "updated_at",
            "related_releases",
        )
        read_only_fields = ("id", "updated_at")

    def validate_tasks(self, tasks):
        user = self.context["request"].user
        if Task.objects.filter(
            id__in=[task.id for task in tasks], project__in=visible_projects(user)
        ).count() != len(tasks):
            raise serializers.ValidationError(
                "Choose accessible tasks in this organization."
            )
        return tasks

    def get_related_releases(self, item):
        if item.kind != "goal":
            return []
        return [
            {"id": release.id, "name": release.name}
            for release in item.goal_releases.all()
            if release.organization_id == item.organization_id
            and release.kind == "release"
        ]

    def validate(self, attrs):
        if (
            self.instance
            and attrs.get("kind", self.instance.kind) != self.instance.kind
        ):
            raise serializers.ValidationError(
                {"kind": "The planning record type cannot be changed."}
            )
        return attrs


class PlanningItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = PlanningItem.objects.filter(
            organization_id=require_organization(request.user)
        ).prefetch_related("tasks")
        kind = request.query_params.get("kind")
        if kind:
            items = items.filter(kind=kind)
        if not kind or kind == "goal":
            items = items.prefetch_related("goal_releases")
        # Do not disclose references to projects the caller cannot access.
        data = PlanningItemSerializer(
            items, many=True, context={"request": request}
        ).data
        visible_ids = set(
            Task.objects.filter(project__in=visible_projects(request.user)).values_list(
                "id", flat=True
            )
        )
        for row in data:
            row["tasks"] = [
                task_id for task_id in row["tasks"] if task_id in visible_ids
            ]
        return Response(
            {"items": data, "can_manage": can_manage_organization(request.user)}
        )

    def post(self, request):
        if not can_manage_organization(request.user):
            return Response(
                {
                    "detail": "Only organization administrators can manage planning records."
                },
                status=403,
            )
        serializer = PlanningItemSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(
            organization_id=require_organization(request.user), created_by=request.user
        )
        return Response(serializer.data, status=201)


class PlanningItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk):
        if not can_manage_organization(request.user):
            return Response(
                {
                    "detail": "Only organization administrators can manage planning records."
                },
                status=403,
            )
        item = get_object_or_404(
            PlanningItem.objects.select_for_update(),
            pk=pk,
            organization_id=require_organization(request.user),
        )
        if item.kind == "release" and item.approval_steps.exists():
            raise serializers.ValidationError(
                {
                    "detail": "Manage releases with approval steps from the Releases page."
                }
            )
        serializer = PlanningItemSerializer(
            item, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        if not can_manage_organization(request.user):
            return Response(
                {
                    "detail": "Only organization administrators can manage planning records."
                },
                status=403,
            )
        get_object_or_404(
            PlanningItem, pk=pk, organization_id=require_organization(request.user)
        ).delete()
        return Response(status=204)
