from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("projects", "0001_initial"),
        ("tasks", "0009_task_comments_and_history"),
    ]

    operations = [
        migrations.CreateModel(
            name="AgileBoard",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("board_type", models.CharField(choices=[("scrum", "Scrum"), ("kanban", "Kanban")], max_length=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="agile_boards", to="projects.project")),
            ],
            options={"ordering": ("created_at", "id"), "permissions": [("create_agileboard", "Can create and manage agile boards (BOARD_CREATE)")]},
        ),
    ]
