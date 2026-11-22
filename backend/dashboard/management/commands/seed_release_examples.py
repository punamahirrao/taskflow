from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from accounts.models import Organization
from projects.models import PlanningItem, ReleaseApproval
from tasks.models import Task


class Command(BaseCommand):
    help = "Add synthetic release and goal scenarios to a specified local organization."

    def add_arguments(self, parser):
        parser.add_argument("--organization-id", type=int, required=True)

    @transaction.atomic
    def handle(self, *args, **options):
        if (
            not settings.DEBUG
            or settings.DATABASES["default"]["ENGINE"] != "django.db.backends.sqlite3"
        ):
            raise CommandError("Seed examples only in a local SQLite environment.")
        organization = (
            Organization.objects.select_for_update()
            .filter(pk=options["organization_id"])
            .first()
        )
        if not organization:
            raise CommandError("The selected organization does not exist.")
        members = list(organization.members.filter(is_active=True).order_by("id"))
        owner = next(
            (member for member in members if member.id == organization.owner_id), None
        )
        if not owner:
            raise CommandError(
                "The selected organization needs an active owner to assign example reviews."
            )
        reviewer = next((member for member in members if member.id != owner.id), owner)
        today = timezone.localdate()
        tasks = Task.objects.filter(project__organization=organization).order_by("id")
        complete = list(tasks.filter(status="done")[:4])
        open_items = list(tasks.exclude(status="done")[:10])

        goal_specs = [
            (
                "Demo · Reliable organization switching",
                "Verify that projects, tasks, and documents stay scoped to the selected organization.",
                "in_progress",
                20,
            ),
            (
                "Demo · Traceable work and release decisions",
                "Connect delivery goals to tracked work, with a documented approval for every release.",
                "planned",
                28,
            ),
            (
                "Demo · Launch readiness baseline",
                "Complete the core workflow smoke checks and publish the acceptance checklist.",
                "done",
                -7,
            ),
        ]
        goals = []
        created_goals = 0
        for index, (name, description, status, days) in enumerate(goal_specs):
            goal, created = PlanningItem.objects.get_or_create(
                organization=organization,
                kind="goal",
                name=name,
                defaults={
                    "description": description,
                    "status": status,
                    "target_date": today + timedelta(days=days),
                    "created_by": owner,
                },
            )
            if created:
                goal.tasks.set(
                    complete if status == "done" else open_items[index : index + 3]
                )
                created_goals += 1
            goals.append(goal)

        release_specs = [
            (
                "Demo · Taskflow 1.3 planning",
                "planned",
                24,
                ("pending", "pending"),
                [goals[1]],
            ),
            (
                "Demo · Taskflow 1.2 release candidate",
                "in_progress",
                7,
                ("pending", "pending"),
                [goals[0], goals[1]],
            ),
            (
                "Demo · Organization isolation patch",
                "in_progress",
                10,
                ("changes_requested", "pending"),
                [goals[0]],
            ),
            (
                "Demo · Work item traceability update",
                "in_progress",
                14,
                ("approved", "approved"),
                [goals[1]],
            ),
            (
                "Demo · Taskflow 1.0 baseline",
                "done",
                -7,
                ("approved", "approved"),
                [goals[2]],
            ),
        ]
        created_releases = 0
        for index, (name, status, days, states, linked_goals) in enumerate(
            release_specs
        ):
            release, created = PlanningItem.objects.get_or_create(
                organization=organization,
                kind="release",
                name=name,
                defaults={
                    "description": "Sample Taskflow release for trying goal links, linked work progress, and sequential sign-offs.",
                    "status": status,
                    "target_date": today + timedelta(days=days),
                    "created_by": owner,
                },
            )
            if not created:
                continue
            created_releases += 1
            release.tasks.set(
                complete
                if status == "done" or states[0] == "approved"
                else complete[:1] + open_items[index : index + 3]
            )
            release.release_goals.set(linked_goals)
            for order, (step_name, approver, state) in enumerate(
                zip(
                    ("Quality sign-off", "Release acceptance"),
                    (owner, reviewer),
                    states,
                ),
                start=1,
            ):
                note = {
                    "changes_requested": "Re-run the organization-switch regression and attach the updated acceptance evidence.",
                    "approved": "Acceptance checks reviewed.",
                }.get(state, "")
                ReleaseApproval.objects.create(
                    release=release,
                    position=order,
                    name=step_name,
                    approver=approver,
                    status=state,
                    note=note,
                    decided_at=timezone.now() if note else None,
                )
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_releases} releases and {created_goals} goals for {organization.name}."
            )
        )
