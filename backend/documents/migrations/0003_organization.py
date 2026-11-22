import django.db.models.deletion
from django.db import migrations, models


def preserve_existing_documents(apps, schema_editor):
    Organization = apps.get_model("accounts", "Organization")
    for model_name in ("Folder", "Document", "ResourceLink"):
        Model = apps.get_model("documents", model_name)
        for item in Model.objects.select_related("project", "owner").all().iterator():
            organization_id = (
                item.project.organization_id
                if item.project_id
                else (item.owner.active_organization_id if item.owner_id else None)
            )
            if organization_id is None:
                organization = Organization.objects.order_by("id").first()
                if organization is None:
                    organization = Organization.objects.create(
                        name="Existing organization"
                    )
                organization_id = organization.id
            Model.objects.filter(pk=item.pk).update(organization_id=organization_id)


class Migration(migrations.Migration):
    dependencies = [
        ("documents", "0002_resourcelink"),
        ("projects", "0012_project_organization"),
    ]
    operations = [
        *[
            migrations.AddField(
                model_name=model_name,
                name="organization",
                field=models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name=related_name,
                    to="accounts.organization",
                ),
            )
            for model_name, related_name in (
                ("folder", "document_folders"),
                ("document", "documents"),
                ("resourcelink", "resource_links"),
            )
        ],
        migrations.RunPython(preserve_existing_documents, migrations.RunPython.noop),
        *[
            migrations.AlterField(
                model_name=model_name,
                name="organization",
                field=models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name=related_name,
                    to="accounts.organization",
                ),
            )
            for model_name, related_name in (
                ("folder", "document_folders"),
                ("document", "documents"),
                ("resourcelink", "resource_links"),
            )
        ],
    ]
