from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from tasks.models import Sprint
from tasks.serializers import SprintSerializer


class SprintListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user)
        if request.query_params.get("project_id"):
            projects = projects.filter(id=request.query_params["project_id"])
        return Response(SprintSerializer(Sprint.objects.filter(project__in=projects), many=True).data)

    def post(self, request):
        project = get_object_or_404(visible_projects(request.user), id=request.data.get("project_id"))
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can create a sprint."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SprintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_active") and Sprint.objects.filter(project=project, is_active=True).exists():
            return Response({"detail": "Close the active sprint before starting another."}, status=status.HTTP_409_CONFLICT)
        sprint = serializer.save(project=project)
        return Response(SprintSerializer(sprint).data, status=status.HTTP_201_CREATED)


class SprintDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, sprint_id):
        sprint = get_object_or_404(Sprint.objects.filter(project__in=visible_projects(request.user)), id=sprint_id)
        if get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update a sprint."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SprintSerializer(sprint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_active"):
            if sprint.is_closed:
                return Response({"detail": "A closed sprint cannot be restarted."}, status=status.HTTP_400_BAD_REQUEST)
            if Sprint.objects.filter(project=sprint.project, is_active=True).exclude(id=sprint.id).exists():
                return Response({"detail": "Close the active sprint before starting another."}, status=status.HTTP_409_CONFLICT)
        serializer.save()
        return Response(serializer.data)
