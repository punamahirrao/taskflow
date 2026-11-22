from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.models import ProjectAbsence, ProjectHoliday, SprintMemberCapacity
from tasks.permissions import CanManageSprint
from tasks.repositories.sprints import visible_sprint
from tasks.services.capacity import capacity_members, capacity_report


class CapacityMemberInput(serializers.Serializer):
    user_id = serializers.IntegerField(min_value=1)
    baseline_points = serializers.DecimalField(max_digits=5, decimal_places=1, min_value=0, max_value=1000, allow_null=True)
    allocation_percent = serializers.IntegerField(min_value=0, max_value=100)


class CapacityPlanInput(serializers.Serializer):
    members = CapacityMemberInput(many=True, allow_empty=False, max_length=500)


class AvailabilityInput(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, attrs):
        start, end = attrs["start_date"], attrs["end_date"]
        if end < start or (end - start).days > 365:
            raise ValidationError("Choose a valid date range of up to 366 days.")
        sprint = self.context["sprint"]
        if not sprint.start_date or not sprint.end_date:
            raise ValidationError("Set the sprint's start and end dates first.")
        if start > sprint.end_date or end < sprint.start_date:
            raise ValidationError("Choose dates that overlap the selected sprint.")
        return attrs


class AbsenceInput(AvailabilityInput):
    user_id = serializers.IntegerField(min_value=1)
    kind = serializers.ChoiceField(choices=("vacation", "absence"))
    day_fraction = serializers.ChoiceField(choices=(0.5, 1))
    note = serializers.CharField(max_length=120, allow_blank=True, default="")


class HolidayInput(AvailabilityInput):
    name = serializers.CharField(max_length=80)


class CapacityViewBase(APIView):
    permission_classes = [IsAuthenticated]

    def scope(self, request, sprint_id, *, manage=False):
        sprint = get_object_or_404(visible_sprint(request.user, sprint_id).select_related("board"))
        allowed = CanManageSprint().has_object_permission(request, self, sprint)
        if manage and not allowed:
            raise PermissionDenied("Only sprint managers can change team plans and holidays.")
        if sprint.start_date and sprint.end_date and (sprint.end_date - sprint.start_date).days > 365:
            raise ValidationError("Capacity planning supports sprint date ranges up to 366 days.")
        return sprint, allowed


class SprintCapacityView(CapacityViewBase):
    def get(self, request, sprint_id):
        sprint, allowed = self.scope(request, sprint_id)
        return Response(capacity_report(sprint, request, allowed))

    @transaction.atomic
    def put(self, request, sprint_id):
        sprint, allowed = self.scope(request, sprint_id, manage=True)
        serializer = CapacityPlanInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        rows = serializer.validated_data["members"]
        ids = [row["user_id"] for row in rows]
        valid_ids = set(capacity_members(sprint.project).values_list("user_id", flat=True))
        if len(set(ids)) != len(ids) or not set(ids) <= valid_ids:
            raise ValidationError("Choose distinct, active contributors from this project's team.")
        for row in rows:
            SprintMemberCapacity.objects.update_or_create(sprint=sprint, user_id=row["user_id"], defaults={key: value for key, value in row.items() if key != "user_id"})
        return Response(capacity_report(sprint, request, allowed))


class SprintAbsenceView(CapacityViewBase):
    def post(self, request, sprint_id):
        sprint, allowed = self.scope(request, sprint_id)
        serializer = AbsenceInput(data=request.data, context={"sprint": sprint})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not capacity_members(sprint.project).filter(user_id=data["user_id"]).exists():
            raise ValidationError("Choose an active contributor from this project's team.")
        if not allowed and data["user_id"] != request.user.pk:
            raise PermissionDenied("You can only log your own time off.")
        ProjectAbsence.objects.create(project=sprint.project, created_by=request.user, **data)
        return Response(capacity_report(sprint, request, allowed), status=201)

    def delete(self, request, sprint_id, entry_id):
        sprint, allowed = self.scope(request, sprint_id)
        entry = get_object_or_404(ProjectAbsence, pk=entry_id, project=sprint.project)
        if not allowed and (entry.user_id != request.user.pk or not capacity_members(sprint.project).filter(user=request.user).exists()):
            raise PermissionDenied("You can only remove your own time off.")
        entry.delete()
        return Response(capacity_report(sprint, request, allowed))


class SprintHolidayView(CapacityViewBase):
    def post(self, request, sprint_id):
        sprint, allowed = self.scope(request, sprint_id, manage=True)
        serializer = HolidayInput(data=request.data, context={"sprint": sprint})
        serializer.is_valid(raise_exception=True)
        ProjectHoliday.objects.create(project=sprint.project, created_by=request.user, **serializer.validated_data)
        return Response(capacity_report(sprint, request, allowed), status=201)

    def delete(self, request, sprint_id, entry_id):
        sprint, allowed = self.scope(request, sprint_id, manage=True)
        get_object_or_404(ProjectHoliday, pk=entry_id, project=sprint.project).delete()
        return Response(capacity_report(sprint, request, allowed))
