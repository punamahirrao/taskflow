"""Task API tests belong in this module or a tasks/tests package."""

from projects.tests import base
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.core.files.storage import Storage
from unittest.mock import patch
from tasks.models import AgileBoard, BoardColumn, BoardColumnStatus, Sprint


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


class AgileBoardAccessTests(base.RolesBase):
    def create_board(self, user, name):
        return self.as_user(user).post(
            f"/tasks/projects/{self.project.id}/boards/",
            {"name": name, "board_type": "scrum", "description": "Board description"},
            format="json",
        )

    def test_create_board_sets_owner_and_member(self):
        response = self.as_user(self.owner).post(
            f"/tasks/projects/{self.project.id}/boards/",
            {
                "name": "Frontend",
                "board_type": "scrum",
                "description": "Board description",
                "member_ids": [self.member.id],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        board = AgileBoard.objects.get(id=response.json()["id"])
        self.assertEqual(board.owner_id, self.owner.id)
        self.assertTrue(board.members.filter(id=self.owner.id).exists())
        self.assertTrue(board.members.filter(id=self.member.id).exists())

    def test_board_columns_are_independent_and_can_be_deleted_with_statuses_moved(self):
        client = self.as_user(self.owner)
        first = AgileBoard.objects.create(
            project=self.project, name="First", board_type="kanban", owner=self.owner
        )
        second = AgileBoard.objects.create(
            project=self.project, name="Second", board_type="kanban", owner=self.owner
        )
        first_url = f"/tasks/projects/{self.project.id}/boards/{first.id}"
        second_url = f"/tasks/projects/{self.project.id}/boards/{second.id}"
        first_columns = client.get(f"{first_url}/columns/").json()
        second_columns = client.get(f"{second_url}/columns/").json()
        self.assertEqual(len(first_columns), len(second_columns))

        reduced = client.delete(f"{first_url}/columns/{first_columns[0]['id']}/")
        self.assertEqual(reduced.status_code, 400)
        destination = first_columns[1]
        deleted = client.delete(
            f"{first_url}/columns/{first_columns[0]['id']}/?move_to={destination['key']}"
        )
        self.assertEqual(deleted.status_code, 204, deleted.content)
        self.assertEqual(
            client.get(f"{first_url}/columns/").json().__len__(), len(first_columns) - 1
        )
        self.assertEqual(
            len(client.get(f"{second_url}/columns/").json()), len(second_columns)
        )
        self.assertEqual(
            len(
                client.get(f"/tasks/projects/{self.project.id}/workflow/").json()[
                    "columns"
                ]
            ),
            6,
        )

    def test_board_columns_support_adding_and_status_assignment_without_editing_statuses(
        self,
    ):
        client = self.as_user(self.owner)
        board = AgileBoard.objects.create(
            project=self.project, name="QA", board_type="kanban", owner=self.owner
        )
        base_url = f"/tasks/projects/{self.project.id}/boards/{board.id}"
        workflow = client.get(f"{base_url}/workflow/").json()
        status_ids = [workflow["statuses"][0]["id"]]
        added = client.post(
            f"{base_url}/columns/",
            {"name": "Ready", "status_ids": status_ids},
            format="json",
        )
        self.assertEqual(added.status_code, 201, added.content)
        self.assertEqual(added.json()["statuses"][0]["id"], status_ids[0])
        self.assertEqual(client.get(f"{base_url}/workflow/").status_code, 200)

    def test_board_edit_updates_members(self):
        board = AgileBoard.objects.create(
            project=self.project, name="Frontend", board_type="scrum", owner=self.owner
        )
        response = self.as_user(self.owner).patch(
            f"/tasks/projects/{self.project.id}/boards/{board.id}/",
            {"name": "Frontend v2", "member_ids": [self.member.id]},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        board.refresh_from_db()
        self.assertEqual(board.name, "Frontend v2")
        self.assertEqual(
            list(board.members.values_list("id", flat=True)), [self.member.id]
        )

    def test_create_permission_is_required(self):
        self.assertEqual(self.create_board(self.viewer, "Forbidden").status_code, 403)
        permission, _ = Permission.objects.get_or_create(
            content_type=ContentType.objects.get(app_label="tasks", model="agileboard"),
            codename="create_agileboard",
            defaults={"name": "Can create and manage agile boards (BOARD_CREATE)"},
        )
        self.member.user_permissions.add(permission)
        self.assertEqual(self.create_board(self.member, "Granted").status_code, 201)

    def test_board_listing_is_restricted_to_accessible_boards(self):
        owned = AgileBoard.objects.create(
            project=self.project,
            name="Owner board",
            board_type="scrum",
            owner=self.owner,
        )
        member_board = AgileBoard.objects.create(
            project=self.project,
            name="Member board",
            board_type="kanban",
            owner=self.owner,
        )
        member_board.members.add(self.member)
        url = "/tasks/boards/"
        owner_ids = {item["id"] for item in self.as_user(self.owner).get(url).json()}
        member_ids = {item["id"] for item in self.as_user(self.member).get(url).json()}
        viewer_ids = {item["id"] for item in self.as_user(self.viewer).get(url).json()}
        self.assertEqual(owner_ids, {owned.id, member_board.id})
        self.assertEqual(member_ids, {member_board.id})
        self.assertEqual(viewer_ids, set())

    def test_board_list_supports_private_profile_photo_storage(self):
        board = AgileBoard.objects.create(
            project=self.project,
            name="With avatar",
            board_type="scrum",
            owner=self.owner,
        )
        self.owner.profile_photo.name = "owner.png"
        self.owner.save(update_fields=["profile_photo"])
        with patch.object(
            Storage,
            "url",
            side_effect=ValueError("This file is not accessible via a URL."),
        ):
            response = self.as_user(self.owner).get("/tasks/boards/")
        self.assertEqual(response.status_code, 200, response.content)
        item = next(item for item in response.json() if item["id"] == board.id)
        self.assertTrue(
            item["members"][0]["photo_url"].endswith(
                "/accounts/profile-photos/owner.png"
            )
        )

    def test_board_detail_hides_unassigned_and_archived_boards(self):
        board = AgileBoard.objects.create(
            project=self.project, name="Private", board_type="scrum", owner=self.owner
        )
        url = f"/tasks/projects/{self.project.id}/boards/{board.id}/"
        self.assertEqual(self.as_user(self.viewer).get(url).status_code, 404)
        self.assertEqual(self.as_user(self.owner).get(url).status_code, 200)
        self.assertEqual(
            self.as_user(self.owner)
            .patch(url, {"is_archived": True}, format="json")
            .status_code,
            200,
        )
        self.assertEqual(self.as_user(self.owner).get(url).status_code, 404)

    def test_sprints_are_board_scoped(self):
        first = AgileBoard.objects.create(
            project=self.project, name="First", board_type="scrum", owner=self.owner
        )
        second = AgileBoard.objects.create(
            project=self.project, name="Second", board_type="scrum", owner=self.owner
        )
        one = Sprint.objects.create(project=self.project, board=first, name="Sprint 1")
        Sprint.objects.create(project=self.project, board=second, name="Sprint 1")
        response = self.as_user(self.owner).get(f"/tasks/sprints/?board_id={first.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [one.id])

    def test_each_active_sprint_gets_its_own_board(self):
        client = self.as_user(self.owner)
        upcoming = client.post(
            "/tasks/sprints/",
            {"project_id": self.project.id, "name": "Upcoming", "is_active": False},
            format="json",
        )
        self.assertEqual(upcoming.status_code, 201, upcoming.content)
        self.assertIsNone(upcoming.json()["board"])
        first = client.post(
            "/tasks/sprints/",
            {"project_id": self.project.id, "name": "Active A", "is_active": True},
            format="json",
        )
        second = client.post(
            "/tasks/sprints/",
            {"project_id": self.project.id, "name": "Active B", "is_active": True},
            format="json",
        )
        self.assertEqual(first.status_code, 201, first.content)
        self.assertEqual(second.status_code, 201, second.content)
        self.assertNotEqual(first.json()["board"], second.json()["board"])
        self.assertEqual(AgileBoard.objects.filter(sprints__is_active=True).count(), 2)

    def test_closing_sprint_removes_board_without_starting_upcoming_sprint(self):
        client = self.as_user(self.owner)
        active = client.post(
            "/tasks/sprints/",
            {"project_id": self.project.id, "name": "Active", "is_active": True},
            format="json",
        )
        upcoming = client.post(
            "/tasks/sprints/",
            {"project_id": self.project.id, "name": "Upcoming", "is_active": False},
            format="json",
        )
        self.assertEqual(active.status_code, 201, active.content)
        self.assertEqual(upcoming.status_code, 201, upcoming.content)
        board_id = active.json()["board"]
        closed = client.post(
            f"/tasks/sprints/{active.json()['id']}/close/", {}, format="json"
        )
        self.assertEqual(closed.status_code, 200, closed.content)
        self.assertIsNone(closed.json()["sprint"]["board"])
        self.assertFalse(Sprint.objects.get(id=upcoming.json()["id"]).is_active)
        self.assertFalse(AgileBoard.objects.filter(id=board_id).exists())

    def test_manual_start_and_stop_attach_and_remove_sprint_board(self):
        client = self.as_user(self.owner)
        created = client.post(
            "/tasks/sprints/",
            {"project_id": self.project.id, "name": "Manual", "is_active": False},
            format="json",
        )
        self.assertEqual(created.status_code, 201, created.content)
        started = client.patch(
            f"/tasks/sprints/{created.json()['id']}/",
            {"is_active": True},
            format="json",
        )
        self.assertEqual(started.status_code, 200, started.content)
        board_id = started.json()["board"]
        self.assertTrue(AgileBoard.objects.filter(id=board_id).exists())
        stopped = client.patch(
            f"/tasks/sprints/{created.json()['id']}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(stopped.status_code, 200, stopped.content)
        self.assertIsNone(stopped.json()["board"])
        self.assertFalse(AgileBoard.objects.filter(id=board_id).exists())

    def test_project_can_add_an_unmapped_status_then_group_it_in_a_column(self):
        client = self.as_user(self.owner)
        workflow = client.get(f"/tasks/projects/{self.project.id}/workflow/")
        self.assertEqual(workflow.status_code, 200, workflow.content)
        target_column = workflow.json()["columns"][1]
        added = client.post(
            f"/tasks/projects/{self.project.id}/statuses/",
            {"name": "QA Ready"},
            format="json",
        )
        self.assertEqual(added.status_code, 201, added.content)
        status_key = added.json()["key"]
        self.assertFalse(
            BoardColumnStatus.objects.filter(status__key=status_key).exists()
        )
        mapped = client.patch(
            f"/tasks/projects/{self.project.id}/columns/{target_column['id']}/",
            {
                "status_ids": [status["id"] for status in target_column["statuses"]]
                + [added.json()["id"]]
            },
            format="json",
        )
        self.assertEqual(mapped.status_code, 200, mapped.content)
        self.assertTrue(
            BoardColumnStatus.objects.filter(
                column_id=target_column["id"], status__key=status_key
            ).exists()
        )

        task = client.patch(
            f"/tasks/{self.member_task.id}/", {"status": status_key}, format="json"
        )
        self.assertEqual(task.status_code, 200, task.content)
        refreshed = client.get(f"/tasks/projects/{self.project.id}/workflow/").json()
        refreshed_column = next(
            column
            for column in refreshed["columns"]
            if column["id"] == target_column["id"]
        )
        grouped_keys = {item["key"] for item in refreshed_column["statuses"]}
        self.assertIn(status_key, grouped_keys)
        self.assertIn("todo", grouped_keys)

        unmapped = client.patch(
            f"/tasks/projects/{self.project.id}/columns/{target_column['id']}/",
            {
                "status_ids": [
                    status["id"]
                    for status in refreshed_column["statuses"]
                    if status["key"] != status_key
                ]
            },
            format="json",
        )
        self.assertEqual(unmapped.status_code, 200, unmapped.content)
        self.assertFalse(
            BoardColumnStatus.objects.filter(status__key=status_key).exists()
        )

    def test_project_can_add_an_empty_column_and_remove_it(self):
        client = self.as_user(self.owner)
        created = client.post(
            f"/tasks/projects/{self.project.id}/columns/",
            {"name": "Ready to deploy", "create_empty": True},
            format="json",
        )
        self.assertEqual(created.status_code, 201, created.content)
        deleted = client.delete(
            f"/tasks/projects/{self.project.id}/columns/{created.json()['id']}/"
        )
        self.assertEqual(deleted.status_code, 204, deleted.content)

    def test_column_status_dropdown_replaces_and_groups_status_mappings(self):
        client = self.as_user(self.owner)
        workflow = client.get(f"/tasks/projects/{self.project.id}/workflow/").json()
        target = workflow["columns"][0]
        backlog = next(
            status for status in workflow["statuses"] if status["key"] == "backlog"
        )
        todo = next(
            status for status in workflow["statuses"] if status["key"] == "todo"
        )
        in_progress = next(
            status for status in workflow["statuses"] if status["key"] == "in_progress"
        )
        response = client.patch(
            f"/tasks/projects/{self.project.id}/columns/{target['id']}/",
            {"status_ids": [backlog["id"], todo["id"], in_progress["id"]]},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(
            {item["key"] for item in response.json()["statuses"]},
            {"backlog", "todo", "in_progress"},
        )
        assignments = BoardColumnStatus.objects.filter(
            column__project=self.project,
            status_id__in=[backlog["id"], todo["id"], in_progress["id"]],
        )
        self.assertEqual(assignments.count(), 3)
        self.assertEqual(
            set(assignments.values_list("column_id", flat=True)), {target["id"]}
        )

    def test_workflow_configuration_is_read_only_for_regular_members(self):
        client = self.as_user(self.member)
        self.assertEqual(
            client.get(f"/tasks/projects/{self.project.id}/workflow/").status_code, 200
        )
        self.assertEqual(
            client.post(
                f"/tasks/projects/{self.project.id}/statuses/",
                {"name": "QA", "column_id": 1},
                format="json",
            ).status_code,
            403,
        )
        self.assertEqual(
            client.post(
                f"/tasks/projects/{self.project.id}/columns/",
                {"name": "Deploy", "create_empty": True},
                format="json",
            ).status_code,
            403,
        )
