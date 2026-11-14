# AI Estimator implementation plan and architecture

## Plan

1. Keep TaskFlow authoritative for users, project membership, document permissions, and task creation; add a narrow authenticated proxy for estimator operations.
2. Add an independently runnable estimator backend with SQLite persistence and a separately runnable worker. For the requested placeholder behavior, the worker emits clearly marked sample macro/micro requirements and Fibonacci point values without sending document content to an external AI provider.
3. Add an independently runnable estimator frontend project and integrate the same UI through a protected TaskFlow route. The host UI calls only the TaskFlow backend.
4. Require explicit confirmation before creating stories; record an idempotency key and provenance. Test cases are explicitly a no-op choice because TaskFlow has no test case model.
5. Document API, environment, local startup, data boundaries, and deployment assumptions.

## Boundaries and flow

The TaskFlow backend authenticates the user and checks project membership and document access. It reads the selected file and submits a service-authenticated request to the estimator backend. The estimator service stores run state and stage output. A worker advances the stages (`queued`, `analyzing`, `macro_requirements`, `micro_requirements`, `estimating`, `ready_for_review`) and persists output. The host frontend polls its own backend proxy. On explicit story confirmation, TaskFlow revalidates access and creates tasks idempotently. No TaskFlow JWT or provider credential reaches the estimator worker or browser.

For this initial placeholder implementation, document format/size are validated, but document bytes are not parsed or transmitted to an AI provider; the worker returns unmistakably sample requirements. This avoids pretending placeholder output is a document-derived estimate. The estimator backend uses a database-backed queue; run `python manage.py process_estimator_runs` as a separate worker. This is appropriate for local development and low-volume deployments; a managed queue should replace polling for higher scale.

## API contract

Host-facing API (JWT authenticated, project/document access checked):

- `GET /api/ai-estimator/v1/projects/{project_id}/documents/` — available documents for the current project member.
- `POST /api/ai-estimator/v1/projects/{project_id}/runs/` — `{document_id, idempotency_key}`; returns a persisted run.
- `GET /api/ai-estimator/v1/runs/{run_id}/` — stages, status, result, and safe failure message.
- `POST /api/ai-estimator/v1/runs/{run_id}/retry/` — retries only a failed run.
- `POST /api/ai-estimator/v1/runs/{run_id}/stories/` — reviewed stories plus idempotency key; creates TaskFlow tasks once.
- `POST /api/ai-estimator/v1/runs/{run_id}/test-cases/` — records that the user chose test cases; returns `draft_only` because no TaskFlow test case destination exists.

Internal estimator API is versioned at `/api/v1/`, authenticated with a shared service bearer secret. It accepts host-verified document metadata and queues runs; no browser calls it directly. Shared secret must be rotated and sent only over TLS in deployed environments. The host is the only component allowed to read TaskFlow's document files.

## Local development and operations

- TaskFlow host: existing `backend/.venv/Scripts/python.exe manage.py runserver` and `frontend` Vite workflow.
- Estimator backend: `cd ai-estimator-backend`, install `requirements.txt`, copy `.env.example` to `.env`, run migrations, then start the API and worker as separate processes.
- Standalone estimator UI: `cd ai-estimator-frontend`, `npm install`, set `VITE_TASKFLOW_API_URL`, then `npm run dev`. For embedded use, the host route renders the shared feature module and JWT remains in TaskFlow's existing API client.
- Configure `AI_ESTIMATOR_SERVICE_URL` and `AI_ESTIMATOR_SERVICE_TOKEN` in the host environment; configure `HOST_SERVICE_TOKEN`, database path, upload limit, and point scale in estimator environment. No secrets are committed.
- Estimator runs/results are retained until explicitly removed by operational database retention policy. Host documents remain in the existing document store. The worker logs run IDs/stage names only, never document contents.

## Limitations in this placeholder release

The requested fake sample output is intentionally not an AI estimate and is labeled accordingly. PDF/DOCX/TXT parsing, provider integration, cancellation, and durable production queueing are future work. Test cases can be reviewed as a choice but are not created or persisted because TaskFlow has no test-case model.
