from django.db import migrations

ROLE_NAMES = ["owner", "admin", "member", "viewer"]


def copy_owners_and_members(apps, schema_editor):
    ProjectRole = apps.get_model("projects", "ProjectRole")
    ProjectMembership = apps.get_model("projects", "ProjectMembership")
    Project = apps.get_model("projects", "Project")

    roles = {
        name: ProjectRole.objects.get_or_create(role_name=name)[0]
        for name in ROLE_NAMES
    }

    for project in Project.objects.all():
        ProjectMembership.objects.get_or_create(
            project=project,
            user_id=project.owner_id,
            defaults={"role": roles["owner"]},
        )

        for user in project.members.all():
            ProjectMembership.objects.get_or_create(
                project=project,
                user_id=user.id,
                defaults={"role": roles["member"]},
            )


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0005_project_roles_and_memberships"),
    ]

    operations = [
        migrations.RunPython(copy_owners_and_members, migrations.RunPython.noop),
    ]
