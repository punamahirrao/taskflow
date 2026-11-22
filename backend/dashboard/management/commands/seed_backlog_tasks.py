from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from projects.models import Project, ProjectRole
from tasks.models import Task


class Command(BaseCommand):
    help = "Add repeat-safe sample tasks to a project's backlog."

    def add_arguments(self, parser):
        parser.add_argument(
            "--project-id",
            type=int,
            default=None,
            help="Project to populate. Defaults to Agile Sample Project 01.",
        )
        parser.add_argument("--count", type=int, default=100)

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Backlog sample data can only be created when DEBUG=True.")
        count = options["count"]
        if count < 1 or count > 1000:
            raise CommandError("count must be between 1 and 1000.")
        project_id = options["project_id"]
        project = (
            Project.objects.filter(pk=project_id).first()
            if project_id
            else Project.objects.filter(name="Agile Sample Project 01").first()
        )
        if project is None:
            raise CommandError("Target project was not found.")
        owner = (
            project.memberships.filter(role__role_name=ProjectRole.OWNER)
            .select_related("user")
            .first()
        )
        if owner is None:
            raise CommandError("Target project does not have an owner.")

        created = 0
        for index in range(1, count + 1):
            task, was_created = Task.objects.get_or_create(
                project=project,
                title=f"Backlog sample task {index:03d}",
                defaults={
                    "description": "Sample backlog work item for planning and prioritization.",
                    "status": "backlog",
                    "work_type": "task" if index % 5 else "story",
                    "priority": ("low", "medium", "high")[index % 3],
                    "estimate": str((index % 8) + 1),
                    "tags": ["sample", "backlog"],
                    "rank": 10000 + index,
                    "ready_for_sprint": index % 4 == 0,
                    "created_by": owner.user,
                },
            )
            if was_created:
                created += 1
            elif task.status != "backlog" or task.sprint_id is not None:
                task.status = "backlog"
                task.sprint = None
                task.save(update_fields=["status", "sprint", "updated_at"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created} backlog tasks in {project.name}; "
                f"the project now has {project.tasks.filter(status='backlog').count()} backlog tasks."
            )
        )
