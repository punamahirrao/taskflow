from django.core.management import call_command
from django.test import override_settings
from projects.tests.base import RolesBase
from tasks.models import AgileBoard, Task


class BoardExamplesTests(RolesBase):
    @override_settings(DEBUG=True)
    def test_examples_cover_tabs_and_are_idempotent(self):
        for _ in range(2):
            call_command("seed_board_examples", project_id=self.project.pk, user_id=self.owner.pk, verbosity=0)
        examples = AgileBoard.objects.filter(project=self.project, description__startswith="Sample sprint board ·")
        self.assertEqual(examples.count(), 12)
        self.assertEqual(examples.filter(is_archived=True).count(), 4)
        self.assertEqual(examples.filter(is_archived=False, owner=self.owner).count(), 4)
        self.assertEqual(examples.filter(is_archived=False).exclude(owner=self.owner).count(), 4)
        self.assertEqual(Task.objects.filter(sprint__board__in=examples).count(), 36)
        for board in examples:
            self.assertTrue(board.members.filter(pk=self.owner.pk).exists())
