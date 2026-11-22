"""Application-level checks supplement foreign keys for organization boundaries."""

from django.core.management.base import BaseCommand, CommandError
from django.db.models import F, Q

from accounts.models import Organization, OrganizationMembership
from documents.models import Document, Folder, ResourceLink
from tasks.models import AgileBoard, BoardColumn, Sprint, Task


class Command(BaseCommand):
    help = "Check cross-organization references and project consistency without changing data."

    def handle(self, *args, **options):
        checks = {
            "task parent project": Task.objects.filter(parent__isnull=False).exclude(
                project_id=F("parent__project_id")
            ),
            "task sprint project": Task.objects.filter(sprint__isnull=False).exclude(
                project_id=F("sprint__project_id")
            ),
            "task dependency organization": Task.objects.filter(
                blocked_by__isnull=False
            ).exclude(
                project__organization_id=F("blocked_by__project__organization_id")
            ),
            "related task organization": Task.objects.filter(
                related_tasks__isnull=False
            ).exclude(
                project__organization_id=F("related_tasks__project__organization_id")
            ),
            "default project organization": OrganizationMembership.objects.filter(
                default_project__isnull=False
            ).exclude(organization_id=F("default_project__organization_id")),
            "sprint board project": Sprint.objects.filter(board__isnull=False).exclude(
                project_id=F("board__project_id")
            ),
            "board column project": BoardColumn.objects.filter(
                board__isnull=False
            ).exclude(project_id=F("board__project_id")),
        }
        for model in (Document, Folder, ResourceLink):
            checks[f"{model.__name__} project organization"] = model.objects.filter(
                project__isnull=False
            ).exclude(organization_id=F("project__organization_id"))
        checks["folder parent organization"] = Folder.objects.filter(
            parent__isnull=False
        ).exclude(organization_id=F("parent__organization_id"))
        checks["folder parent project"] = Folder.objects.filter(
            parent__isnull=False
        ).filter(
            ~Q(project_id=F("parent__project_id")),
            ~Q(project__isnull=True, parent__project__isnull=True),
        )
        failures = []
        for label, query in checks.items():
            count = query.distinct().count()
            self.stdout.write(f"{label}: {count}")
            if count:
                failures.append(label)
        for organization in Organization.objects.exclude(owner=None):
            if not organization.members.filter(pk=organization.owner_id).exists():
                failures.append(
                    f"organization {organization.pk}: owner is not a member"
                )
        # Cycle checks run in memory, avoiding one query for every ancestor.
        parents = dict(Task.objects.values_list("id", "parent_id"))
        for task_id in parents:
            seen = set()
            current = task_id
            while current is not None:
                if current in seen:
                    failures.append(f"task {task_id}: parent cycle")
                    break
                seen.add(current)
                current = parents.get(current)
        if failures:
            raise CommandError("Integrity issues: " + "; ".join(failures))
        self.stdout.write(
            self.style.SUCCESS("Application data integrity checks passed.")
        )
