"""Add clearly labelled board examples without replacing existing work."""
from datetime import date
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from projects.access import get_role
from projects.models import Project, ProjectMembership, ProjectRole
from tasks.models import AgileBoard, Sprint, Task
from tasks.services.workflows import ensure_board_columns


class Command(BaseCommand):
    help = "Add four owned, four shared and four archived sample boards to a development project. Safe to rerun."

    def add_arguments(self, parser):
        parser.add_argument("--project-id", type=int, required=True)
        parser.add_argument("--user-id", type=int, required=True)

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Board examples can only be seeded in a development database.")
        project = Project.objects.get(pk=options["project_id"])
        user = get_user_model().objects.get(pk=options["user_id"])
        if get_role(user, project) not in {"owner", "admin"}:
            raise CommandError("Choose an owner or administrator of the project in its active organization.")
        colleague, created = get_user_model().objects.get_or_create(
            email=f"boards.sample.{project.pk}@example.test",
            defaults={"first_name": "Jordan", "last_name": "Lee", "job_title": "Sample Delivery Lead", "account_type": "organization", "active_organization": project.organization},
        )
        if created:
            colleague.set_unusable_password()
            colleague.save(update_fields=["password"])
        project.organization.members.add(colleague)
        ProjectMembership.objects.get_or_create(project=project, user=colleague, defaults={"role": ProjectRole.objects.get(role_name="member")})
        examples = [
            ("Sprint — Nov 2026", user, False, 2026, 11, "Core workflow and team collaboration"),
            ("Sprint — Dec 2026", user, False, 2026, 12, "Reporting, dashboards and insights"),
            ("Sprint — Jan 2027", user, False, 2027, 1, "Navigation and accessibility improvements"),
            ("Sprint — Feb 2027", user, False, 2027, 2, "Release readiness and platform quality"),
            ("Customer Portal — Nov 2026", colleague, False, 2026, 11, "Customer onboarding and account experience"),
            ("Web Experience — Dec 2026", colleague, False, 2026, 12, "Responsive web and search improvements"),
            ("Mobile Delivery — Jan 2027", colleague, False, 2027, 1, "Mobile checkout and notifications"),
            ("API Integration — Feb 2027", colleague, False, 2027, 2, "Partner integration and API reliability"),
            *[(f"Sprint — {month} 2026", user, True, 2026, index, "Completed foundation and delivery work") for index, month in enumerate(("Jan", "Feb", "Mar", "Apr"), start=1)],
        ]
        count = 0
        for name, owner, archived, year, month, goal in examples:
            board, added = AgileBoard.objects.get_or_create(project=project, name=name, owner=owner, defaults={"board_type": "scrum", "description": f"Sample sprint board · {goal}.", "is_archived": archived})
            if not added and not board.description.startswith("Sample sprint board ·"):
                continue
            count += int(added)
            board.members.add(user, colleague)
            ensure_board_columns(board)
            sprint, _ = Sprint.objects.get_or_create(project=project, board=board, name=name, defaults={"start_date": date(year, month, 2), "end_date": date(year, month, 13), "is_active": not archived and (year, month) == (2026, 11), "is_closed": archived, "goal": goal, "capacity_points": 24})
            for rank, (title, estimate, status) in enumerate((("Define acceptance criteria", "3", "done"), ("Build and review the main flow", "5", "in_progress"), ("Validate accessibility and release checks", "2", "todo"))):
                Task.objects.get_or_create(project=project, sprint=sprint, title=f"{title} · {name}", defaults={"description": "Sample work item for exploring board tabs and sprint views.", "work_type": "story", "estimate": estimate, "status": "done" if archived else status, "assignee": user if rank != 1 else colleague, "created_by": user, "rank": rank, "tags": ["sample", "delivery"]})
        self.stdout.write(self.style.SUCCESS(f"Created {count} sample boards for {project.name}: four owned, four shared and four archived examples are available. Existing boards were preserved."))
