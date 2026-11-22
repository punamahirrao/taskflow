import django.db.models.deletion
from django.db import migrations, models


def preserve_existing_projects(apps, schema_editor):
    Project = apps.get_model("projects", "Project")
    Organization = apps.get_model("accounts", "Organization")
    if Project.objects.exists():
        organization = Organization.objects.order_by("id").first()
        if organization is None:
            organization = Organization.objects.create(name="Existing organization")
        Project.objects.update(organization=organization)


class Migration(migrations.Migration):
    dependencies = [
        ("projects", "0011_project_status"),
        ("accounts", "0010_organization"),
    ]
    operations = [
        migrations.AddField(
            model_name="project",
            name="organization",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="projects",
                to="accounts.organization",
            ),
        ),
        migrations.RunPython(preserve_existing_projects, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="project",
            name="organization",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="projects",
                to="accounts.organization",
            ),
        ),
    ]
