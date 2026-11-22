from unittest.mock import patch

from accounts.models import Organization
from projects.models import Project
from projects.tests import base
from tasks.models import Task, TaskHistory


class BacklogReorderTests(base.RolesBase):
    def setUp(self):
        super().setUp()
        self.project.tasks.update(status="todo")
        self.items = [
            Task.objects.create(
                project=self.project, title=f"Backlog item {rank}",
                rank=rank, status="backlog", priority=priority, created_by=self.owner,
            )
            for rank, priority in enumerate(("high", "urgent", "low"))
        ]

    def reorder(self, ids, user=None, project=None):
        return self.as_user(user or self.owner).post(
            "/tasks/reorder/",
            {"project_id": (project or self.project).pk, "task_ids": ids},
            format="json",
        )

    def order(self):
        return list(self.project.tasks.filter(status="backlog").order_by("rank").values_list("id", flat=True))

    def test_move_up_and_down_saves_one_consistent_order(self):
        a, b, c = [task.pk for task in self.items]
        response = self.reorder([c, a, b])
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(self.order(), [c, a, b])
        self.assertEqual(response.json()["ranks"], [{"id": c, "rank": 0}, {"id": a, "rank": 1}, {"id": b, "rank": 2}])
        self.assertEqual(self.reorder([a, b, c], self.member).status_code, 200)
        self.assertEqual(self.order(), [a, b, c])
        self.items[2].refresh_from_db()
        self.assertEqual(self.items[2].priority, "low")
        self.assertIsNone(self.items[2].sprint_id)
        self.assertTrue(TaskHistory.objects.filter(task=self.items[2], actor=self.member, changes__rank__new=2).exists())

    def test_filtered_reorder_preserves_hidden_backlog_slots(self):
        a, b, c = [task.pk for task in self.items]
        self.assertEqual(self.reorder([c, a]).status_code, 200)
        self.assertEqual(self.order(), [c, b, a])

    def test_duplicates_missing_and_non_backlog_items_are_rejected_atomically(self):
        a, b, c = [task.pk for task in self.items]
        for ids in ([a, a], [a, 999999], [a, self.owner_task.pk], [a], []):
            response = self.reorder(ids)
            self.assertEqual(response.status_code, 400, response.content)
            self.assertEqual(self.order(), [a, b, c])

    def test_cannot_reorder_across_projects(self):
        other = Task.objects.create(project=self.other, title="Other backlog item", created_by=self.stranger)
        self.assertEqual(self.reorder([self.items[0].pk, other.pk]).status_code, 400)
        self.assertEqual(self.reorder([self.items[0].pk, self.items[1].pk], project=self.other).status_code, 404)

    def test_only_writable_project_members_can_reorder(self):
        ids = [task.pk for task in self.items]
        self.assertEqual(self.reorder(ids, self.viewer).status_code, 403)
        self.assertEqual(self.reorder(ids, self.stranger).status_code, 404)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.post("/tasks/reorder/", {"project_id": self.project.pk, "task_ids": ids}, format="json").status_code, 401)

    def test_cross_organization_project_is_hidden_even_from_site_admin(self):
        organization = Organization.objects.create(name="Other company")
        project = Project.objects.create(name="Other company project", organization=organization)
        self.assertEqual(self.reorder([task.pk for task in self.items], self.site_admin, project).status_code, 404)

    def test_repeating_order_does_not_duplicate_history(self):
        ids = [task.pk for task in reversed(self.items)]
        self.assertEqual(self.reorder(ids).status_code, 200)
        count = TaskHistory.objects.count()
        self.assertEqual(self.reorder(ids).status_code, 200)
        self.assertEqual(TaskHistory.objects.count(), count)

    def test_all_rank_changes_roll_back_if_history_cannot_be_saved(self):
        with patch("tasks.views.reorder.TaskHistory.objects.bulk_create", side_effect=RuntimeError("Test failure")):
            with self.assertRaises(RuntimeError):
                self.reorder([task.pk for task in reversed(self.items)])
        self.assertEqual(self.order(), [task.pk for task in self.items])
