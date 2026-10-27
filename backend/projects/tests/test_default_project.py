from projects.tests.base import RolesBase


class DefaultProjectTests(RolesBase):
    def test_set_and_clear_default(self):
        self.client.force_authenticate(self.owner)
        r = self.client.put("/projects/default/", {"project_id": self.project.id}, format="json")
        self.assertEqual(r.status_code, 200)
        listing = self.client.get("/projects/").data
        self.assertEqual([p["is_default"] for p in listing], [True])

        r = self.client.put("/projects/default/", {"project_id": None}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertFalse(self.client.get("/projects/").data[0]["is_default"])

    def test_cannot_default_invisible_project(self):
        self.client.force_authenticate(self.stranger)
        r = self.client.put("/projects/default/", {"project_id": self.project.id}, format="json")
        self.assertEqual(r.status_code, 404)
