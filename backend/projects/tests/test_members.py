from . import base
from .base import add_member, make_user


class MemberManagementTests(base.RolesBase):
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
        self.assertEqual(
            self.add(self.padmin, self.stranger, "member").status_code,
            201,
        )
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
            self.as_user(self.owner)
            .post(self.members_url, {"role": "member"}, format="json")
            .status_code,
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
            c.patch(
                self.detail_url(self.member), {"role": "viewer"}, format="json"
            ).status_code,
            200,
        )
        self.assertEqual(
            c.patch(
                self.detail_url(self.viewer), {"role": "admin"}, format="json"
            ).status_code,
            403,
        )
        self.assertEqual(self.role_of(self.viewer), "viewer")
        self.assertEqual(
            c.patch(
                self.detail_url(self.owner), {"role": "viewer"}, format="json"
            ).status_code,
            403,
        )
        self.assertEqual(self.role_of(self.owner), "owner")

    def test_admin_cannot_demote_self_or_other_admin(self):
        other_admin = make_user("admin2@test.com")
        add_member(self.project, other_admin, "admin")
        c = self.as_user(self.padmin)
        self.assertEqual(
            c.patch(
                self.detail_url(other_admin), {"role": "viewer"}, format="json"
            ).status_code,
            403,
        )
        self.assertEqual(
            c.patch(
                self.detail_url(self.padmin), {"role": "viewer"}, format="json"
            ).status_code,
            403,
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
            c.patch(
                self.detail_url(self.owner), {"role": "viewer"}, format="json"
            ).status_code,
            403,
        )
        self.assertEqual(c.delete(self.detail_url(self.owner)).status_code, 403)
        self.assertEqual(self.role_of(self.owner), "owner")

    def test_remove_member_rules(self):
        self.assertEqual(
            self.as_user(self.member).delete(self.detail_url(self.viewer)).status_code,
            403,
        )
        self.assertEqual(
            self.as_user(self.padmin).delete(self.detail_url(self.viewer)).status_code,
            204,
        )
        self.assertEqual(
            self.as_user(self.padmin).delete(self.detail_url(self.member)).status_code,
            204,
        )
        self.assertEqual(
            self.as_user(self.padmin).delete(self.detail_url(self.padmin)).status_code,
            403,
        )
        self.assertEqual(
            self.as_user(self.owner).delete(self.detail_url(self.padmin)).status_code,
            204,
        )
        self.assertIsNone(self.role_of(self.viewer))

    def test_removed_member_loses_access(self):
        self.as_user(self.owner).delete(self.detail_url(self.member))
        self.assertEqual(self.as_user(self.member).get(self.url).status_code, 404)

    def test_changing_member_of_missing_user_is_404(self):
        res = self.as_user(self.owner).patch(
            f"{self.members_url}99999/", {"role": "member"}, format="json"
        )
        self.assertEqual(res.status_code, 404)
