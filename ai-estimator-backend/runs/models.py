from django.db import models

class EstimationRun(models.Model):
    STATES = [(x, x) for x in ("queued", "parsing", "extracting", "grouping", "estimating", "ready_for_review", "failed", "cancelled")]
    host_run_id = models.CharField(max_length=80, unique=True)
    project_id = models.PositiveIntegerField()
    document_id = models.PositiveIntegerField()
    document_name = models.CharField(max_length=255)
    idempotency_key = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=32, choices=STATES, default="queued")
    stages = models.JSONField(default=dict)
    result = models.JSONField(default=dict)
    error = models.CharField(max_length=500, blank=True)
    retry_count = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class EstimatorDocument(models.Model):
    """Estimator-owned copy of an uploaded source file and its parsed text."""
    project_id = models.PositiveIntegerField(db_index=True)
    source_document_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to="estimator/%Y/%m/")
    size = models.PositiveBigIntegerField(default=0)
    content_type = models.CharField(max_length=150, blank=True)
    extracted_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)


class ExtractedRequirement(models.Model):
    """Normalized requirements extracted for an estimation run."""
    run = models.ForeignKey(EstimationRun, on_delete=models.CASCADE, related_name="requirements")
    external_id = models.CharField(max_length=40)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    requirement_type = models.CharField(max_length=32, default="functional")
    priority = models.CharField(max_length=16, default="medium")
    source_reference = models.CharField(max_length=255, blank=True)
    macro_story_id = models.CharField(max_length=40, blank=True)
    story_points = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("external_id", "id")
        constraints = [models.UniqueConstraint(fields=("run", "external_id"), name="estimator_requirement_run_external_id_uniq")]
