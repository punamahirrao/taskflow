from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def assign_board_owners(apps, schema_editor):
    AgileBoard = apps.get_model("tasks", "AgileBoard")
    ProjectMembership = apps.get_model("projects", "ProjectMembership")
    for project_id, owner_id in ProjectMembership.objects.filter(role__role_name="owner").values_list("project_id", "user_id"):
        AgileBoard.objects.filter(project_id=project_id, owner__isnull=True).update(owner_id=owner_id)
    Sprint = apps.get_model("tasks", "Sprint")
    seen_projects = set()
    for board in AgileBoard.objects.order_by("created_at", "id").iterator():
        if board.project_id in seen_projects:
            continue
        seen_projects.add(board.project_id)
        Sprint.objects.filter(project_id=board.project_id, board__isnull=True).update(board_id=board.id)


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0010_agileboard"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(model_name="agileboard", name="description", field=models.TextField(blank=True)),
        migrations.AddField(model_name="agileboard", name="is_archived", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="agileboard", name="updated_at", field=models.DateTimeField(auto_now=True)),
        migrations.AddField(model_name="agileboard", name="members", field=models.ManyToManyField(blank=True, related_name="agile_boards", to=settings.AUTH_USER_MODEL)),
        migrations.AddField(model_name="agileboard", name="owner", field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name="owned_agile_boards", to=settings.AUTH_USER_MODEL)),
        migrations.RunPython(assign_board_owners, migrations.RunPython.noop),
        migrations.AlterField(model_name="agileboard", name="owner", field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="owned_agile_boards", to=settings.AUTH_USER_MODEL)),
        migrations.AddField(model_name="sprint", name="board", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="sprints", to="tasks.agileboard")),
        migrations.AlterModelOptions(name="taskcomment", options={"ordering": ("created_at", "id")}),
        migrations.AlterModelOptions(name="agileboard", options={"ordering": ("created_at", "id")}),
    ]
