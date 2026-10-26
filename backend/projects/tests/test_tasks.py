from tasks.models import Task

from . import base


class TaskAccessTests(base.RolesBase):
    def list_tasks(self, user):
        return self.as_user(user).get(f"/tasks/?project_id={self.project.id}")

    def create_task(self, user):
        return self.as_user(user).post(
            "/tasks/", {"project_id": self.project.id, "title": "T"}, format="json"
        )

    def test_unauthenticated_is_rejected(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(
            self.client.get(f"/tasks/?project_id={self.project.id}").status_code,
            401,
        )

    def test_all_roles_see_all_tasks(self):
        for user in (self.owner, self.padmin, self.member, self.viewer):
            res = self.list_tasks(user)
            self.assertEqual(res.status_code, 200, user.email)
            self.assertEqual(
                {t["id"] for t in res.json()}, {self.owner_task.id, self.member_task.id}
            )

    def test_stranger_gets_404_and_site_admin_can_list(self):
        self.assertEqual(self.list_tasks(self.stranger).status_code, 404)
        self.assertEqual(self.list_tasks(self.site_admin).status_code, 200)

    def test_bad_project_id_values(self):
        c = self.as_user(self.owner)
        self.assertEqual(c.get("/tasks/").status_code, 400)
        self.assertEqual(c.get("/tasks/?project_id=abc").status_code, 400)
        self.assertEqual(c.get("/tasks/?project_id=99999").status_code, 404)

    def test_owner_admin_member_can_create_viewer_cannot(self):
        for user, expected in (
            (self.owner, 201),
            (self.padmin, 201),
            (self.member, 201),
            (self.viewer, 403),
            (self.stranger, 404),
        ):
            self.assertEqual(self.create_task(user).status_code, expected, user.email)

    def test_created_by_is_set_by_server(self):
        res = self.as_user(self.member).post(
            "/tasks/",
            {
                "project_id": self.project.id,
                "title": "New",
                "created_by": self.owner.id,
            },
            format="json",
        )
        self.assertEqual(res.json()["created_by"], self.member.id)

    def test_create_task_edge_cases(self):
        c = self.as_user(self.owner)
        self.assertEqual(
            c.post(
                "/tasks/", {"project_id": 99999, "title": "T"}, format="json"
            ).status_code,
            404,
        )
        self.assertEqual(
            c.post("/tasks/", {"title": "T"}, format="json").status_code,
            400,
        )

    def test_edit_task_rules(self):
        url = f"/tasks/{self.owner_task.id}/"
        for user, expected in (
            (self.owner, 200),
            (self.padmin, 200),
            (self.member, 200),
            (self.viewer, 403),
            (self.stranger, 404),
        ):
            res = self.as_user(user).patch(url, {"status": "done"}, format="json")
            self.assertEqual(res.status_code, expected, user.email)

    def test_task_cannot_be_moved_to_another_project(self):
        res = self.as_user(self.owner).patch(
            f"/tasks/{self.owner_task.id}/",
            {"project_id": self.other.id},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_delete_any_task_owner_and_admin(self):
        self.assertEqual(
            self.as_user(self.owner)
            .delete(f"/tasks/{self.member_task.id}/")
            .status_code,
            204,
        )
        self.assertEqual(
            self.as_user(self.padmin)
            .delete(f"/tasks/{self.owner_task.id}/")
            .status_code,
            204,
        )

    def test_member_deletes_only_own_task(self):
        c = self.as_user(self.member)
        self.assertEqual(
            c.delete(f"/tasks/{self.owner_task.id}/").status_code,
            403,
        )
        self.assertTrue(Task.objects.filter(id=self.owner_task.id).exists())
        self.assertEqual(
            c.delete(f"/tasks/{self.member_task.id}/").status_code,
            204,
        )

    def test_viewer_cannot_delete_even_own_task(self):
        own = Task.objects.create(
            project=self.project, title="Viewer's", created_by=self.viewer
        )
        res = self.as_user(self.viewer).delete(f"/tasks/{own.id}/")
        self.assertEqual(res.status_code, 403)
        self.assertTrue(Task.objects.filter(id=own.id).exists())

    def test_stranger_cannot_delete_task(self):
        res = self.as_user(self.stranger).delete(f"/tasks/{self.owner_task.id}/")
        self.assertEqual(res.status_code, 404)

    def test_role_change_takes_effect_immediately(self):
        self.as_user(self.owner).patch(
            f"{self.members_url}{self.member.id}/", {"role": "viewer"}, format="json"
        )
        self.assertEqual(self.create_task(self.member).status_code, 403)
        self.assertEqual(
            self.as_user(self.member)
            .delete(f"/tasks/{self.member_task.id}/")
            .status_code,
            403,
        )
