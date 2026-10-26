from projects.models import Project
from tasks.models import Task

from . import base


class ProjectAccessTests(base.RolesBase):
    def test_unauthenticated_is_rejected(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get("/projects/").status_code, 401)
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_list_shows_only_projects_user_belongs_to(self):
        def ids(user):
            return {p["id"] for p in self.as_user(user).get("/projects/").json()}

        for user in (self.owner, self.padmin, self.member, self.viewer):
            self.assertEqual(ids(user), {self.project.id})
        self.assertEqual(ids(self.stranger), {self.other.id})

    def test_site_admin_sees_all_projects_with_full_access(self):
        self.assertTrue(self.site_admin.is_staff)
        self.assertFalse(self.owner.is_staff)
        self.assertEqual(self.site_admin.role.role_name, "siteadmin")
        c = self.as_user(self.site_admin)
        self.assertEqual(
            {p["id"] for p in c.get("/projects/").json()},
            {self.project.id, self.other.id},
        )
        self.assertEqual(c.get(self.url).status_code, 200)
        self.assertEqual(c.get(self.url).json()["my_role"], "owner")

    def test_response_contains_my_role_owner_and_members(self):
        for user, role in (
            (self.owner, "owner"),
            (self.padmin, "admin"),
            (self.member, "member"),
            (self.viewer, "viewer"),
        ):
            data = self.as_user(user).get(self.url).json()
            self.assertEqual(data["my_role"], role)
            self.assertEqual(data["owner"], self.owner.id)
            self.assertEqual(
                {m["id"]: m["role"] for m in data["members"]},
                {
                    self.owner.id: "owner",
                    self.padmin.id: "admin",
                    self.member.id: "member",
                    self.viewer.id: "viewer",
                },
            )

    def test_stranger_gets_404_everywhere(self):
        c = self.as_user(self.stranger)
        self.assertEqual(c.get(self.url).status_code, 404)
        self.assertEqual(
            c.patch(self.url, {"name": "x"}, format="json").status_code,
            404,
        )
        self.assertEqual(c.delete(self.url).status_code, 404)
        self.assertEqual(c.get(self.members_url).status_code, 404)
        self.assertEqual(
            c.post(
                self.members_url,
                {"user_id": self.stranger.id, "role": "member"},
                format="json",
            ).status_code,
            404,
        )

    def test_create_project_makes_creator_owner(self):
        res = self.as_user(self.stranger).post(
            "/projects/", {"name": "New", "description": "d"}, format="json"
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()["owner"], self.stranger.id)
        self.assertEqual(res.json()["my_role"], "owner")
        self.assertEqual(len(res.json()["members"]), 1)

    def test_create_project_ignores_client_supplied_roles(self):
        res = self.as_user(self.stranger).post(
            "/projects/",
            {"name": "New", "owner": self.owner.id, "my_role": "viewer", "members": []},
            format="json",
        )
        self.assertEqual(res.json()["owner"], self.stranger.id)

    def test_create_project_requires_name(self):
        res = self.as_user(self.stranger).post("/projects/", {}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_everyone_on_project_can_view_it(self):
        for user in (self.owner, self.padmin, self.member, self.viewer):
            self.assertEqual(self.as_user(user).get(self.url).status_code, 200)

    def test_only_owner_and_admin_can_edit_project(self):
        for user, expected in (
            (self.owner, 200),
            (self.padmin, 200),
            (self.member, 403),
            (self.viewer, 403),
        ):
            res = self.as_user(user).patch(self.url, {"name": "Renamed"}, format="json")
            self.assertEqual(res.status_code, expected, user.email)

    def test_only_owner_can_delete_project(self):
        for user in (self.padmin, self.member, self.viewer):
            self.assertEqual(
                self.as_user(user).delete(self.url).status_code,
                403,
                user.email,
            )
        self.assertTrue(Project.objects.filter(id=self.project.id).exists())

        self.assertEqual(self.as_user(self.owner).delete(self.url).status_code, 204)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())
        self.assertFalse(Task.objects.filter(id=self.owner_task.id).exists())

    def test_put_is_not_allowed(self):
        res = self.as_user(self.owner).put(self.url, {"name": "x"}, format="json")
        self.assertEqual(res.status_code, 405)
