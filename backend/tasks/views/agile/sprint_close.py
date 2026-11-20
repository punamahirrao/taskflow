from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.repositories.sprints import visible_sprint
from tasks.serializers import SprintSerializer
from tasks.services.sprints import SprintStateError, close_sprint
from tasks.permissions import CanManageSprint


class SprintCloseView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        return [*super().get_permissions(), CanManageSprint()]

    @transaction.atomic
    def post(self, request, sprint_id):
        sprint = get_object_or_404(
            visible_sprint(request.user, sprint_id, for_update=True)
        )
        self.check_object_permissions(request, sprint)

        try:
            result = close_sprint(sprint, request.user)
        except SprintStateError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)

        result["sprint"] = SprintSerializer(result["sprint"]).data
        return Response(result)
