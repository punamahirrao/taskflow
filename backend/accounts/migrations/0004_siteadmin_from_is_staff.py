from django.db import migrations


def staff_to_siteadmin(apps, schema_editor):
    ProjectRole = apps.get_model("projects", "ProjectRole")
    User = apps.get_model("accounts", "User")

    role, _ = ProjectRole.objects.get_or_create(role_name="siteadmin")
    User.objects.filter(is_staff=True).update(role=role)


def siteadmin_to_staff(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(role__role_name="siteadmin").update(is_staff=True)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_user_role"),
    ]

    operations = [
        migrations.RunPython(staff_to_siteadmin, siteadmin_to_staff),
    ]
