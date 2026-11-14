# TaskFlow AI Estimator service

This is a separately runnable Django project for estimation data and processing. It shares the TaskFlow SQLite database file, but owns its `runs_estimationrun`, `runs_estimatordocument`, and `runs_extractedrequirement` tables. It does not import or create TaskFlow tasks.

## Implemented pipeline

```text
TaskFlow project document
  → estimator-owned document copy
  → PDF / DOCX / TXT / Markdown text extraction
  → paragraph-aware text chunking
  → GPT-4o requirement extraction (functional and non-functional)
  → GPT-4o macro story grouping
  → GPT-4o Fibonacci story-point assignment
  → persisted result and total estimate for review
```

The final TaskFlow backlog/sprint insertion step is intentionally not implemented. The current UI's “create in project” controls remain mock-only.

## Configure

In this directory, create `.env` from `.env.example`. Set `OPENAI_API_KEY` to your key. Set `HOST_SERVICE_TOKEN` to a long random value and set `AI_ESTIMATOR_SERVICE_TOKEN` to the **same value** in `../backend/.env`. The sample token is only a placeholder and must be replaced before starting either service.

`TASKFLOW_DB_PATH` defaults to `../backend/db.sqlite3`, resolved relative to this project. `ESTIMATOR_DOCUMENTS_ROOT` defaults to `./uploads` in this project. You can override both in `.env`.

## Install and migrate

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

If `.env` already exists, keep it and edit the values instead of copying over it. Copy the same `HOST_SERVICE_TOKEN` value into `backend/.env` as `AI_ESTIMATOR_SERVICE_TOKEN`. The local workspace `.env` files are ignored by Git. Apply the estimator-owned tables to the shared database:

```powershell
python manage.py migrate
```

## Start API and worker

Run both commands from this directory in separate terminals:

```powershell
python manage.py runserver 127.0.0.1:8100
```

```powershell
python manage.py process_estimator_runs
```

The TaskFlow backend remains the public API gateway. It authenticates the user, checks access to the project/document, and forwards the document to this service using the service token. The estimator API rejects calls without that token.

## Provider and document notes

- Model defaults to `gpt-4o`; override with `OPENAI_MODEL` if needed.
- Requirement extraction is chunked at paragraph boundaries for large text documents.
- Story estimates are restricted to `STORY_POINT_SCALE` (default `1,2,3,5,8,13`).
- Scanned PDFs without a text layer need OCR; OCR is not included yet.
- Legacy binary `.doc` files are not supported; use `.docx`, PDF, TXT, or Markdown.
- OpenAI API usage incurs provider charges. No API key is included in this repository.
