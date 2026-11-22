from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Organization, User
from accounts.organizations import create_organization
from documents.models import Folder
from projects.access import get_role
from projects.models import Project, ProjectMembership, ProjectRole
from tasks.models import Task


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class OrganizationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@companies.test",
            password="Strong-password-123!",
            job_title="Founder",
        )
        self.first = create_organization(user=self.user, name="First Company")
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def second_organization(self):
        return create_organization(user=self.user, name="Second Company")

    def project(self, organization, name="Project"):
        project = Project.objects.create(name=name, organization=organization)
        role, _ = ProjectRole.objects.get_or_create(role_name="owner")
        ProjectMembership.objects.create(project=project, user=self.user, role=role)
        return project

    def use(self, organization):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
            HTTP_X_ORGANIZATION_ID=str(organization.id),
        )

    def test_registration_requires_nonblank_organization_and_creates_first(self):
        self.client.credentials()
        payload = {
            "email": "new@companies.test",
            "job_title": "CEO",
            "password": "Strong-password-123!",
            "confirm_password": "Strong-password-123!",
        }
        for name in (None, "", "   ", "x" * 101):
            body = payload | ({"organization_name": name} if name is not None else {})
            self.assertEqual(
                self.client.post(
                    "/accounts/register/", body, format="json"
                ).status_code,
                400,
            )
        self.assertFalse(User.objects.filter(email=payload["email"]).exists())
        response = self.client.post(
            "/accounts/register/",
            payload | {"organization_name": "  New Company  "},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        user = User.objects.get(email=payload["email"])
        self.assertEqual(user.organizations.get().name, "New Company")
        self.assertEqual(user.active_organization_id, user.organizations.get().id)
        self.assertEqual(user.active_organization.owner_id, user.id)

    def test_create_validates_names_and_enforces_two_organization_limit(self):
        for name in ("", "   ", " FIRST COMPANY ", "x" * 101):
            response = self.client.post(
                "/accounts/organizations/", {"name": name}, format="json"
            )
            self.assertEqual(response.status_code, 400, response.content)
        response = self.client.post(
            "/accounts/organizations/", {"name": "Second Company"}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["project_count"], 0)
        self.assertEqual(
            self.client.post(
                "/accounts/organizations/", {"name": "Third Company"}, format="json"
            ).status_code,
            400,
        )
        self.assertEqual(self.user.organizations.count(), 2)

    def test_switch_persists_and_new_organization_starts_empty(self):
        project = self.project(self.first, "First project")
        second = self.second_organization()
        self.user.default_project = project
        self.user.save(update_fields=["default_project"])
        response = self.client.post(f"/accounts/organizations/{second.id}/switch/")
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.active_organization_id, second.id)
        self.assertEqual(self.client.get("/projects/").json(), [])
        created = self.client.post(
            "/projects/", {"name": "Second project"}, format="json"
        )
        self.assertEqual(created.status_code, 201, created.content)
        self.assertEqual(
            Project.objects.get(pk=created.json()["id"]).organization_id, second.id
        )
        self.assertEqual(
            self.client.put(
                "/projects/default/", {"project_id": project.id}, format="json"
            ).status_code,
            404,
        )
        self.client.post(f"/accounts/organizations/{self.first.id}/switch/")
        self.assertEqual(
            [p["id"] for p in self.client.get("/projects/").json()], [project.id]
        )

    def test_cross_organization_project_task_dashboard_and_directory_isolation(self):
        project = self.project(self.first, "Private First project")
        task = Task.objects.create(
            project=project, title="First task", created_by=self.user
        )
        second = self.second_organization()
        self.use(second)
        self.assertEqual(self.client.get("/projects/").json(), [])
        self.assertEqual(self.client.get("/projects/directory/").json(), [])
        self.assertEqual(self.client.get(f"/projects/{project.id}/").status_code, 404)
        self.assertEqual(
            self.client.patch(
                f"/projects/{project.id}/", {"name": "Leaked"}, format="json"
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.get(f"/tasks/?project_id={project.id}").status_code, 404
        )
        self.assertEqual(
            self.client.patch(
                f"/tasks/{task.id}/", {"title": "Leaked"}, format="json"
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.get("/dashboard/overview/").json()["total_projects"], 0
        )
        self.assertEqual(self.client.get("/dashboard/project-health/").json(), [])

    def test_headers_keep_old_tabs_and_inflight_requests_in_their_organization(self):
        first_project = self.project(self.first)
        second = self.second_organization()
        self.use(self.first)
        self.client.post(f"/accounts/organizations/{second.id}/switch/")
        self.assertEqual(
            [p["id"] for p in self.client.get("/projects/").json()], [first_project.id]
        )
        created = self.client.post(
            "/projects/", {"name": "Old tab project"}, format="json"
        )
        self.assertEqual(
            Project.objects.get(pk=created.json()["id"]).organization_id, self.first.id
        )
        self.use(second)
        self.assertEqual(self.client.get("/projects/").json(), [])

    def test_task_list_without_selected_project_is_empty_after_switching_to_empty_organization(
        self,
    ):
        project = self.project(self.first)
        Task.objects.create(
            project=project, title="First company task", created_by=self.user
        )
        second = self.second_organization()
        self.assertEqual(
            self.client.post(
                f"/accounts/organizations/{second.id}/switch/"
            ).status_code,
            200,
        )
        response = self.client.get("/tasks/")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json(), [])

    def test_task_list_without_selected_project_only_includes_visible_projects_in_current_organization(
        self,
    ):
        first_project = self.project(self.first)
        another_project = self.project(self.first, "Another first company project")
        hidden_project = Project.objects.create(
            name="Not a project member", organization=self.first
        )
        second = self.second_organization()
        second_project = self.project(second)
        tasks = [
            Task.objects.create(
                project=project, title=project.name, created_by=self.user
            )
            for project in (
                first_project,
                another_project,
                hidden_project,
                second_project,
            )
        ]
        self.use(self.first)
        response = self.client.get("/tasks/")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(
            {task["id"] for task in response.json()}, {tasks[0].id, tasks[1].id}
        )
        self.use(second)
        response = self.client.get("/tasks/")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual([task["id"] for task in response.json()], [tasks[3].id])

    def test_task_list_project_filter_still_validates_project_id_and_creation_requires_project(
        self,
    ):
        project = self.project(self.first)
        task = Task.objects.create(
            project=project, title="Project task", created_by=self.user
        )
        response = self.client.get("/tasks/", {"project_id": project.id})
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual([item["id"] for item in response.json()], [task.id])
        self.assertEqual(
            self.client.get("/tasks/", {"project_id": "invalid"}).status_code, 400
        )
        self.assertEqual(
            self.client.post(
                "/tasks/", {"title": "Missing project"}, format="json"
            ).status_code,
            400,
        )

    def test_unknown_organization_switch_and_forged_headers_are_denied(self):
        other = User.objects.create_user(email="other@companies.test")
        foreign = create_organization(user=other, name="Other Company")
        self.assertEqual(
            self.client.post(
                f"/accounts/organizations/{foreign.id}/switch/"
            ).status_code,
            404,
        )
        self.use(foreign)
        self.assertEqual(self.client.get("/projects/").status_code, 403)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}", HTTP_X_ORGANIZATION_ID="bad"
        )
        self.assertEqual(self.client.get("/accounts/organizations/").status_code, 403)

    def test_site_admin_still_cannot_cross_organization_boundary(self):
        project = self.project(self.first)
        second = self.second_organization()
        role, _ = ProjectRole.objects.get_or_create(role_name="siteadmin")
        self.user.role = role
        self.user.save(update_fields=["role"])
        self.use(second)
        self.assertEqual(self.client.get(f"/projects/{project.id}/").status_code, 404)
        self.user.active_organization = second
        self.assertIsNone(get_role(self.user, project))

    def test_personal_folders_and_links_cannot_cross_organizations(self):
        folder_response = self.client.post(
            "/documents/folders/", {"name": "First files"}, format="json"
        )
        self.assertEqual(folder_response.status_code, 201)
        folder_id = folder_response.json()["id"]
        link = self.client.post(
            "/documents/links/",
            {
                "name": "First link",
                "url": "https://example.com",
                "folder_id": folder_id,
            },
            format="json",
        )
        self.assertEqual(link.status_code, 201)
        self.use(self.second_organization())
        library = self.client.get("/documents/?project_id=personal").json()
        self.assertEqual(library, {"folders": [], "documents": [], "links": []})
        self.assertEqual(
            self.client.patch(
                f"/documents/folders/{folder_id}/", {"name": "Leaked"}, format="json"
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.post(
                "/documents/folders/",
                {"name": "Other files", "parent_id": folder_id},
                format="json",
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.delete(f"/documents/links/{link.json()['id']}/").status_code,
            404,
        )
        self.assertEqual(
            Folder.objects.get(pk=folder_id).organization_id, self.first.id
        )

    def test_users_and_project_members_are_scoped_to_organization(self):
        teammate = User.objects.create_user(email="colleague@companies.test")
        self.first.members.add(teammate)
        project = self.project(self.first)
        second = self.second_organization()
        self.use(second)
        self.assertEqual(
            [u["id"] for u in self.client.get("/accounts/users/").json()],
            [self.user.id],
        )
        self.assertEqual(
            self.client.patch(
                f"/accounts/users/{teammate.id}/", {"is_active": False}, format="json"
            ).status_code,
            404,
        )
        second_project = self.project(second)
        response = self.client.post(
            f"/projects/{second_project.id}/members/",
            {"user_id": teammate.id, "role": "member"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            self.client.post(
                f"/projects/{project.id}/members/",
                {"user_id": teammate.id, "role": "member"},
                format="json",
            ).status_code,
            404,
        )

    def test_without_organization_can_onboard_but_cannot_create_unscoped_data(self):
        user = User.objects.create_user(email="social@companies.test")
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}"
        )
        self.assertEqual(
            self.client.get("/accounts/organizations/").json()["organizations"], []
        )
        self.assertEqual(
            self.client.post(
                "/projects/", {"name": "No company"}, format="json"
            ).status_code,
            400,
        )
        self.assertEqual(
            self.client.post(
                "/documents/folders/", {"name": "No company"}, format="json"
            ).status_code,
            400,
        )
        self.assertEqual(
            self.client.post(
                "/accounts/organizations/", {"name": "Social Company"}, format="json"
            ).status_code,
            201,
        )

    def test_removing_shared_user_preserves_their_other_organization_and_projects(self):
        teammate = User.objects.create_user(
            email="shared@companies.test", active_organization=self.first
        )
        second = self.second_organization()
        self.first.members.add(teammate)
        second.members.add(teammate)
        first_project = self.project(self.first)
        second_project = self.project(second)
        role, _ = ProjectRole.objects.get_or_create(role_name="member")
        for project in (first_project, second_project):
            ProjectMembership.objects.create(project=project, user=teammate, role=role)
        self.assertEqual(
            self.client.delete(f"/accounts/users/{teammate.id}/").status_code, 204
        )
        teammate.refresh_from_db()
        self.assertEqual(teammate.active_organization_id, second.id)
        self.assertEqual(
            list(teammate.organizations.values_list("id", flat=True)), [second.id]
        )
        self.assertEqual(
            list(teammate.project_memberships.values_list("project_id", flat=True)),
            [second_project.id],
        )

    def test_organization_user_administration_cannot_change_shared_account_globally(
        self,
    ):
        teammate = User.objects.create_user(
            email="shared@companies.test", active_organization=self.first
        )
        self.first.members.add(teammate)
        self.second_organization().members.add(teammate)
        response = self.client.patch(
            f"/accounts/users/{teammate.id}/", {"is_active": False}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        teammate.refresh_from_db()
        self.assertTrue(teammate.is_active)

    def test_organization_endpoints_require_authentication(self):
        self.client.credentials()
        self.assertEqual(self.client.get("/accounts/organizations/").status_code, 401)
        self.assertEqual(
            self.client.post(
                f"/accounts/organizations/{self.first.id}/switch/"
            ).status_code,
            401,
        )
