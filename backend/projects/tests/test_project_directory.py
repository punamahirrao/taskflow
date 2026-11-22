from . import base


class ProjectDirectoryTests(base.RolesBase):
    def test_directory_requires_authentication(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get("/projects/directory/").status_code, 401)

    def test_directory_shows_summary_without_disclosing_project_work(self):
        response = self.as_user(self.member).get("/projects/directory/")
        self.assertEqual(response.status_code, 200)
        rows = {row["id"]: row for row in response.json()}
        self.assertTrue(rows[self.project.id]["has_access"])
        self.assertFalse(rows[self.other.id]["has_access"])
        self.assertEqual(set(rows[self.other.id]), {"id", "name", "has_access", "is_assigned", "description", "status", "expected_start_date", "end_date", "owner_details", "access_request_status"})
        self.assertTrue(rows[self.project.id]["is_assigned"])
        self.assertFalse(rows[self.other.id]["is_assigned"])
        self.assertEqual(rows[self.other.id]["owner_details"]["id"], self.stranger.id)
        self.assertNotIn("members", rows[self.other.id])
        self.assertEqual(
            self.client.get(f"/projects/{self.other.id}/").status_code, 404
        )

    def test_search_is_case_insensitive(self):
        response = self.as_user(self.member).get(
            "/projects/directory/", {"q": self.other.name.upper()}
        )
        self.assertIn(self.other.id, [row["id"] for row in response.json()])
        self.assertEqual(
            self.client.get(
                "/projects/directory/", {"q": "no-such-project-9274"}
            ).json(),
            [],
        )

    def test_site_admin_can_access_every_directory_entry(self):
        rows = self.as_user(self.site_admin).get("/projects/directory/").json()
        self.assertTrue(all(row["has_access"] for row in rows))
