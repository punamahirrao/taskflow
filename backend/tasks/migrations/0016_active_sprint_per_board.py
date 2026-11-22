from django.db import migrations, models


def keep_one_active_sprint_per_board(apps, schema_editor):
    Sprint = apps.get_model("tasks", "Sprint")
    seen_boards = set()
    active_sprints = Sprint.objects.filter(
        board__isnull=False, is_active=True, is_closed=False
    ).order_by("board_id", "-id")
    for sprint in active_sprints.iterator():
        if sprint.board_id in seen_boards:
            Sprint.objects.filter(pk=sprint.pk).update(is_active=False)
        else:
            seen_boards.add(sprint.board_id)


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0015_remove_boardcolumn_unique_board_column_key_and_more")
    ]

    operations = [
        migrations.RunPython(
            keep_one_active_sprint_per_board, migrations.RunPython.noop
        ),
        migrations.AddConstraint(
            model_name="sprint",
            constraint=models.UniqueConstraint(
                fields=("board",),
                condition=models.Q(
                    is_active=True, is_closed=False, board__isnull=False
                ),
                name="unique_open_active_sprint_per_board",
            ),
        ),
        migrations.AddConstraint(
            model_name="sprint",
            constraint=models.CheckConstraint(
                condition=~models.Q(is_active=True, is_closed=True),
                name="closed_sprint_cannot_be_active",
            ),
        ),
    ]
