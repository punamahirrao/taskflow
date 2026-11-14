import time

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db import transaction

from runs.models import EstimationRun, ExtractedRequirement, EstimatorDocument
from runs.services.document_parser import extract_document_text
from runs.services.llm import estimate_macro_stories, extract_requirements_in_chunks, generate_macro_stories


class Command(BaseCommand):
    help = "Process queued AI estimation runs using document parsing and OpenAI."

    def handle(self, *args, **options):
        self.stdout.write("AI estimator worker polling for queued runs")
        while True:
            run = EstimationRun.objects.filter(status="queued").order_by("created_at").first()
            if not run:
                time.sleep(1)
                continue
            self.process(run.pk)

    def process(self, run_pk):
        try:
            with transaction.atomic():
                run = EstimationRun.objects.select_for_update().get(pk=run_pk)
                if run.status != "queued":
                    return
                run.status = "parsing"
                run.stages["parsing"] = "running"
                run.save(update_fields=["status", "stages", "updated_at"])

            run = EstimationRun.objects.get(pk=run_pk)
            estimator_document = EstimatorDocument.objects.get(pk=run.result["estimator_document_id"])
            with default_storage.open(estimator_document.file.name, "rb") as source:
                text = extract_document_text(estimator_document.name, source.read())
            estimator_document.extracted_text = text
            estimator_document.save(update_fields=["extracted_text"])
            run.stages["parsing"] = "complete"
            run.stages["extracting"] = "running"
            run.status = "extracting"
            run.save(update_fields=["stages", "status", "updated_at"])

            extracted = extract_requirements_in_chunks(text)
            requirements = extracted.get("requirements", [])
            if not isinstance(requirements, list) or not requirements:
                raise ValueError("The document did not yield any structured requirements. Add more detail and retry.")
            rows = []
            normalized = []
            for index, item in enumerate(requirements, start=1):
                if not isinstance(item, dict):
                    continue
                external_id = str(item.get("id") or f"REQ-{index:03d}")[:40]
                normalized_item = {
                    "id": external_id,
                    "title": str(item.get("title", "Untitled requirement"))[:255],
                    "description": str(item.get("description", "")),
                    "type": str(item.get("type", "functional")),
                    "priority": str(item.get("priority", "medium")),
                    "source_reference": str(item.get("source_reference", ""))[:255],
                }
                if normalized_item["type"] not in {"functional", "non_functional"}:
                    normalized_item["type"] = "functional"
                if normalized_item["priority"] not in {"high", "medium", "low"}:
                    normalized_item["priority"] = "medium"
                normalized.append(normalized_item)
                rows.append(ExtractedRequirement(
                    run=run,
                    external_id=external_id,
                    title=normalized_item["title"],
                    description=normalized_item["description"],
                    requirement_type=normalized_item["type"],
                    priority=normalized_item["priority"],
                    source_reference=normalized_item["source_reference"],
                ))
            ExtractedRequirement.objects.filter(run=run).delete()
            ExtractedRequirement.objects.bulk_create(rows)
            run.result = {
                "estimator_document_id": estimator_document.pk,
                "requirements": normalized,
                "assumptions": extracted.get("assumptions", []),
                "ambiguities": extracted.get("ambiguities", []),
                "missing_information": extracted.get("missing_information", []),
            }
            run.stages["extracting"] = "complete"
            run.stages["grouping"] = "running"
            run.status = "grouping"
            run.save(update_fields=["result", "stages", "status", "updated_at"])

            grouped = generate_macro_stories(normalized)
            macros = grouped.get("macro_stories", [])
            if not isinstance(macros, list) or not macros:
                raise ValueError("The requirements could not be grouped into macro stories. Retry the estimation.")
            run.result["macro_stories"] = macros
            run.stages["grouping"] = "complete"
            run.stages["estimating"] = "running"
            run.status = "estimating"
            run.save(update_fields=["result", "stages", "status", "updated_at"])

            estimated = estimate_macro_stories(macros, normalized)
            final_macros = estimated.get("macro_stories", [])
            if not isinstance(final_macros, list) or not final_macros:
                raise ValueError("The AI estimator did not return story point estimates. Retry the estimation.")
            allowed_points = set(settings.STORY_POINT_SCALE)
            if not allowed_points:
                raise ValueError("STORY_POINT_SCALE must include at least one estimate value.")
            for macro_index, macro in enumerate(final_macros, start=1):
                if not isinstance(macro, dict):
                    raise ValueError("The AI estimator returned an invalid macro story. Retry the estimation.")
                try:
                    points = int(macro.get("story_points", 0))
                except (TypeError, ValueError):
                    points = 0
                if points not in allowed_points:
                    macro["story_points"] = min(allowed_points, key=lambda value: abs(value - points))
                if not macro.get("id"):
                    macro["id"] = f"MS-{macro_index:03d}"
            total = sum(int(item.get("story_points", 0)) for item in final_macros)
            run.result.update({
                "macro_stories": final_macros,
                "total_story_points": total,
                "estimation_rationale": estimated.get("rationale", "Fibonacci estimates are indicative and should be reviewed by the team."),
                "sample": False,
            })
            for requirement in normalized:
                macro = next((item for item in final_macros if requirement["id"] in item.get("requirement_ids", [])), None)
                if macro:
                    ExtractedRequirement.objects.filter(run=run, external_id=requirement["id"]).update(
                        macro_story_id=str(macro.get("id", ""))[:40],
                        story_points=int(macro.get("story_points", 0)),
                    )
            run.stages["estimating"] = "complete"
            run.status = "ready_for_review"
            run.error = ""
            run.save(update_fields=["result", "stages", "status", "error", "updated_at"])
        except Exception as exc:
            run = EstimationRun.objects.get(pk=run_pk)
            if run.status in run.stages:
                run.stages[run.status] = "failed"
            run.status = "failed"
            run.error = str(exc)[:500] or "Estimation failed. Retry the run."
            run.save(update_fields=["stages", "status", "error", "updated_at"])
