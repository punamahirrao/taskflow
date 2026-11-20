# Backend architecture

The backend keeps its existing Django app labels (`accounts`, `projects`, `tasks`, and `documents`) so deployed databases and historical migrations remain compatible. New code follows domain boundaries inside those packages rather than renaming model-owning apps.

## Domain layout

- `accounts/`: users, authentication, profiles, and account permissions.
- `projects/`: projects, memberships, roles, project repositories, and project services.
- `tasks/`: Agile boards, board workflows, sprints, tasks, repositories, services, and API views.
- `documents/`: project document APIs and storage.
- `dashboard/`: read-only aggregate APIs built from the existing project, sprint, and task domains.
- `common/`: shared API exceptions, pagination, and validators.

Within a domain, `repositories/` contains reusable query logic, `services/` contains transactional business operations, `serializers.py` validates and represents API data, and `views/` adapts HTTP requests and responses. Keep views thin and keep cross-domain read aggregation in dashboard services.

## Configuration and local setup

Copy `.env.example` to `.env`, choose `config.settings.development` for local work or `config.settings.production` for deployments, and set `DATABASE_URL` to a PostgreSQL connection string. Development and tests fall back to SQLite when no database URL is set. Production refuses to start without a secret key, allowed hosts, and PostgreSQL URL.

Install dependencies with `pip install -r requirements.txt`, apply migrations with `python manage.py migrate`, and run the API with `python manage.py runserver`. Run backend tests with `python -m pytest`. Local demo fixtures can be created with `python manage.py seed_data`; the command refuses to run when `DEBUG=False`.

## API documentation

The OpenAPI schema is available at `/api/schema/` and Swagger UI at `/api/docs/`. New dashboard APIs have explicit schemas. Existing legacy `APIView` endpoints are gradually being annotated; drf-spectacular may report missing serializers for those endpoints until they are migrated to declared serializers or `GenericAPIView`.

## Dashboard endpoints

- `GET /api/v1/dashboard/overview/`
- `GET /api/v1/dashboard/active-sprints/`
- `GET /api/v1/dashboard/my-tasks/`
- `GET /api/v1/dashboard/project-health/`

Each endpoint is authenticated and limited to projects visible to the current user. An optional `project_id` query parameter narrows the result.
