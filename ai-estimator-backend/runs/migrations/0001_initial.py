import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="EstimationRun",
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
                ("host_run_id", models.CharField(max_length=80, unique=True)),
                ("project_id", models.PositiveIntegerField()),
                ("document_id", models.PositiveIntegerField()),
                ("document_name", models.CharField(max_length=255)),
                ("idempotency_key", models.CharField(max_length=100, unique=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("queued", "queued"),
                            ("parsing", "parsing"),
                            ("extracting", "extracting"),
                            ("grouping", "grouping"),
                            ("estimating", "estimating"),
                            ("ready_for_review", "ready_for_review"),
                            ("failed", "failed"),
                            ("cancelled", "cancelled"),
                        ],
                        default="queued",
                        max_length=32,
                    ),
                ),
                ("stages", models.JSONField(default=dict)),
                ("result", models.JSONField(default=dict)),
                ("error", models.CharField(blank=True, max_length=500)),
                ("retry_count", models.PositiveSmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="EstimatorDocument",
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
                ("project_id", models.PositiveIntegerField(db_index=True)),
                (
                    "source_document_id",
                    models.PositiveIntegerField(blank=True, db_index=True, null=True),
                ),
                ("name", models.CharField(max_length=255)),
                ("file", models.FileField(upload_to="estimator/%Y/%m/")),
                ("size", models.PositiveBigIntegerField(default=0)),
                ("content_type", models.CharField(blank=True, max_length=150)),
                ("extracted_text", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ("-created_at",)},
        ),
        migrations.CreateModel(
            name="ExtractedRequirement",
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
                ("external_id", models.CharField(max_length=40)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                (
                    "requirement_type",
                    models.CharField(default="functional", max_length=32),
                ),
                ("priority", models.CharField(default="medium", max_length=16)),
                ("source_reference", models.CharField(blank=True, max_length=255)),
                ("macro_story_id", models.CharField(blank=True, max_length=40)),
                ("story_points", models.PositiveSmallIntegerField(default=0)),
                (
                    "run",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="requirements",
                        to="runs.estimationrun",
                    ),
                ),
            ],
            options={"ordering": ("external_id", "id")},
        ),
        migrations.AddConstraint(
            model_name="extractedrequirement",
            constraint=models.UniqueConstraint(
                fields=("run", "external_id"),
                name="estimator_requirement_run_external_id_uniq",
            ),
        ),
    ]
