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

## Organizations

Registration requires `organization_name` (1–100 non-whitespace characters) and creates the user's first organization atomically. Accounts can belong to at most two organizations. Organization creation locks the user row before checking this limit. Users added through the users API join the actor's current organization. Social signups complete organization creation before accessing the organization.

- `GET /accounts/organizations/`: current user's organizations, project counts, active organization ID, and limit.
- `POST /accounts/organizations/` with `{ "name": "Company name" }`: create an empty organization.
- `POST /accounts/organizations/<id>/switch/`: persist the current organization, after checking membership.

These routes also exist under `/api/v1/accounts/`. Authenticated frontend requests include `X-Organization-ID`; authentication verifies membership and uses that organization for the request. This keeps separate tabs and pending requests scoped to the organization in which they originated. Requests without the header use the persisted active organization. Switching reloads the frontend and clears the selected project and in-memory stores.

Projects belong to one organization. `visible_projects` and `get_role` enforce the organization boundary before checking project roles, including for site administrators. Project directories and user administration are organization-scoped. Documents, folders and resource links also have an organization, including personal files. Shared account profiles stay attached to the same login; removing a shared user from one organization preserves their account and memberships in the other organization.

The organization migrations preserve existing users, projects and documents in a single **Existing organization**, retaining current project memberships. Newly created organizations contain no copied projects or documents. Apply all migrations before starting the updated application.

Organization API coverage is in `accounts/test_organizations.py`. Run the end-to-end browser check with `npm run test:organizations:browser` from `frontend` against a disposable development database and running frontend/API servers (defaults: ports 5174 and 8000).

## Menu preferences

`GET` and `PUT /accounts/me/navigation/` (also under `/api/v1/accounts/`) read and replace the current user's left-menu overrides in the active organization. The payload is `{ "items": { "settings": { "label": "Preferences", "icon": "star" } } }`. An empty `items` object restores the defaults. Names are limited to 60 characters; menu identifiers and icons are validated against the supported catalog. Routes cannot be changed through preferences.

`NavigationPreference` has one record per user and organization. Members can customize their own menu; preferences never affect other users or organizations. The frontend catalog defines the original names, icons, order and destinations. Configure Taskflow is available under Settings → Administration, alongside Users, Billing & Subscription and Audit Logs. Existing billing and audit settings URLs redirect to their new Administration locations.

Run `python -m pytest accounts/test_navigation.py` for API isolation and validation checks, and `npm run test:navigation:browser` from `frontend` for browser coverage against a disposable development database.

## Font preferences

`GET` and `PUT /accounts/me/typography/` (also under `/api/v1/accounts/`) read and replace the current user's font preferences in the active organization. The payload is `{ "font_family": "Consolas", "font_size": 20 }`. An empty family uses the existing default font stack (Segoe UI, Arial, sans-serif); the default base size is 16 px. The API accepts integer base sizes from 12 to 24 px and font names up to 100 characters. `TypographyPreference` is unique per user and organization.

Settings → Administration → Font & Size offers a draft preview, Apply, and Reset. Font availability is checked on the user's device. The installed-font button uses the browser's permission-gated Local Font Access API; detected local font names and manual entry remain available when listing is unsupported or denied. No font files or complete font lists are uploaded. Only the selected family and base size are saved.

The authenticated typography provider applies the selected family and base size throughout the app, including dialogs. Root text sizes and `--taskflow-font-scale` keep rem-based and fixed-pixel typography in proportion. Defaults retain the original sizes; signing out clears applied preferences from the document. API tests are in `accounts/test_typography.py`; run `npm run test:typography:browser` against a disposable database for installed-font, fallback, preview, apply, reset, isolation, and layout checks.

## Organization/data hardening

Organization membership is now explicit: `OrganizationMembership` stores organization roles and per-company default projects. Global user identity is separate from organization and project roles. Tasks support directed dependencies and symmetric related-task links. Author deletion preserves tasks. See [schema decisions, data profiles and preprod](../docs/DATABASE-AND-PREPROD.md) for migrations, backups, sample accounts, integrity checks and production recommendations.
