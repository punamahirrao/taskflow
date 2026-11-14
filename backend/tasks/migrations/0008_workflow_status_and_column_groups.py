from django.db import migrations, models


DEFAULT_STATUSES = (
    ("backlog", "Backlog", "Planning"),
    ("todo", "To Do", "Active work"),
    ("in_progress", "In Progress", "Active work"),
    ("review", "Review", "Quality"),
    ("waiting", "Waiting", "Waiting"),
    ("done", "Done", "Complete"),
)


def seed_workflow_statuses(apps, schema_editor):
    WorkflowStatus = apps.get_model("tasks", "WorkflowStatus")
    BoardColumn = apps.get_model("tasks", "BoardColumn")
    Task = apps.get_model("tasks", "Task")
    Project = apps.get_model("projects", "Project")
    db = schema_editor.connection.alias

    for position, (key, name, _group) in enumerate(DEFAULT_STATUSES):
        WorkflowStatus.objects.using(db).update_or_create(
            key=key,
            defaults={"name": name, "position": position, "is_system": True},
        )

    known = {key: (name, group) for key, name, group in DEFAULT_STATUSES}
    keys = set(BoardColumn.objects.using(db).values_list("key", flat=True))
    keys.update(Task.objects.using(db).values_list("status", flat=True))
    custom_position = len(DEFAULT_STATUSES)
    for key in sorted(keys - set(known)):
        column = BoardColumn.objects.using(db).filter(key=key).first()
        name = column.name if column else key.replace("_", " ").title()
        WorkflowStatus.objects.using(db).get_or_create(
            key=key,
            defaults={"name": name[:80], "position": custom_position, "is_system": False},
        )
        custom_position += 1

    for project in Project.objects.using(db).all():
        for position, (key, name, group) in enumerate(DEFAULT_STATUSES):
            BoardColumn.objects.using(db).update_or_create(
                project_id=project.id,
                key=key,
                defaults={"name": name, "position": position, "group_name": group},
            )
        BoardColumn.objects.using(db).filter(project_id=project.id).exclude(key__in=[item[0] for item in DEFAULT_STATUSES]).update(group_name="Other")
        for offset, column in enumerate(
            BoardColumn.objects.using(db).filter(project_id=project.id).exclude(key__in=[item[0] for item in DEFAULT_STATUSES]).order_by("position", "id")
        ):
            column.position = len(DEFAULT_STATUSES) + offset
            column.save(update_fields=["position"])


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0007_sprint_capacity_points_sprint_goal_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="WorkflowStatus",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(max_length=40, unique=True)),
                ("name", models.CharField(max_length=80)),
                ("position", models.PositiveSmallIntegerField(default=0)),
                ("is_system", models.BooleanField(default=False)),
            ],
            options={"ordering": ("position", "id")},
        ),
        migrations.AddField(
            model_name="boardcolumn",
            name="group_name",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.RunPython(seed_workflow_statuses, migrations.RunPython.noop),
    ]
