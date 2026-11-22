from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("tasks", "0017_task_planned_start_date")]
    operations = [
        migrations.AddField(
            model_name="task",
            name="roadmap_color",
            field=models.CharField(default="#7c3aed", max_length=7),
        ),
        migrations.AlterField(
            model_name="task",
            name="work_type",
            field=models.CharField(
                choices=[
                    ("task", "Task"),
                    ("story", "User story"),
                    ("idea", "Idea"),
                    ("enhancement", "Enhancement"),
                    ("bug", "Bug"),
                    ("spike", "Spike"),
                    ("research", "Research"),
                    ("epic", "Epic"),
                    ("initiative", "Initiative"),
                ],
                default="task",
                max_length=20,
            ),
        ),
    ]
