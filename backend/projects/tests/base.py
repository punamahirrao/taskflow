from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from projects.models import Project, ProjectMembership, ProjectRole
from tasks.models import Task

User = get_user_model()
PASSWORD = "Str0ng-Pass-123!"
FAST_HASHER = ["django.contrib.auth.hashers.MD5PasswordHasher"]


def make_user(email, **extra):
    return User.objects.create_user(email=email, password=PASSWORD, **extra)


def add_member(project, user, role_name):
    return ProjectMembership.objects.create(
        project=project,
        user=user,
        role=ProjectRole.objects.get(role_name=role_name),
    )


@override_settings(PASSWORD_HASHERS=FAST_HASHER)
class RolesBase(APITestCase):
    def setUp(self):
        self.owner = make_user("owner@test.com")
        self.padmin = make_user("padmin@test.com")
        self.member = make_user("member@test.com")
        self.viewer = make_user("viewer@test.com")
        self.stranger = make_user("stranger@test.com")
        self.site_admin = make_user(
            "siteadmin@test.com",
            role=ProjectRole.objects.get(role_name=ProjectRole.SITE_ADMIN),
        )

        self.project = Project.objects.create(name="Alpha")
        add_member(self.project, self.owner, "owner")
        add_member(self.project, self.padmin, "admin")
        add_member(self.project, self.member, "member")
        add_member(self.project, self.viewer, "viewer")

        self.other = Project.objects.create(name="Beta")
        add_member(self.other, self.stranger, "owner")

        self.owner_task = Task.objects.create(
            project=self.project, title="Owner task", created_by=self.owner
        )
        self.member_task = Task.objects.create(
            project=self.project, title="Member task", created_by=self.member
        )

        self.url = f"/projects/{self.project.id}/"
        self.members_url = f"{self.url}members/"

    def as_user(self, user):
        self.client.force_authenticate(user=user)
        return self.client

    def role_of(self, user):
        membership = ProjectMembership.objects.filter(
            project=self.project, user=user
        ).first()
        return membership.role.role_name if membership else None
