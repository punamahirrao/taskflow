import os

from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from projects.models import Project, ProjectMembership, ProjectRole
from tasks.models import AgileBoard, Sprint, Task


class Command(BaseCommand):
    help = "Create realistic sample users, projects, boards, sprints, and tasks. Safe to rerun."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Seed data can only be created when DEBUG=True.")
        demo_password = os.environ.get("SEED_DEMO_PASSWORD", "TaskFlowDemo-2026!")
        user_model = get_user_model()
        roles = {
            name: ProjectRole.objects.get_or_create(role_name=name)[0]
            for name in (ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.MEMBER, ProjectRole.VIEWER)
        }

        users = []
        for index in range(1, 21):
            email = f"agile.user{index:02d}@example.test"
            user, created = user_model.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": ("Avery", "Jordan", "Sam", "Riley", "Taylor")[index % 5],
                    "last_name": f"Contributor{index:02d}",
                    "job_title": ("Product Manager", "Engineer", "Designer", "QA Engineer")[index % 4],
                    "account_type": "organization",
                },
            )
            if created:
                user.set_password(demo_password)
                user.save(update_fields=["password"])
            users.append(user)

        projects = []
        for index in range(1, 11):
            owner = users[(index - 1) % len(users)]
            project, _ = Project.objects.get_or_create(
                name=f"Agile Sample Project {index:02d}",
                defaults={
                    "description": "A seeded delivery workspace for local development and API exploration.",
                    "status": Project.STATUS_IN_PROGRESS if index <= 8 else Project.STATUS_UPCOMING,
                },
            )
            ProjectMembership.objects.get_or_create(
                project=project, user=owner, defaults={"role": roles[ProjectRole.OWNER]}
            )
            for member_index in range(1, 5):
                member = users[(index + member_index) % len(users)]
                ProjectMembership.objects.get_or_create(
                    project=project,
                    user=member,
                    defaults={"role": roles[ProjectRole.MEMBER]},
                )
            projects.append((project, owner))

        boards = []
        for index in range(1, 26):
            project, owner = projects[(index - 1) % len(projects)]
            board, _ = AgileBoard.objects.get_or_create(
                project=project,
                name=f"Delivery Board {index:02d}",
                defaults={
                    "description": f"Team workflow for {project.name}.",
                    "board_type": AgileBoard.SCRUM if index % 3 else AgileBoard.KANBAN,
                    "owner": owner,
                },
            )
            board.members.add(owner)
            board.members.add(users[index % len(users)], users[(index + 1) % len(users)])
            boards.append(board)

        sprints = []
        for index in range(1, 16):
            board = boards[index - 1]
            project, _ = projects[(index - 1) % len(projects)]
            sprint, _ = Sprint.objects.get_or_create(
                project=project,
                board=board,
                name=f"Sample Sprint {index:02d}",
                defaults={
                    "goal": "Deliver a measurable improvement to the customer workflow.",
                    "is_active": index <= 10,
                    "capacity_points": 30 + index % 10,
                },
            )
            sprints.append(sprint)

        statuses = ("backlog", "todo", "in_progress", "review", "done")
        priorities = ("urgent", "high", "medium", "low")
        for index in range(1, 101):
            project, owner = projects[(index - 1) % len(projects)]
            sprint = sprints[(index - 1) % len(sprints)] if index % 3 else None
            assignee = users[index % len(users)]
            Task.objects.get_or_create(
                project=project,
                title=f"Sample delivery task {index:03d}",
                defaults={
                    "description": "Seeded Agile work item with realistic ownership and planning metadata.",
                    "status": statuses[index % len(statuses)],
                    "work_type": "bug" if index % 7 == 0 else "task",
                    "priority": priorities[index % len(priorities)],
                    "estimate": str((index % 8) + 1),
                    "tags": ["seeded", "delivery"],
                    "rank": index,
                    "ready_for_sprint": index % 2 == 0,
                    "assignee": assignee,
                    "sprint": sprint if sprint and sprint.project_id == project.id else None,
                    "created_by": owner,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(users)} users, {len(projects)} projects, {len(boards)} boards, "
            f"{len(sprints)} sprints, and {Task.objects.filter(title__startswith='Sample delivery task ').count()} tasks."
        ))
