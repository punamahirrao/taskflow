from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import visible_projects
from projects.permissions import ProjectRolePermission
from projects.serializers import ProjectSerializer


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user).order_by("-created_at")
        serializer = ProjectSerializer(
            projects, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProjectSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        project = serializer.save()

        return Response(
            ProjectSerializer(project, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class DefaultProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        project_id = request.data.get("project_id")
        if project_id is None:
            request.user.default_project = None
        else:
            project = visible_projects(request.user).filter(pk=project_id).first()
            if project is None:
                return Response(
                    {"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND
                )
            request.user.default_project = project
        request.user.save(update_fields=["default_project"])
        return Response({"default_project_id": request.user.default_project_id})


class ProjectDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, ProjectRolePermission]
    http_method_names = ["get", "patch", "delete", "options"]

    def get_queryset(self):
        return visible_projects(self.request.user)
