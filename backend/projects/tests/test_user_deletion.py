from accounts.models import User
from projects.models import ProjectMembership

from . import base


class UserDeletionGuardTests(base.RolesBase):
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
