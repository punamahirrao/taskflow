import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_user_managers"),
        ("projects", "0007_remove_project_owner_and_members"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="role",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="site_users",
                to="projects.projectrole",
            ),
        ),
    ]
