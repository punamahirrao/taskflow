"""Task API tests belong in this module or a tasks/tests package."""

from projects.tests import base


class SprintTrainApiTests(base.RolesBase):
    def test_create_multiple_sprints_and_assign_task_to_sprint(self):
        client = self.as_user(self.owner)
        first = client.post(
            "/tasks/sprints/",
            {
                "project_id": self.project.id,
                "name": "Sprint A",
                "is_active": False,
                "capacity_points": 0,
            },
            format="json",
        )
        second = client.post(
            "/tasks/sprints/",
            {
                "project_id": self.project.id,
                "name": "Sprint B",
                "is_active": False,
                "capacity_points": 30,
            },
            format="json",
        )

        self.assertEqual(first.status_code, 201, first.content)
        self.assertEqual(second.status_code, 201, second.content)
        self.assertEqual(first.json()["capacity_points"], 0)
        self.assertEqual(second.json()["capacity_points"], 30)

        created_task = client.post(
            "/tasks/",
            {
                "project_id": self.project.id,
                "title": "Sprint Train story",
                "status": "todo",
                "estimate": "5",
                "sprint": second.json()["id"],
            },
            format="json",
        )
        self.assertEqual(created_task.status_code, 201, created_task.content)
        self.assertEqual(created_task.json()["sprint"], second.json()["id"])
        self.assertEqual(created_task.json()["status"], "todo")
