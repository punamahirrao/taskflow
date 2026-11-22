from django.db import migrations

OLD_DESCRIPTION = (
    "A seeded delivery workspace for local development and API exploration."
)
NEW_DESCRIPTION = "A seeded delivery project for local development and API exploration."


def refresh_descriptions(apps, schema_editor):
    Project = apps.get_model("projects", "Project")
    Project.objects.filter(
        name__startswith="Agile Sample Project ",
        description=OLD_DESCRIPTION,
    ).update(description=NEW_DESCRIPTION)


def restore_descriptions(apps, schema_editor):
    Project = apps.get_model("projects", "Project")
    Project.objects.filter(
        name__startswith="Agile Sample Project ",
        description=NEW_DESCRIPTION,
    ).update(description=OLD_DESCRIPTION)


class Migration(migrations.Migration):
    dependencies = [("projects", "0012_project_organization")]
    operations = [migrations.RunPython(refresh_descriptions, restore_descriptions)]
