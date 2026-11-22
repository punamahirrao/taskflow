"""Repeatable Taskflow product-development scenarios, restricted to preprod/test data."""

import os
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from accounts.models import (
    AuditEvent,
    NavigationPreference,
    Organization,
    OrganizationMembership,
    TypographyPreference,
    User,
)
from documents.models import Document, Folder, ResourceLink
from projects.models import PlanningItem, Project, ProjectMembership, ProjectRole
from tasks.models import (
    AgileBoard,
    Sprint,
    Task,
    TaskComment,
    TaskHistory,
    default_definition_of_done,
)
from tasks.services.workflows import ensure_default_columns


class Command(BaseCommand):
    help = "Populate Advirid Technologies with realistic Taskflow development data; safe to rerun."

    @staticmethod
    def task(project, actor, title, **values):
        return Task.objects.get_or_create(
            project=project, title=title, defaults={"created_by": actor, **values}
        )[0]

    @transaction.atomic
    def handle(self, *args, **options):
        if settings.DATA_ENV not in {"preprod", "test"}:
            raise CommandError(
                "Choose TASKFLOW_DATA_ENV=preprod or test. Development/production seeding is refused."
            )
        today = timezone.localdate()
        monday = today - timedelta(days=today.weekday())
        password = os.environ.get("PREPROD_DEMO_PASSWORD") or secrets.token_urlsafe(18)
        people = [
            ("punam", "Punam", "Ahirrao", "Product Owner", "Product", "owner"),
            ("aarav", "Aarav", "Shah", "Engineering Lead", "Engineering", "admin"),
            ("meera", "Meera", "Iyer", "Frontend Engineer", "Engineering", "member"),
            ("rohan", "Rohan", "Patil", "Quality Engineer", "Quality", "member"),
            ("anika", "Anika", "Rao", "Delivery Analyst", "Delivery", "viewer"),
        ]
        users = []
        created_users = []
        for slug, first, last, title, department, role in people:
            user, created = User.objects.get_or_create(
                email=f"{slug}@advirid.example",
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "job_title": title,
                    "department": department,
                    "account_type": "private",
                    "about_me": f"{title} delivering Taskflow for ADVIRID Technologies Pvt Ltd.",
                },
            )
            if created:
                user.set_password(password)
                user.save(update_fields=["password"])
                created_users.append(user.email)
            users.append(user)
        punam = users[0]
        organization = Organization.objects.filter(
            owner=punam, name__in=("Advirid", "Advirid Technologies")
        ).first()
        if organization is None:
            organization = Organization.objects.create(
                name="Advirid Technologies", owner=punam
            )
        elif organization.name != "Advirid Technologies":
            organization.name = "Advirid Technologies"
            organization.save(update_fields=["name"])
        for index, user in enumerate(users):
            membership, _ = OrganizationMembership.objects.get_or_create(
                organization=organization,
                user=user,
                defaults={"role": "admin" if index == 1 else "member"},
            )
            if user.active_organization_id is None:
                user.active_organization = organization
                user.save(update_fields=["active_organization"])
        roles = {
            key: ProjectRole.objects.get_or_create(role_name=key)[0]
            for key in ("owner", "admin", "member", "viewer", "siteadmin")
        }
        tracks = [
            (
                "Taskflow Web Experience",
                "Accessible planning, boards, documents, configuration and personal workflows.",
                [
                    "Organization switcher",
                    "Backlog refinement",
                    "Kanban work item editor",
                    "Calendar delivery dates",
                    "Dashboard live activity",
                    "Navigation icon colors",
                    "Local font preferences",
                    "Document library",
                    "Keyboard navigation",
                    "Responsive tables",
                    "Task search",
                    "User profile",
                ],
            ),
            (
                "Taskflow Platform & Identity",
                "Tenant isolation, API reliability, permissions and database maintainability.",
                [
                    "Organization membership roles",
                    "Project default preferences",
                    "Single-flight token refresh",
                    "Cross-organization authorization",
                    "Related task validation",
                    "Dependency cycle protection",
                    "Audit event storage",
                    "Database profile configuration",
                    "Preprod database copy",
                    "Seed command idempotency",
                    "OpenAPI contracts",
                    "Query indexes",
                ],
            ),
            (
                "Taskflow Quality & Delivery",
                "Release readiness, test automation, realistic fixtures and operational documentation.",
                [
                    "Organization switching regression",
                    "Board deep-link regression",
                    "Slow document response regression",
                    "Expired session regression",
                    "Viewer permission tests",
                    "Calendar accessibility",
                    "Roadmap dependency tests",
                    "Release acceptance checklist",
                    "Preprod smoke suite",
                    "CI quality gates",
                    "Database restore rehearsal",
                    "Production readiness review",
                ],
            ),
        ]
        all_tasks = []
        projects = []
        colors = ("#7c3aed", "#2563eb", "#0f766e")
        for track_index, (name, description, titles) in enumerate(tracks):
            project, _ = Project.objects.get_or_create(
                organization=organization,
                name=name,
                defaults={
                    "description": description,
                    "expected_start_date": monday - timedelta(days=28),
                    "end_date": monday + timedelta(days=42),
                },
            )
            projects.append(project)
            for index, user in enumerate(users):
                role = people[index][-1]
                ProjectMembership.objects.get_or_create(
                    project=project, user=user, defaults={"role": roles[role]}
                )
            ensure_default_columns(project)
            boards = []
            for label, board_type, archived in (
                ("Delivery", "scrum", False),
                ("Support", "kanban", False),
                ("Discovery archive", "kanban", True),
            ):
                board, _ = AgileBoard.objects.get_or_create(
                    project=project,
                    name=f"{label} · {name}",
                    defaults={
                        "board_type": board_type,
                        "description": description,
                        "owner": punam,
                        "is_archived": archived,
                    },
                )
                board.members.add(*users)
                boards.append(board)
            sprints = []
            for index, offset in enumerate((-14, 0, 14, 28)):
                sprint, _ = Sprint.objects.get_or_create(
                    project=project,
                    board=boards[0],
                    name=f"TF {track_index + 1}.{index + 1} · {('Foundation', 'Reliability', 'Delivery', 'Readiness')[index]}",
                    defaults={
                        "start_date": monday + timedelta(days=offset),
                        "end_date": monday + timedelta(days=offset + 11),
                        "is_active": index == 1,
                        "is_closed": index == 0,
                        "goal": (
                            "Establish core workflows",
                            "Make organization data and task updates dependable",
                            "Complete release acceptance criteria",
                            "Prepare Taskflow for wider adoption",
                        )[index],
                        "capacity_points": 34,
                        "velocity_points": 29 if index == 0 else None,
                        "outcome_summary": "Completed foundational Taskflow flows; carry accessibility improvements forward."
                        if index == 0
                        else "",
                        "retrospective": "Keep small pull requests. Add slow-network coverage before merging."
                        if index == 0
                        else "",
                    },
                )
                sprints.append(sprint)
            initiative = self.task(
                project,
                punam,
                f"Taskflow initiative · {name}",
                work_type="initiative",
                status="in_progress",
                assignee=punam,
                planned_start_date=monday - timedelta(days=28),
                due_date=monday + timedelta(days=42),
                roadmap_color=colors[track_index],
            )
            epic = self.task(
                project,
                punam,
                f"Release readiness · {name}",
                work_type="epic",
                status="in_progress",
                parent=initiative,
                assignee=users[1],
                planned_start_date=monday - timedelta(days=14),
                due_date=monday + timedelta(days=28),
                roadmap_color=colors[track_index],
            )
            track_tasks = [initiative, epic]
            for index, title in enumerate(titles):
                stage = index % 6
                status = (
                    "done",
                    "in_progress",
                    "review",
                    "todo",
                    "backlog",
                    "backlog",
                )[stage]
                sprint = (
                    sprints[0]
                    if stage == 0
                    else sprints[1]
                    if stage in (1, 2, 3)
                    else None
                )
                story = self.task(
                    project,
                    punam,
                    title,
                    work_type="story",
                    status=status,
                    parent=epic,
                    sprint=sprint,
                    estimate=str((3, 5, 8)[index % 3]),
                    priority=("high", "medium", "low")[index % 3],
                    assignee=users[1 + index % 3],
                    planned_start_date=monday + timedelta(days=index - 7),
                    due_date=monday + timedelta(days=index + 3),
                    tags=[
                        "taskflow",
                        ("frontend", "backend", "quality")[track_index],
                        "release-1.0",
                    ],
                    ready_for_sprint=stage != 5,
                    rank=index * 10,
                    roadmap_color=colors[track_index],
                    description=f"As a Taskflow user, I need {title.lower()} so my organization can manage delivery reliably.\n\nAcceptance criteria:\n- Enforce organization/project access.\n- Provide useful loading, empty and error states.\n- Verify the successful flow and a failure path.\n- Update user-facing documentation.",
                )
                if status == "done" and not story.completed_at:
                    Task.objects.filter(pk=story.pk).update(
                        started_at=timezone.now() - timedelta(days=12),
                        completed_at=timezone.now() - timedelta(days=8),
                        definition_done=[
                            {**item, "done": True}
                            for item in default_definition_of_done()
                        ],
                    )
                if status == "in_progress" and not story.started_at:
                    Task.objects.filter(pk=story.pk).update(
                        started_at=timezone.now() - timedelta(days=2)
                    )
                track_tasks.append(story)
                TaskComment.objects.get_or_create(
                    task=story,
                    author=users[3],
                    content="QA: cover keyboard interaction, a denied permission and organization switching before acceptance.",
                )
                history, created = TaskHistory.objects.get_or_create(
                    task=story,
                    actor=users[1 + index % 3],
                    action="created",
                    defaults={
                        "changes": {
                            "title": {"new": story.title},
                            "status": {"new": status},
                        }
                    },
                )
                if created:
                    TaskHistory.objects.filter(pk=history.pk).update(
                        created_at=timezone.now()
                        - timedelta(hours=index * 3 + track_index)
                    )
            for index, work_type in enumerate(
                ("task", "bug", "enhancement", "spike", "research", "idea")
            ):
                extra = self.task(
                    project,
                    punam,
                    f"{name} · {('Review acceptance criteria', 'Fix empty-state layout', 'Improve saved filters', 'Investigate query invalidation', 'Measure list rendering', 'Explore release dashboard')[index]}",
                    work_type=work_type,
                    assignee=users[1 + index % 3],
                    status="backlog",
                    priority="urgent" if work_type == "bug" else "medium",
                    tags=["taskflow", "discovery"],
                    rank=200 + index,
                )
                track_tasks.append(extra)
                if work_type == "enhancement" and not extra.planned_start_date:
                    Task.objects.filter(pk=extra.pk).update(
                        planned_start_date=monday + timedelta(days=14),
                        due_date=monday + timedelta(days=28),
                        roadmap_color=colors[track_index],
                    )
                    extra.blocked_by.add(epic)
            track_tasks[4].blocked_by.add(track_tasks[3])
            track_tasks[5].related_tasks.add(track_tasks[4])
            Task.objects.filter(pk=track_tasks[4].pk).update(
                blocked=True,
                blocked_since=timezone.now() - timedelta(days=1),
                escalated=True,
            )
            all_tasks.extend(track_tasks)
            folder, _ = Folder.objects.get_or_create(
                organization=organization,
                project=project,
                name="Product & delivery",
                owner=punam,
            )
            child, _ = Folder.objects.get_or_create(
                organization=organization,
                project=project,
                parent=folder,
                name="Acceptance evidence",
                owner=users[3],
            )
            content = f"Taskflow requirements: {name}\n\n{description}\n\n" + "\n".join(
                f"- {title}: organization isolation, accessible UI, failure handling and automated validation."
                for title in titles
            )
            doc, created = Document.objects.get_or_create(
                organization=organization,
                project=project,
                folder=folder,
                name="Taskflow product requirements.txt",
                defaults={
                    "owner": punam,
                    "content_type": "text/plain",
                    "size": len(content.encode()),
                },
            )
            if created:
                doc.file.save(
                    "taskflow-requirements.txt",
                    ContentFile(content.encode()),
                    save=True,
                )
            evidence, created = Document.objects.get_or_create(
                organization=organization,
                project=project,
                folder=child,
                name="Release acceptance checklist.txt",
                defaults={"owner": users[3], "content_type": "text/plain", "size": 110},
            )
            if created:
                evidence.file.save(
                    "acceptance.txt",
                    ContentFile(
                        b"Taskflow release acceptance\n[ ] Organization isolation\n[ ] Permissions\n[ ] Linked work\n[ ] Restore rehearsal\n"
                    ),
                    save=True,
                )
                evidence.size = evidence.file.size
                evidence.save(update_fields=["size"])
            ResourceLink.objects.get_or_create(
                organization=organization,
                project=project,
                folder=folder,
                name="Taskflow API documentation",
                defaults={"url": "http://localhost:8000/api/docs/", "owner": punam},
            )
            for kind, label, day in (
                ("release", "Taskflow 1.0", 21),
                ("goal", "Reliable organization-scoped delivery", 28),
                ("milestone", "Acceptance sign-off", 14),
                ("template", "Definition of delivery readiness", 35),
            ):
                item, _ = PlanningItem.objects.get_or_create(
                    organization=organization,
                    kind=kind,
                    name=f"{label} · {name}",
                    defaults={
                        "description": description
                        + "\nChecklist: scope agreed; permissions verified; regression tests pass; release notes reviewed.",
                        "target_date": monday + timedelta(days=day)
                        if kind != "template"
                        else None,
                        "status": "in_progress" if kind == "goal" else "planned",
                        "created_by": punam,
                    },
                )
                item.tasks.add(*track_tasks[2:6])
        all_tasks[22].blocked_by.add(all_tasks[3])
        all_tasks[42].related_tasks.add(all_tasks[24])
        OrganizationMembership.objects.filter(
            organization=organization, user=punam
        ).update(default_project=projects[0])
        for user in users:
            TypographyPreference.objects.get_or_create(
                user=user,
                organization=organization,
                defaults={"font_family": "Segoe UI", "font_size": 16},
            )
            NavigationPreference.objects.get_or_create(
                user=user,
                organization=organization,
                defaults={
                    "items": {
                        "dashboard": {"icon": "layout-dashboard", "color": "violet"},
                        "backlog": {"icon": "layers", "color": "blue"},
                        "boards": {"icon": "columns-3", "color": "teal"},
                        "roadmap": {"icon": "map", "color": "amber"},
                    }
                },
            )
        personal, _ = Folder.objects.get_or_create(
            organization=organization,
            project=None,
            owner=punam,
            name="Punam's delivery notes",
        )
        note, created = Document.objects.get_or_create(
            organization=organization,
            project=None,
            folder=personal,
            owner=punam,
            name="Taskflow priorities.txt",
            defaults={"content_type": "text/plain", "size": 0},
        )
        if created:
            note.file.save(
                "priorities.txt",
                ContentFile(
                    b"Taskflow priorities\n1. Organization isolation\n2. Reliable task linking\n3. Maintainable configuration\n"
                ),
                save=True,
            )
            note.size = note.file.size
            note.save(update_fields=["size"])
        sandbox, _ = Organization.objects.get_or_create(
            name="Advirid Sandbox", owner=punam
        )
        OrganizationMembership.objects.get_or_create(user=punam, organization=sandbox)
        sandbox_project, _ = Project.objects.get_or_create(
            organization=sandbox,
            name="Taskflow isolated experiments",
            defaults={
                "description": "A separate company boundary for verifying that projects, links and documents do not cross organizations."
            },
        )
        ProjectMembership.objects.get_or_create(
            project=sandbox_project, user=punam, defaults={"role": roles["owner"]}
        )
        ensure_default_columns(sandbox_project)
        self.task(
            sandbox_project,
            punam,
            "Verify isolated organization content",
            work_type="story",
        )
        AuditEvent.objects.get_or_create(
            organization=organization,
            actor=punam,
            action="seeded",
            entity_type="preprod.scenario",
            entity_id="taskflow-v1",
            defaults={"summary": "Advirid Taskflow development scenario initialized"},
        )
        access_path = settings.BASE_DIR / "PREPROD-ACCESS.local.md"
        if created_users:
            # Keep credentials local and preserve existing login details on repeat runs.
            with access_path.open("a", encoding="utf-8") as handle:
                handle.write(
                    f"\n## {settings.DATA_ENV} accounts created {timezone.now().isoformat()}\n\nOrganization: Advirid Technologies\n\n"
                    + "\n".join(f"- {email}" for email in created_users)
                    + f"\n\nInitial password: `{password}`\n\nSynthetic local data only. Do not reuse these accounts in production.\n"
                )
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {organization.name}: {organization.members.count()} users, {organization.projects.count()} projects, {Task.objects.filter(project__organization=organization).count()} work items, {Sprint.objects.filter(project__organization=organization).count()} sprints. Credentials: {access_path.name}"
            )
        )
