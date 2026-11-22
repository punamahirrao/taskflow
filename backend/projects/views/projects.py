from rest_framework import status
from django.db.models import Exists, OuterRef, Prefetch, Q
from django.utils import timezone
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import visible_projects
from projects.models import Project, ProjectMembership, ProjectRole, ProjectAccessRequest
from projects.serializers.owner import person_summary
from projects.permissions import ProjectRolePermission
from projects.serializers import ProjectSerializer
from projects.services import set_default_project


class ProjectDirectoryView(APIView):
    """Discover organization project summaries without granting access to their work."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()[:200]
        accessible = visible_projects(request.user).values("pk")
        projects = Project.objects.filter(
            organization__members=request.user,
            organization_id=request.user.active_organization_id,
        ).filter(Q(name__icontains=query) | Q(description__icontains=query)).order_by("name", "pk")
        projects = projects.annotate(
            has_access=Exists(accessible.filter(pk=OuterRef("pk")))
        )
        active = ProjectMembership.objects.filter(
            Q(removal_date__isnull=True) | Q(removal_date__gt=timezone.localdate())
        ).select_related("user", "role")
        projects = projects.prefetch_related(
            Prefetch("memberships", queryset=active, to_attr="directory_memberships"),
            Prefetch("access_requests", queryset=ProjectAccessRequest.objects.filter(requester=request.user), to_attr="own_access_requests"),
        )
        rows = []
        for project in projects:
            owner = next((m.user for m in project.directory_memberships if m.role.role_name == ProjectRole.OWNER), None)
            rows.append({
                "id": project.pk,
                "name": project.name,
                "description": project.description[:280],
                "status": project.status,
                "expected_start_date": project.expected_start_date,
                "end_date": project.end_date,
                "has_access": project.has_access,
                "is_assigned": any(m.user_id == request.user.pk for m in project.directory_memberships),
                "owner_details": person_summary(owner, request) if owner else None,
                "access_request_status": project.own_access_requests[0].status if project.own_access_requests else None,
            })
        return Response(rows)


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user).order_by("-created_at")
        serializer = ProjectSerializer(
            projects, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data, context={"request": request})
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
        default_project_id = set_default_project(
            user=request.user, project=request.user.default_project
        )
        return Response({"default_project_id": default_project_id})


class ProjectDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, ProjectRolePermission]
    http_method_names = ["get", "patch", "delete", "options"]

    def get_queryset(self):
        return visible_projects(self.request.user)
