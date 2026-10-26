from projects.models import ProjectRole

from . import base
from .base import add_member


class RoleDataTests(base.RolesBase):
    def test_four_roles_exist(self):
        names = set(ProjectRole.objects.values_list("role_name", flat=True))
        self.assertEqual(names, {"owner", "admin", "member", "viewer", "siteadmin"})

    def test_user_can_have_only_one_role_per_project(self):
        with self.assertRaises(Exception):
            add_member(self.project, self.member, "viewer")
