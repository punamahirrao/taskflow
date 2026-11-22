from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from projects.models import Project, ProjectRole
from tasks.models import Task


class Command(BaseCommand):
    help = "Add a sample feature roadmap to Agile Sample Project 01 without overwriting existing work."

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Sample roadmaps can only be created when DEBUG=True.")
        project = Project.objects.filter(name="Agile Sample Project 01").first()
        if project is None:
            raise CommandError("Run seed_data first to create the sample project.")
        membership = (
            project.memberships.filter(role__role_name=ProjectRole.OWNER)
            .select_related("user")
            .first()
        )
        if membership is None:
            raise CommandError("The sample project needs an owner.")
        today = timezone.localdate()
        baseline = today - timedelta(days=today.weekday() + 14)
        specifications = [
            ("Discovery & requirements", 0, 4, "done", []),
            ("Experience & system design", 5, 9, "done", [0]),
            ("Customer portal", 10, 19, "in_progress", [1]),
            ("Platform & API services", 10, 24, "in_progress", [1]),
            ("Integration & automation", 25, 29, "backlog", [2, 3]),
            ("Quality & acceptance testing", 30, 34, "backlog", [4]),
            ("Production release", 35, 35, "backlog", [5]),
        ]
        features = []
        colors = [
            "#059669",
            "#0891b2",
            "#7c3aed",
            "#2563eb",
            "#d97706",
            "#db2777",
            "#475569",
        ]
        completed_stories = [10, 10, 1, 9, 0, 0, 0]
        story_titles = [
            "Access the feature",
            "Complete the main user journey",
            "Validate required information",
            "Handle invalid input",
            "See useful feedback",
            "Recover from an error",
            "Use the feature on mobile",
            "Navigate with a keyboard",
            "Keep personal data protected",
            "Meet acceptance criteria",
        ]
        for index, (title, start, end, status, dependencies) in enumerate(
            specifications
        ):
            feature, created = Task.objects.get_or_create(
                project=project,
                title=title,
                tags=["roadmap", "sample"],
                defaults={
                    "description": "Sample roadmap feature for exploring weekly planning and dependencies.",
                    "work_type": "epic",
                    "status": status,
                    "rank": index,
                    "planned_start_date": baseline + timedelta(days=start),
                    "due_date": baseline + timedelta(days=end),
                    "created_by": membership.user,
                    "assignee": membership.user,
                    "roadmap_color": colors[index],
                },
            )
            if created:
                feature.blocked_by.set(
                    [features[position] for position in dependencies]
                )
            if (
                not feature.children.filter(work_type="story").exists()
                and feature.roadmap_color == "#7c3aed"
            ):
                feature.roadmap_color = colors[index]
                feature.save(update_fields=["roadmap_color"])
            for story_index, story_title in enumerate(story_titles):
                Task.objects.get_or_create(
                    project=project,
                    parent=feature,
                    work_type="story",
                    title=f"{feature.title}: {story_title}",
                    defaults={
                        "status": "done"
                        if story_index < completed_stories[index]
                        else "backlog",
                        "tags": ["roadmap-story", "sample"],
                        "created_by": membership.user,
                        "assignee": membership.user,
                        "rank": 1000 + index * 10 + story_index,
                    },
                )
            features.append(feature)
        self.stdout.write(
            self.style.SUCCESS(
                f"Sample roadmap ready: {len(features)} features in {project.name}."
            )
        )
