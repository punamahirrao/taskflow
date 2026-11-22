from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("tasks", "0016_active_sprint_per_board")]
    operations = [
        migrations.AddField(
            model_name="task",
            name="planned_start_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
