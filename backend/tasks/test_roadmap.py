from projects.tests import base
from tasks.models import Task


class RoadmapSchedulingTests(base.RolesBase):
    def test_feature_schedule_and_dependencies_are_saved(self):
        client = self.as_user(self.owner)
        response = client.post(
            "/tasks/",
            {
                "project_id": self.project.id,
                "title": "Roadmap feature",
                "work_type": "epic",
                "planned_start_date": "2026-11-23",
                "due_date": "2026-12-04",
                "blocked_by": [self.owner_task.id],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        task_id = response.data["id"]
        rows = client.get("/tasks/", {"project_id": self.project.id}).json()
        feature = next(item for item in rows if item["id"] == task_id)
        self.assertEqual(feature["planned_start_date"], "2026-11-23")
        self.assertEqual(feature["due_date"], "2026-12-04")
        self.assertEqual(feature["blocked_by"], [self.owner_task.id])

    def test_schedule_rejects_end_before_start_on_create_and_update(self):
        client = self.as_user(self.owner)
        response = client.post(
            "/tasks/",
            {
                "project_id": self.project.id,
                "title": "Invalid",
                "planned_start_date": "2026-12-04",
                "due_date": "2026-11-23",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.owner_task.planned_start_date = "2026-12-04"
        self.owner_task.save(update_fields=["planned_start_date"])
        response = client.patch(
            f"/tasks/{self.owner_task.id}/", {"due_date": "2026-11-23"}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_dependency_cycles_are_rejected_without_changing_saved_graph(self):
        self.member_task.blocked_by.add(self.owner_task)
        last = Task.objects.create(
            project=self.project, title="Last feature", created_by=self.owner
        )
        last.blocked_by.add(self.member_task)
        response = self.as_user(self.owner).patch(
            f"/tasks/{self.owner_task.id}/", {"blocked_by": [last.id]}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(self.owner_task.blocked_by.exists())

    def test_viewers_cannot_edit_schedule_and_strangers_cannot_read_it(self):
        response = self.as_user(self.viewer).patch(
            f"/tasks/{self.owner_task.id}/",
            {"planned_start_date": "2026-11-23"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        response = self.as_user(self.stranger).get(
            "/tasks/", {"project_id": self.project.id}
        )
        self.assertEqual(response.status_code, 404)

    def test_dependency_must_be_accessible(self):
        private_task = Task.objects.create(
            project=self.other, title="Private feature", created_by=self.stranger
        )
        response = self.as_user(self.owner).patch(
            f"/tasks/{self.owner_task.id}/",
            {"blocked_by": [private_task.id]},
            format="json",
        )
        self.assertEqual(response.status_code, 400)


class RoadmapStoryProgressTests(base.RolesBase):
    def setUp(self):
        super().setUp()
        self.feature = Task.objects.create(
            project=self.project,
            title="Feature",
            created_by=self.owner,
            work_type="epic",
        )
        self.feature_url = f"/tasks/{self.feature.pk}/"

    def feature_data(self):
        rows = self.client.get("/tasks/", {"project_id": self.project.id}).json()
        return next(row for row in rows if row["id"] == self.feature.pk)

    def test_color_and_story_links_persist_and_unlink_without_deleting_stories(self):
        story = Task.objects.create(
            project=self.project,
            title="Story",
            work_type="story",
            created_by=self.owner,
        )
        client = self.as_user(self.owner)
        response = client.patch(
            self.feature_url,
            {"roadmap_color": "#2563eb", "story_ids": [story.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(self.feature_data()["roadmap_color"], "#2563eb")
        self.assertEqual(self.feature_data()["linked_stories"][0]["id"], story.pk)
        response = client.patch(self.feature_url, {"story_ids": []}, format="json")
        self.assertEqual(response.status_code, 200)
        story.refresh_from_db()
        self.assertIsNone(story.parent_id)

    def test_progress_tracks_ten_ninety_and_one_hundred_percent(self):
        stories = [
            Task.objects.create(
                project=self.project,
                title=f"Story {index}",
                work_type="story",
                parent=self.feature,
                created_by=self.owner,
            )
            for index in range(10)
        ]
        client = self.as_user(self.owner)
        self.assertEqual(
            self.feature_data()["story_progress"],
            {"total": 10, "completed": 0, "percent": 0},
        )
        for index, story in enumerate(stories):
            response = client.patch(
                f"/tasks/{story.pk}/", {"status": "done"}, format="json"
            )
            self.assertEqual(response.status_code, 200, response.data)
            if index in (0, 8, 9):
                self.assertEqual(
                    self.feature_data()["story_progress"]["percent"], (index + 1) * 10
                )
        client.patch(f"/tasks/{stories[0].pk}/", {"status": "backlog"}, format="json")
        self.assertEqual(self.feature_data()["story_progress"]["percent"], 90)

    def test_progress_cannot_be_forged_and_non_story_children_do_not_count(self):
        Task.objects.create(
            project=self.project,
            title="Task",
            parent=self.feature,
            created_by=self.owner,
            status="done",
        )
        response = self.as_user(self.owner).patch(
            self.feature_url, {"story_progress": {"percent": 100}}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["story_progress"], {"total": 0, "completed": 0, "percent": 0}
        )

    def test_feature_creation_can_link_an_existing_story_atomically(self):
        story = Task.objects.create(
            project=self.project,
            title="Story",
            work_type="story",
            created_by=self.owner,
        )
        response = self.as_user(self.owner).post(
            "/tasks/",
            {
                "project_id": self.project.id,
                "title": "New feature",
                "work_type": "epic",
                "story_ids": [story.pk],
                "roadmap_color": "#db2777",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        story.refresh_from_db()
        self.assertEqual(story.parent_id, response.data["id"])

    def test_cross_project_or_already_assigned_stories_cannot_be_taken(self):
        private_story = Task.objects.create(
            project=self.other,
            title="Private",
            work_type="story",
            created_by=self.stranger,
        )
        other_feature = Task.objects.create(
            project=self.project,
            title="Other feature",
            work_type="epic",
            created_by=self.owner,
        )
        assigned = Task.objects.create(
            project=self.project,
            title="Assigned",
            work_type="story",
            parent=other_feature,
            created_by=self.owner,
        )
        client = self.as_user(self.owner)
        for story in (private_story, assigned, self.owner_task):
            response = client.patch(
                self.feature_url,
                {"story_ids": [story.pk], "title": "Must not change"},
                format="json",
            )
            self.assertEqual(response.status_code, 400)
        self.feature.refresh_from_db()
        self.assertEqual(self.feature.title, "Feature")

    def test_invalid_color_and_viewer_edits_are_rejected(self):
        client = self.as_user(self.owner)
        for color in ("red", "#123", "#abcdef\n", "url(x)"):
            self.assertEqual(
                client.patch(
                    self.feature_url, {"roadmap_color": color}, format="json"
                ).status_code,
                400,
            )
        self.assertEqual(
            self.as_user(self.viewer)
            .patch(
                self.feature_url,
                {"roadmap_color": "#ffffff", "story_ids": []},
                format="json",
            )
            .status_code,
            403,
        )
