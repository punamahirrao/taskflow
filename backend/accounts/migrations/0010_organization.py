import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def preserve_existing_users(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Organization = apps.get_model("accounts", "Organization")
    if User.objects.exists():
        organization = Organization.objects.create(
            name="Existing organization", owner=User.objects.order_by("id").first()
        )
        organization.members.add(*User.objects.values_list("id", flat=True))
        User.objects.update(active_organization=organization)


class Migration(migrations.Migration):
    dependencies = [("accounts", "0009_user_account_type")]
    operations = [
        migrations.CreateModel(
            name="Organization",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "owner",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="owned_organizations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "members",
                    models.ManyToManyField(
                        related_name="organizations", to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={"ordering": ("created_at", "id")},
        ),
        migrations.AddField(
            model_name="user",
            name="active_organization",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="active_users",
                to="accounts.organization",
            ),
        ),
        migrations.RunPython(preserve_existing_users, migrations.RunPython.noop),
    ]
