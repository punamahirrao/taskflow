from django.contrib import admin

from .models import EstimationRun, EstimatorDocument, ExtractedRequirement


@admin.register(EstimationRun)
class EstimationRunAdmin(admin.ModelAdmin):
    list_display = ("host_run_id", "project_id", "document_name", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("host_run_id", "document_name")


@admin.register(EstimatorDocument)
class EstimatorDocumentAdmin(admin.ModelAdmin):
    list_display = ("name", "project_id", "source_document_id", "size", "created_at")
    search_fields = ("name",)


@admin.register(ExtractedRequirement)
class ExtractedRequirementAdmin(admin.ModelAdmin):
    list_display = ("external_id", "title", "requirement_type", "priority", "story_points")
    list_filter = ("requirement_type", "priority")
    search_fields = ("external_id", "title", "description")
