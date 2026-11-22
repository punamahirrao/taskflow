from django.db import migrations


def scope_legacy_workflow_statuses(apps, schema_editor):
    BoardColumn = apps.get_model("tasks", "BoardColumn")
    BoardColumnStatus = apps.get_model("tasks", "BoardColumnStatus")
    Project = apps.get_model("projects", "Project")
    Task = apps.get_model("tasks", "Task")
    WorkflowStatus = apps.get_model("tasks", "WorkflowStatus")
    db = schema_editor.connection.alias

    for project in Project.objects.using(db).all().iterator():
        assigned_keys = set()
        assignments = (
            BoardColumnStatus.objects.using(db)
            .filter(column__project_id=project.id)
            .select_related("status", "column")
        )
        for assignment in assignments.iterator():
            legacy = assignment.status
            if legacy.project_id is None and not legacy.is_system:
                scoped, _ = WorkflowStatus.objects.using(db).get_or_create(
                    project_id=project.id,
                    key=legacy.key,
                    defaults={
                        "name": legacy.name,
                        "position": legacy.position,
                        "is_system": False,
                    },
                )
                BoardColumnStatus.objects.using(db).filter(pk=assignment.pk).update(
                    status_id=scoped.id
                )
            assigned_keys.add(legacy.key)

        for key in (
            Task.objects.using(db)
            .filter(project_id=project.id)
            .values_list("status", flat=True)
            .distinct()
        ):
            if key in assigned_keys:
                continue
            legacy = (
                WorkflowStatus.objects.using(db)
                .filter(project__isnull=True, key=key)
                .first()
            )
            name = legacy.name if legacy else key.replace("_", " ").title()
            scoped, _ = WorkflowStatus.objects.using(db).get_or_create(
                project_id=project.id,
                key=key,
                defaults={
                    "name": name[:80],
                    "position": WorkflowStatus.objects.using(db)
                    .filter(project_id=project.id)
                    .count(),
                    "is_system": False,
                },
            )
            column = (
                BoardColumn.objects.using(db)
                .filter(project_id=project.id, key=key)
                .first()
            )
            if column is None:
                column = BoardColumn.objects.using(db).create(
                    project_id=project.id,
                    name=name[:80],
                    key=f"status_{scoped.id}",
                    position=BoardColumn.objects.using(db)
                    .filter(project_id=project.id)
                    .count(),
                    group_name="Workflow",
                )
            BoardColumnStatus.objects.using(db).get_or_create(
                column_id=column.id,
                status_id=scoped.id,
                defaults={"position": column.status_assignments.count()},
            )
            assigned_keys.add(key)


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0013_boardcolumnstatus_workflowstatus_project_and_more"),
    ]

    operations = [
        migrations.RunPython(scope_legacy_workflow_statuses, migrations.RunPython.noop),
    ]
