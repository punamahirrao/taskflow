from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import AuditEvent, OrganizationMembership, User
from accounts.organizations import create_organization
from projects.models import Project, ProjectMembership, ProjectRole
from tasks.models import AgileBoard, Task


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class OrganizationHardeningTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@advirid.test", password="Test-only-123!", job_title="Owner"
        )
        self.org = create_organization(user=self.owner, name="Advirid")
        self.owner.refresh_from_db()
        self.member = User.objects.create_user(
            email="member@advirid.test",
            password="Test-only-123!",
            job_title="Engineer",
            active_organization=self.org,
        )
        self.org.members.add(self.member)
        self.project = Project.objects.create(organization=self.org, name="Taskflow")
        self.role, _ = ProjectRole.objects.get_or_create(role_name="owner")
        ProjectMembership.objects.create(
            project=self.project, user=self.owner, role=self.role
        )
        self.task = Task.objects.create(
            project=self.project, created_by=self.owner, title="Taskflow identity"
        )
        self.other_task = Task.objects.create(
            project=self.project, created_by=self.owner, title="Taskflow delivery"
        )
        self.client.force_authenticate(self.owner)

    def test_member_cannot_manage_users_or_audit(self):
        self.client.force_authenticate(self.member)
        self.assertEqual(
            self.client.patch(
                f"/accounts/users/{self.owner.pk}/", {"is_active": False}, format="json"
            ).status_code,
            403,
        )
        self.assertEqual(
            self.client.delete(f"/accounts/users/{self.owner.pk}/").status_code, 403
        )
        self.assertEqual(
            self.client.post("/accounts/users/", {}, format="json").status_code, 403
        )
        self.assertEqual(self.client.get("/accounts/audit/").status_code, 403)

    def test_login_identity_is_case_insensitive_and_independent_of_company_tab(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            "/accounts/login/",
            {
                "email": self.owner.email.upper(),
                "password": "Test-only-123!",
                "account_type": "organization",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)

    def test_admin_capabilities_returned_per_organization(self):
        OrganizationMembership.objects.filter(
            user=self.member, organization=self.org
        ).update(role="admin")
        self.client.force_authenticate(self.member)
        self.assertEqual(
            self.client.get("/accounts/organizations/").json()["organizations"][0][
                "role"
            ],
            "admin",
        )
        self.assertEqual(self.client.get("/accounts/audit/").status_code, 200)

    def test_links_are_symmetric_and_can_be_removed(self):
        response = self.client.patch(
            f"/tasks/{self.task.pk}/",
            {"related_tasks": [self.other_task.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(self.other_task.related_tasks.filter(pk=self.task.pk).exists())
        self.client.patch(
            f"/tasks/{self.task.pk}/", {"related_tasks": []}, format="json"
        )
        self.assertFalse(self.other_task.related_tasks.exists())

    def test_kanban_board_includes_unsprinted_work(self):
        board = AgileBoard.objects.create(
            project=self.project,
            owner=self.owner,
            name="Taskflow support",
            board_type="kanban",
        )
        response = self.client.get(f"/tasks/?board_id={board.pk}")
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.task.pk, [task["id"] for task in response.json()])

    def test_links_reject_self_and_other_organization(self):
        second = create_organization(user=self.owner, name="Other company")
        other_project = Project.objects.create(organization=second, name="Private")
        foreign = Task.objects.create(
            project=other_project, created_by=self.owner, title="Private task"
        )
        for task_id in (self.task.pk, foreign.pk):
            response = self.client.patch(
                f"/tasks/{self.task.pk}/", {"related_tasks": [task_id]}, format="json"
            )
            self.assertEqual(response.status_code, 400, response.content)

    def test_dependency_and_parent_cycles_rejected(self):
        self.task.blocked_by.add(self.other_task)
        response = self.client.patch(
            f"/tasks/{self.other_task.pk}/",
            {"blocked_by": [self.task.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        Task.objects.filter(pk__in=[self.task.pk, self.other_task.pk]).update(
            work_type="epic"
        )
        self.task.parent = self.other_task
        self.task.save()
        response = self.client.patch(
            f"/tasks/{self.other_task.pk}/", {"parent": self.task.pk}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_defaults_are_saved_per_organization(self):
        self.client.put(
            "/projects/default/", {"project_id": self.project.pk}, format="json"
        )
        second = create_organization(user=self.owner, name="Other company")
        self.owner.active_organization = second
        self.owner.save()
        second_project = Project.objects.create(
            organization=second, name="Other Taskflow"
        )
        ProjectMembership.objects.create(
            project=second_project, user=self.owner, role=self.role
        )
        self.client.put(
            "/projects/default/", {"project_id": second_project.pk}, format="json"
        )
        self.owner.active_organization = self.org
        self.owner.save()
        self.assertTrue(self.client.get("/projects/").json()[0]["is_default"])

    def test_planning_permissions_and_tenant_isolation(self):
        response = self.client.post(
            "/projects/planning/",
            {"kind": "release", "name": "Taskflow 1.0", "tasks": [self.task.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.client.force_authenticate(self.member)
        self.assertEqual(
            self.client.post(
                "/projects/planning/",
                {"kind": "goal", "name": "Unauthorized"},
                format="json",
            ).status_code,
            403,
        )
        self.assertEqual(
            self.client.get("/projects/planning/").json()["items"][0]["tasks"], []
        )

    def test_real_activity_and_calendar_scope(self):
        self.client.patch(
            f"/tasks/{self.task.pk}/",
            {"title": "Updated Taskflow identity", "due_date": "2026-11-21"},
            format="json",
        )
        self.assertEqual(
            self.client.get("/dashboard/activity/").json()[0]["title"],
            "Updated Taskflow identity",
        )
        self.assertEqual(
            self.client.get(
                "/dashboard/calendar/?start=2026-11-01&end=2026-11-30"
            ).json()[0]["title"],
            "Updated Taskflow identity",
        )
        self.assertEqual(
            self.client.get("/dashboard/calendar/?start=bad").status_code, 400
        )
        self.assertTrue(
            AuditEvent.objects.filter(
                organization=self.org,
                entity_type="tasks.task",
                entity_id=str(self.task.pk),
            ).exists()
        )

    def test_deleting_author_retains_work_items(self):
        author = User.objects.create_user(
            email="former@advirid.test", job_title="Engineer"
        )
        task = Task.objects.create(
            project=self.project, created_by=author, title="Preserved work"
        )
        author.delete()
        task.refresh_from_db()
        self.assertIsNone(task.created_by_id)

    @patch("estimator_proxy.service")
    def test_estimator_import_persists_and_deduplicates(self, service):
        service.return_value = (
            {"project_id": self.project.pk, "status": "ready_for_review"},
            200,
        )
        data = {"stories": [{"title": "Verify Taskflow import", "points": 5}]}
        first = self.client.post(
            "/api/ai-estimator/v1/runs/preprod-run/stories/", data, format="json"
        )
        self.assertEqual(first.status_code, 201, first.content)
        second = self.client.post(
            "/api/ai-estimator/v1/runs/preprod-run/stories/", data, format="json"
        )
        self.assertEqual(second.status_code, 200, second.content)
        self.assertTrue(second.json()["already_created"])
        self.assertEqual(Task.objects.filter(title="Verify Taskflow import").count(), 1)

    @patch("estimator_proxy.service")
    def test_estimator_retry_checks_access_before_mutating(self, service):
        service.return_value = (
            {"project_id": self.project.pk, "status": "failed"},
            200,
        )
        self.client.force_authenticate(self.member)
        response = self.client.post(
            "/api/ai-estimator/v1/runs/private-run/", {}, format="json"
        )
        self.assertEqual(response.status_code, 404)
        service.assert_called_once()

    @patch("estimator_proxy.service")
    def test_estimator_import_accepts_custom_and_fractional_estimates(self, service):
        service.return_value = (
            {"project_id": self.project.pk, "status": "ready_for_review"},
            200,
        )
        for points in (7, 0.5, 55):
            response = self.client.post(
                f"/api/ai-estimator/v1/runs/custom-{points}/stories/",
                {
                    "stories": [
                        {"title": f"Taskflow estimate {points}", "points": points}
                    ]
                },
                format="json",
            )
            self.assertEqual(response.status_code, 201, response.content)
            self.assertEqual(
                float(Task.objects.get(title=f"Taskflow estimate {points}").estimate),
                points,
            )

    def test_nonfinite_estimates_rejected(self):
        for estimate in ("NaN", "Infinity", "-1"):
            response = self.client.patch(
                f"/tasks/{self.task.pk}/", {"estimate": estimate}, format="json"
            )
            self.assertEqual(response.status_code, 400)

    def test_seed_refuses_development_database(self):
        with override_settings(DATA_ENV="development"):
            with self.assertRaises(CommandError):
                call_command("seed_preprod")
