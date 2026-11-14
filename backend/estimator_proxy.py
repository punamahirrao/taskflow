import json
import mimetypes
import os
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from documents.models import Document
from projects.access import WRITE_TASK_ROLES, get_role, visible_projects


def service(path, method="GET", data=None):
    if not settings.AI_ESTIMATOR_SERVICE_TOKEN:
        return {"detail": "AI Estimator service token is not configured. Set AI_ESTIMATOR_SERVICE_TOKEN in backend/.env and restart the TaskFlow backend."}, 503
    request = Request(settings.AI_ESTIMATOR_SERVICE_URL.rstrip("/") + "/api/v1/" + path.lstrip("/"), data=json.dumps(data).encode() if data is not None else None, method=method, headers={"Authorization": f"Bearer {settings.AI_ESTIMATOR_SERVICE_TOKEN}", "Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=8) as response:
            return json.loads(response.read() or b"{}"), response.status
    except HTTPError as exc:
        return json.loads(exc.read() or b"{}"), exc.code
    except (URLError, TimeoutError) as exc:
        raise RuntimeError("AI estimator service is unavailable. Start its API and worker.") from exc


def upload_to_estimator(path, fields, filename, content, content_type):
    if not settings.AI_ESTIMATOR_SERVICE_TOKEN:
        return {"detail": "AI Estimator service token is not configured. Set AI_ESTIMATOR_SERVICE_TOKEN in backend/.env and restart the TaskFlow backend."}, 503
    boundary = "----TaskFlowEstimator" + uuid.uuid4().hex
    parts = []
    for key, value in fields.items():
        parts.extend((f"--{boundary}\r\n".encode(), f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode(), str(value).encode(), b"\r\n"))
    safe_name = os.path.basename(filename).replace('"', "").replace("\r", "").replace("\n", "")
    parts.extend((f"--{boundary}\r\n".encode(), f'Content-Disposition: form-data; name="file"; filename="{safe_name}"\r\n'.encode(), f"Content-Type: {content_type or 'application/octet-stream'}\r\n\r\n".encode(), content, b"\r\n", f"--{boundary}--\r\n".encode()))
    request = Request(
        settings.AI_ESTIMATOR_SERVICE_URL.rstrip("/") + "/api/v1/" + path.lstrip("/"),
        data=b"".join(parts), method="POST",
        headers={"Authorization": f"Bearer {settings.AI_ESTIMATOR_SERVICE_TOKEN}", "Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urlopen(request, timeout=30) as response:
            return json.loads(response.read() or b"{}"), response.status
    except HTTPError as exc:
        return json.loads(exc.read() or b"{}"), exc.code
    except (URLError, TimeoutError) as exc:
        raise RuntimeError("AI estimator service is unavailable. Start its API and worker.") from exc


class EstimatorDocuments(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if not get_role(request.user, project): return JsonResponse({"detail":"Project access denied."}, status=403)
        docs = Document.objects.filter(project=project).order_by("name")
        return JsonResponse([{"id":d.id,"name":d.name,"size":d.size,"content_type":d.content_type} for d in docs], safe=False)


class EstimatorRuns(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in WRITE_TASK_ROLES: return JsonResponse({"detail":"You cannot estimate in this project."}, status=403)
        document = get_object_or_404(Document, id=request.data.get("document_id"), project=project)
        with document.file.open("rb") as source:
            document_bytes = source.read()
        uploaded, upload_code = upload_to_estimator(
            "documents/",
            {"project_id": project.id, "source_document_id": document.id},
            document.name,
            document_bytes,
            mimetypes.guess_type(document.name)[0] or "application/octet-stream",
        )
        if upload_code >= 400:
            return JsonResponse(uploaded, status=upload_code)
        data, code = service("runs/", "POST", {"project_id":project.id,"estimator_document_id":uploaded["id"],"idempotency_key":request.data.get("idempotency_key") or str(uuid.uuid4())})
        if code >= 400: return JsonResponse(data, status=code)
        data["project_id"] = project.id
        return JsonResponse(data, status=code)


class EstimatorRunDetail(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, run_id):
        data, code = service(f"runs/{run_id}/")
        if code >= 400: return JsonResponse(data, status=code)
        project = get_object_or_404(visible_projects(request.user), id=data["project_id"])
        if not get_role(request.user, project): return JsonResponse({"detail":"Project access denied."}, status=403)
        return JsonResponse(data)
    def post(self, request, run_id):
        data, code = service(f"runs/{run_id}/retry/", "POST", {})
        return JsonResponse(data, status=code)


class EstimatorCreateStories(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, run_id):
        # Deliberately disabled: project task creation remains mocked in the UI.
        return JsonResponse({"created": False, "message": "Task creation is not enabled for AI estimates yet."}, status=200)


class EstimatorTestCases(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, run_id):
        _, code = service(f"runs/{run_id}/test-cases/", "POST", {})
        return JsonResponse({"created":False,"message":"Test cases are not supported by the TaskFlow data model."}, status=code)
