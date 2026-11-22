import uuid

from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth import ServiceTokenAuthentication
from .models import EstimationRun, EstimatorDocument


class ServiceView(APIView):
    authentication_classes = [ServiceTokenAuthentication]
    permission_classes = [AllowAny]


class DocumentUploadView(ServiceView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = request.FILES.get("file")
        try:
            project_id = int(request.data.get("project_id", ""))
            source_document_id = int(request.data.get("source_document_id", ""))
        except (TypeError, ValueError):
            return Response(
                {"detail": "Valid project_id and source_document_id are required."},
                status=400,
            )
        if upload is None:
            return Response(
                {"detail": "A requirement document file is required."}, status=400
            )
        if not upload.name.lower().endswith(
            (".pdf", ".docx", ".txt", ".md", ".markdown")
        ):
            return Response(
                {
                    "detail": "Supported requirement files are PDF, DOCX, TXT, and Markdown."
                },
                status=415,
            )
        if upload.size > settings.MAX_DOCUMENT_BYTES:
            return Response(
                {
                    "detail": f"Document exceeds the {settings.MAX_DOCUMENT_BYTES // (1024 * 1024)} MB upload limit."
                },
                status=413,
            )
        existing = EstimatorDocument.objects.filter(
            project_id=project_id, source_document_id=source_document_id
        ).first()
        if existing:
            return Response(
                {
                    "id": existing.pk,
                    "project_id": existing.project_id,
                    "source_document_id": existing.source_document_id,
                    "name": existing.name,
                    "size": existing.size,
                },
                status=200,
            )
        document = EstimatorDocument(
            project_id=project_id,
            source_document_id=source_document_id,
            name=upload.name[:255],
            size=upload.size,
            content_type=getattr(upload, "content_type", "") or "",
        )
        document.file.save(upload.name, upload, save=True)
        return Response(
            {
                "id": document.pk,
                "project_id": document.project_id,
                "source_document_id": document.source_document_id,
                "name": document.name,
                "size": document.size,
            },
            status=201,
        )


class RunStartView(ServiceView):
    def post(self, request):
        key = str(request.data.get("idempotency_key", ""))
        try:
            document_id = int(request.data.get("estimator_document_id", ""))
            project_id = int(request.data.get("project_id", ""))
        except (TypeError, ValueError):
            return Response(
                {"detail": "Valid project_id and estimator_document_id are required."},
                status=400,
            )
        if not key or len(key) > 100:
            return Response(
                {"detail": "Valid idempotency_key is required."}, status=400
            )
        document = get_object_or_404(
            EstimatorDocument, pk=document_id, project_id=project_id
        )
        run, created = EstimationRun.objects.get_or_create(
            idempotency_key=key,
            defaults={
                "host_run_id": str(uuid.uuid4()),
                "project_id": project_id,
                "document_id": document.source_document_id or document.pk,
                "document_name": document.name,
                "stages": {
                    "parsing": "queued",
                    "extracting": "queued",
                    "grouping": "queued",
                    "estimating": "queued",
                },
                "result": {"estimator_document_id": document.pk},
            },
        )
        return Response(serialize(run), status=202 if created else 200)


class RunDetailView(ServiceView):
    def get(self, request, run_id):
        return Response(serialize(get_object_or_404(EstimationRun, host_run_id=run_id)))


class RunRetryView(ServiceView):
    def post(self, request, run_id):
        run = get_object_or_404(EstimationRun, host_run_id=run_id)
        if run.status != "failed":
            return Response({"detail": "Only failed runs can be retried."}, status=409)
        run.status, run.error = "queued", ""
        run.stages = {
            stage: "queued"
            for stage in ("parsing", "extracting", "grouping", "estimating")
        }
        run.retry_count += 1
        run.save()
        return Response(serialize(run), status=202)


class StoriesReviewView(ServiceView):
    """Persist reviewed estimator output only; never creates TaskFlow tasks."""

    def post(self, request, run_id):
        run = get_object_or_404(EstimationRun, host_run_id=run_id)
        if run.status != "ready_for_review":
            return Response(
                {"detail": "Estimation is not ready for review."}, status=409
            )
        run.result["reviewed_stories"] = request.data.get("stories", [])
        run.save(update_fields=["result", "updated_at"])
        return Response({"accepted": True, "created": False})


class TestCasesView(ServiceView):
    def post(self, request, run_id):
        return Response({"status": "draft_only", "created": False})


def serialize(run):
    return {
        "id": run.host_run_id,
        "project_id": run.project_id,
        "document_id": run.document_id,
        "document_name": run.document_name,
        "status": run.status,
        "stages": run.stages,
        "result": run.result,
        "error": run.error,
        "retry_count": run.retry_count,
    }
