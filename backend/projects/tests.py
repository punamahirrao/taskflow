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


class RoleDataTests(RolesBase):
    def test_four_roles_exist(self):
        names = set(ProjectRole.objects.values_list("role_name", flat=True))
        self.assertEqual(names, {"owner", "admin", "member", "viewer", "siteadmin"})

    def test_user_can_have_only_one_role_per_project(self):
        with self.assertRaises(Exception):
            add_member(self.project, self.member, "viewer")


class ProjectAccessTests(RolesBase):
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
        self.assertEqual(c.patch(self.url, {"name": "x"}, format="json").status_code, 404)
        self.assertEqual(c.delete(self.url).status_code, 404)
        self.assertEqual(c.get(self.members_url).status_code, 404)
        self.assertEqual(
            c.post(self.members_url, {"user_id": self.stranger.id, "role": "member"}, format="json").status_code,
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
            self.assertEqual(self.as_user(user).delete(self.url).status_code, 403, user.email)
        self.assertTrue(Project.objects.filter(id=self.project.id).exists())

        self.assertEqual(self.as_user(self.owner).delete(self.url).status_code, 204)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())
        self.assertFalse(Task.objects.filter(id=self.owner_task.id).exists())

    def test_put_is_not_allowed(self):
        res = self.as_user(self.owner).put(self.url, {"name": "x"}, format="json")
        self.assertEqual(res.status_code, 405)


class MemberManagementTests(RolesBase):
    def add(self, actor, user, role):
        return self.as_user(actor).post(
            self.members_url, {"user_id": user.id, "role": role}, format="json"
        )

    def detail_url(self, user):
        return f"{self.members_url}{user.id}/"

    def test_everyone_on_project_can_list_members(self):
        for user in (self.owner, self.padmin, self.member, self.viewer):
            res = self.as_user(user).get(self.members_url)
            self.assertEqual(res.status_code, 200)
            self.assertEqual(len(res.json()), 4)

    def test_owner_can_add_admin_member_viewer(self):
        for role in ("admin", "member", "viewer"):
            user = make_user(f"new-{role}@test.com")
            res = self.add(self.owner, user, role)
            self.assertEqual(res.status_code, 201, role)
            self.assertEqual(res.json()["role"], role)
            self.assertEqual(self.role_of(user), role)

    def test_project_admin_can_add_member_and_viewer_but_not_admin(self):
        self.assertEqual(self.add(self.padmin, self.stranger, "member").status_code, 201)
        other = make_user("other@test.com")
        self.assertEqual(self.add(self.padmin, other, "viewer").status_code, 201)
        third = make_user("third@test.com")
        self.assertEqual(self.add(self.padmin, third, "admin").status_code, 403)
        self.assertIsNone(self.role_of(third))

    def test_member_and_viewer_cannot_add_anyone(self):
        for actor in (self.member, self.viewer):
            res = self.add(actor, self.stranger, "member")
            self.assertEqual(res.status_code, 403, actor.email)
        self.assertIsNone(self.role_of(self.stranger))

    def test_owner_role_cannot_be_assigned(self):
        res = self.add(self.owner, self.stranger, "owner")
        self.assertEqual(res.status_code, 400)
        self.assertIsNone(self.role_of(self.stranger))

    def test_invalid_role_user_or_duplicate_is_rejected(self):
        self.assertEqual(self.add(self.owner, self.stranger, "boss").status_code, 400)
        self.assertEqual(
            self.as_user(self.owner).post(self.members_url, {"role": "member"}, format="json").status_code,
            400,
        )
        self.assertEqual(
            self.as_user(self.owner).post(
                self.members_url, {"user_id": 99999, "role": "member"}, format="json"
            ).status_code,
            400,
        )
        self.assertEqual(self.add(self.owner, self.member, "viewer").status_code, 400)

    def test_inactive_user_cannot_be_added(self):
        inactive = make_user("inactive@test.com", is_active=False)
        self.assertEqual(self.add(self.owner, inactive, "member").status_code, 400)

    def test_newly_added_user_gains_access(self):
        self.assertEqual(self.as_user(self.stranger).get(self.url).status_code, 404)
        self.add(self.owner, self.stranger, "viewer")
        self.assertEqual(self.as_user(self.stranger).get(self.url).status_code, 200)

    def test_owner_can_change_roles_of_admin_member_viewer(self):
        c = self.as_user(self.owner)
        res = c.patch(self.detail_url(self.member), {"role": "admin"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(self.role_of(self.member), "admin")
        c.patch(self.detail_url(self.padmin), {"role": "viewer"}, format="json")
        self.assertEqual(self.role_of(self.padmin), "viewer")

    def test_project_admin_can_only_change_member_and_viewer(self):
        c = self.as_user(self.padmin)
        self.assertEqual(
            c.patch(self.detail_url(self.member), {"role": "viewer"}, format="json").status_code, 200
        )
        self.assertEqual(
            c.patch(self.detail_url(self.viewer), {"role": "admin"}, format="json").status_code, 403
        )
        self.assertEqual(self.role_of(self.viewer), "viewer")
        self.assertEqual(
            c.patch(self.detail_url(self.owner), {"role": "viewer"}, format="json").status_code, 403
        )
        self.assertEqual(self.role_of(self.owner), "owner")

    def test_admin_cannot_demote_self_or_other_admin(self):
        other_admin = make_user("admin2@test.com")
        add_member(self.project, other_admin, "admin")
        c = self.as_user(self.padmin)
        self.assertEqual(
            c.patch(self.detail_url(other_admin), {"role": "viewer"}, format="json").status_code, 403
        )
        self.assertEqual(
            c.patch(self.detail_url(self.padmin), {"role": "viewer"}, format="json").status_code, 403
        )

    def test_member_and_viewer_cannot_change_roles(self):
        for actor in (self.member, self.viewer):
            res = self.as_user(actor).patch(
                self.detail_url(self.viewer), {"role": "admin"}, format="json"
            )
            self.assertEqual(res.status_code, 403, actor.email)

    def test_owner_cannot_be_changed_or_removed(self):
        c = self.as_user(self.owner)
        self.assertEqual(
            c.patch(self.detail_url(self.owner), {"role": "viewer"}, format="json").status_code, 403
        )
        self.assertEqual(c.delete(self.detail_url(self.owner)).status_code, 403)
        self.assertEqual(self.role_of(self.owner), "owner")

    def test_remove_member_rules(self):
        self.assertEqual(self.as_user(self.member).delete(self.detail_url(self.viewer)).status_code, 403)
        self.assertEqual(self.as_user(self.padmin).delete(self.detail_url(self.viewer)).status_code, 204)
        self.assertEqual(self.as_user(self.padmin).delete(self.detail_url(self.member)).status_code, 204)
        self.assertEqual(self.as_user(self.padmin).delete(self.detail_url(self.padmin)).status_code, 403)
        self.assertEqual(self.as_user(self.owner).delete(self.detail_url(self.padmin)).status_code, 204)
        self.assertIsNone(self.role_of(self.viewer))

    def test_removed_member_loses_access(self):
        self.as_user(self.owner).delete(self.detail_url(self.member))
        self.assertEqual(self.as_user(self.member).get(self.url).status_code, 404)

    def test_changing_member_of_missing_user_is_404(self):
        res = self.as_user(self.owner).patch(
            f"{self.members_url}99999/", {"role": "member"}, format="json"
        )
        self.assertEqual(res.status_code, 404)


class TaskAccessTests(RolesBase):
    def list_tasks(self, user):
        return self.as_user(user).get(f"/tasks/?project_id={self.project.id}")

    def create_task(self, user):
        return self.as_user(user).post(
            "/tasks/", {"project_id": self.project.id, "title": "T"}, format="json"
        )

    def test_unauthenticated_is_rejected(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(f"/tasks/?project_id={self.project.id}").status_code, 401)

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
            {"project_id": self.project.id, "title": "New", "created_by": self.owner.id},
            format="json",
        )
        self.assertEqual(res.json()["created_by"], self.member.id)

    def test_create_task_edge_cases(self):
        c = self.as_user(self.owner)
        self.assertEqual(
            c.post("/tasks/", {"project_id": 99999, "title": "T"}, format="json").status_code, 404
        )
        self.assertEqual(c.post("/tasks/", {"title": "T"}, format="json").status_code, 400)

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
            self.as_user(self.owner).delete(f"/tasks/{self.member_task.id}/").status_code, 204
        )
        self.assertEqual(
            self.as_user(self.padmin).delete(f"/tasks/{self.owner_task.id}/").status_code, 204
        )

    def test_member_deletes_only_own_task(self):
        c = self.as_user(self.member)
        self.assertEqual(c.delete(f"/tasks/{self.owner_task.id}/").status_code, 403)
        self.assertTrue(Task.objects.filter(id=self.owner_task.id).exists())
        self.assertEqual(c.delete(f"/tasks/{self.member_task.id}/").status_code, 204)

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
            self.as_user(self.member).delete(f"/tasks/{self.member_task.id}/").status_code, 403
        )


class UserDeletionGuardTests(RolesBase):
    def test_user_who_owns_projects_cannot_be_deleted(self):
        res = self.as_user(self.site_admin).delete(f"/accounts/users/{self.owner.id}/")
        self.assertEqual(res.status_code, 400)
        self.assertTrue(User.objects.filter(id=self.owner.id).exists())

    def test_user_who_only_is_member_can_be_deleted(self):
        res = self.as_user(self.site_admin).delete(f"/accounts/users/{self.viewer.id}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(
            ProjectMembership.objects.filter(user_id=self.viewer.id).exists()
        )
