from projects.tests import base
from tasks.models import AgileBoard, Sprint, Task, TaskHistory


class SprintPlanningTests(base.RolesBase):
    def setUp(self):
        super().setUp()
        self.sprint = Sprint.objects.create(project=self.project, name="Upcoming sprint", is_active=False)

    def test_wishlist_flag_persists_and_can_be_removed(self):
        url = f"/tasks/{self.owner_task.pk}/"
        response = self.as_user(self.member).patch(url, {"is_wishlisted": True}, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(response.json()["is_wishlisted"])
        self.owner_task.refresh_from_db()
        self.assertTrue(self.owner_task.is_wishlisted)
        rows = self.client.get("/tasks/", {"project_id": self.project.pk}).json()
        self.assertTrue(next(row for row in rows if row["id"] == self.owner_task.pk)["is_wishlisted"])
        self.assertTrue(TaskHistory.objects.filter(task=self.owner_task, actor=self.member, changes__is_wishlisted__new=True).exists())
        self.assertEqual(self.client.patch(url, {"is_wishlisted": False}, format="json").status_code, 200)
        self.owner_task.refresh_from_db()
        self.assertFalse(self.owner_task.is_wishlisted)

    def test_wishlist_uses_existing_task_write_permissions(self):
        url = f"/tasks/{self.owner_task.pk}/"
        self.assertEqual(self.as_user(self.viewer).patch(url, {"is_wishlisted": True}, format="json").status_code, 403)
        self.assertEqual(self.as_user(self.stranger).patch(url, {"is_wishlisted": True}, format="json").status_code, 404)

    def test_task_can_be_created_as_wishlisted(self):
        response = self.as_user(self.owner).post("/tasks/", {"project_id": self.project.pk, "title": "Future feature", "status": "todo", "is_wishlisted": True}, format="json")
        self.assertEqual(response.status_code, 201, response.content)
        self.assertTrue(Task.objects.get(pk=response.json()["id"]).is_wishlisted)

    def test_goal_and_calendar_dates_can_be_saved_and_cleared(self):
        url = f"/tasks/sprints/{self.sprint.pk}/"
        response = self.as_user(self.owner).patch(url, {"goal": "Ship the new settings flow", "start_date": "2026-12-01", "end_date": "2026-12-14"}, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        self.sprint.refresh_from_db()
        self.assertEqual(self.sprint.goal, "Ship the new settings flow")
        self.assertEqual(self.sprint.start_date.isoformat(), "2026-12-01")
        self.assertTrue(response.json()["can_manage"])

        self.assertEqual(self.client.patch(url, {"goal": "", "start_date": None, "end_date": None}, format="json").status_code, 200)
        self.sprint.refresh_from_db()
        self.assertIsNone(self.sprint.start_date)
        self.assertIsNone(self.sprint.end_date)
        self.assertEqual(self.sprint.goal, "")

    def test_invalid_date_range_does_not_save_goal_or_dates(self):
        response = self.as_user(self.owner).patch(f"/tasks/sprints/{self.sprint.pk}/", {"goal": "Should not save", "start_date": "2026-12-14", "end_date": "2026-12-01"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.sprint.refresh_from_db()
        self.assertEqual(self.sprint.goal, "")
        self.assertIsNone(self.sprint.start_date)

    def test_management_capability_matches_server_permissions(self):
        for actor, allowed in ((self.owner, True), (self.padmin, True), (self.member, False), (self.viewer, False)):
            rows = self.as_user(actor).get("/tasks/sprints/", {"project_id": self.project.pk}).json()
            self.assertEqual(next(row for row in rows if row["id"] == self.sprint.pk)["can_manage"], allowed)
        self.assertEqual(self.as_user(self.member).patch(f"/tasks/sprints/{self.sprint.pk}/", {"goal": "Not allowed"}, format="json").status_code, 403)

    def test_board_owner_can_edit_goal_without_project_admin_role(self):
        board = AgileBoard.objects.create(project=self.project, name="Owned board", board_type="scrum", owner=self.member)
        self.sprint.board = board
        self.sprint.save()
        response = self.as_user(self.member).patch(f"/tasks/sprints/{self.sprint.pk}/", {"goal": "Board owner goal"}, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(response.json()["can_manage"])
        self.sprint.refresh_from_db()
        self.assertEqual(self.sprint.board_id, board.pk)
        self.assertTrue(AgileBoard.objects.filter(pk=board.pk).exists())
