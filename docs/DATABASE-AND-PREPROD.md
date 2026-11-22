# Taskflow databases and preprod

Taskflow retains React/TypeScript/Vite and Django/DRF. This change hardens that architecture rather than replacing the application framework.

## Choose a data environment

`TASKFLOW_DATA_ENV` accepts `development`, `test` or `preprod`. Django's settings module controls deployment security; the data environment selects data. A preprod data profile is not a replacement for production deployment settings.

| Data environment | Default SQLite database      | Backend port | Frontend command / port                     | Optional PostgreSQL URL                             |
| ---------------- | ---------------------------- | ------------ | ------------------------------------------- | --------------------------------------------------- |
| development      | `backend/db.sqlite3`         | 8000         | `npm run dev` (existing Vite configuration) | `DEVELOPMENT_DATABASE_URL` or legacy `DATABASE_URL` |
| preprod          | `backend/db.preprod.sqlite3` | 8001         | `npm run dev:preprod` / 5175                | `PREPROD_DATABASE_URL`                              |
| test             | `backend/db.test.sqlite3`    | 8002         | `npm run dev:test` / 5176                   | `TEST_DATABASE_URL`                                 |

Test/preprod deliberately do not fall back to the generic `DATABASE_URL`. Their uploaded files and profile pictures also use separate media directories. JWT signing keys are also isolated by data environment; configure PREPROD_SECRET_KEY and TEST_SECRET_KEY for independent secrets. Local profiles have random keys, while the fallback namespaces the existing key so equal user IDs cannot share tokens across environments. The environment badge in the top bar comes from the connected backend, not the frontend's build mode.

On Windows, from the repository root, start the API in one terminal:

```powershell
./backend/run-data.ps1 -Data preprod
```

Start the frontend in a second terminal:

```powershell
Set-Location frontend
npm run dev:preprod
```

Use `-Data test` and `npm run dev:test` for the test data. Copy the corresponding `.env.preprod.example` / `.env.test.example` files to the local filenames described in them when setting up another checkout. The existing development server can continue running separately.

For manual management commands:

```powershell
Set-Location backend
$env:TASKFLOW_DATA_ENV = 'preprod'
./.venv/Scripts/python.exe manage.py migrate
./.venv/Scripts/python.exe manage.py seed_preprod
./.venv/Scripts/python.exe manage.py check_data_integrity
./.venv/Scripts/python.exe manage.py backup_database
```

The seed command refuses development data, uses a transaction, and can be rerun without duplicating its records or resetting existing users' passwords. Initial synthetic account credentials are saved locally in `backend/PREPROD-ACCESS.local.md`, with a separate section for each data environment. This file is ignored by Git. Set `PREPROD_DEMO_PASSWORD` before the initial seed to choose the initial password yourself.

## Data prepared

Preprod was created using SQLite's backup API from the existing development database before schema changes. The original database was also backed up separately. Existing records were preserved. Existing uploaded documents/profile pictures were copied to preprod media storage.

The Advirid Technologies scenario contains five synthetic users, with Punam as organization owner:

| User          | Email                 | Organization / project access                      |
| ------------- | --------------------- | -------------------------------------------------- |
| Punam Ahirrao | punam@advirid.example | Organization owner / project owner                 |
| Aarav Shah    | aarav@advirid.example | Organization administrator / project administrator |
| Meera Iyer    | meera@advirid.example | Organization member / project member               |
| Rohan Patil   | rohan@advirid.example | Organization member / project member               |
| Anika Rao     | anika@advirid.example | Organization member / project viewer               |

Three projects represent development of Taskflow itself: Web Experience, Platform & Identity, and Quality & Delivery. They include 60 work items spanning all nine supported work types, nine boards (including archived boards), 12 historical/current/future sprints, estimates, assignments, priorities, tags, acceptance criteria, comments, history, blockers, escalations, parent/child relationships, dependencies, related tasks, roadmap dates/colors, files, folders, resource links, and personal documents. Releases, goals, milestones and reference templates are linked to work items. Font and colored navigation preferences are populated for each user.

Punam also belongs to **Advirid Sandbox**, which contains an isolated Taskflow experiment project. This demonstrates the two-organization limit and company separation. The test database contains a separately seeded copy of this scenario; it does not contain the original development records.

Billing displays actual organization usage. No payment provider, invoices, paid subscription, external integration, notification delivery, or generated AI result is invented. AI input documents are populated; actual estimation requires the estimator API/worker and its configured provider. Templates currently store reusable briefs/checklists; they do not generate entire projects.

## Schema decisions

| Area                | Structure / change                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity            | A global user identity with case-insensitive email uniqueness and login. Company membership is independent of login tab. Registration validates passwords.                                                                              |
| Organizations       | Projects/documents belong to one organization. Ownership remains on Organization; explicit OrganizationMembership stores admin/member access and the user's default project for that company.                                           |
| Migration safety    | Existing implicit memberships and applicable default projects are copied into the explicit membership table. A reverse migration restores the implicit table.                                                                           |
| Project permissions | Project owner/admin/member/viewer roles remain separate from organization administration. Legacy site administrators retain privileges only within organizations they belong to.                                                        |
| Tasks               | Existing parent hierarchy and directed dependency links remain. Related-task links are symmetric. Self-links, inaccessible/cross-organization links, parent cycles and dependency cycles are rejected. Graph changes are transactional. |
| Retention           | Removing a user clears task authorship rather than deleting their work items. Comments/history retain their existing nullable actor behavior.                                                                                           |
| Audit               | Organization-scoped audit records preserve administrative/task/document changes without storing passwords, tokens, or document bodies. Audit reads require owner/admin access and are paginated.                                        |
| Integrity           | Unique shared workflow keys, date checks, font-size checks and membership-role constraints supplement existing foreign keys. An integrity command checks relationships spanning rows/tables.                                            |
| Query performance   | Composite indexes cover task project/status/rank, assignee/due date, planning organization/kind and audit organization/date. Dashboard counts use aggregate queries.                                                                    |
| AI imports          | An import record makes importing an estimate idempotent; retries do not duplicate tasks. The host validates project access and permissions before importing or retrying.                                                                |

Do not remove task dependency tables when adding related links: their meanings differ. No Workspace or Portfolio layer was reintroduced.

## Frontend conventions

- Shared task APIs live in `frontend/src/features/tasks/api/`, split into task, board, sprint, and activity APIs. The old page-specific import path is a compatibility export.
- RTK Query owns shared task/document reads and dashboard/calendar/planning/audit requests. Keys include identity, organization, project and relevant filters. Render `currentData` when scopes change; do not display the previous scope's data while the next scope loads.
- Keep form/dialog state local, shared client state in Redux, and server records in the query cache. Invalidate affected queries after saves. Logout resets the cache; organization switching recreates the app state before rendering the next company.
- A single refresh operation serves simultaneous expired requests. Temporary refresh failures preserve credentials and show an error; rejected refresh credentials clear the session.
- Routes load their page bundles on demand. Rendering failures have recovery UI and unknown addresses have a 404 page.
- Navigation identities/default icons/routes come from a typed catalog. User-selected icon colors use an allowlisted semantic palette; preferences remain personal and organization-specific.
- Reuse theme variables and semantic controls for new UI. The shared dialog hook traps focus, restores focus and handles Escape. Prefer native dialogs for new standalone dialogs.

## Verification and ongoing recommendations

Run `npm run check`, `npm run build`, and `npm run test-storybook` in frontend. With preprod API/frontend running, run `npm run test:preprod:browser` to exercise 20 pages, save an icon color and switch organizations in both directions. Backend checks run with `python manage.py test accounts projects tasks dashboard tests --noinput`, `makemigrations --check --dry-run`, and `check_data_integrity`. CI includes a PostgreSQL backend job as well as frontend checks.

Before shared production deployment, use PostgreSQL with separate database credentials for each environment, production Django security settings, HTTPS, a secret manager, scheduled backups and a tested restore procedure. SQLite copies are appropriate for local preprod/test; they are not evidence of production concurrency capacity.

Continue consolidating existing styled-components/global CSS toward the shared token/control conventions when those features change. Large boards/backlogs still need deliberate server pagination/windowing and rendering benchmarks; caching alone does not solve data volume. Generate full frontend API contracts once the remaining handwritten API views have complete OpenAPI response schemas. Establish a retention policy for private documents and organization audit records. The estimator currently owns separate tables in the selected local database; a dedicated service database is the next boundary if it is deployed independently. None of these needs a frontend framework rewrite.

## Dependency and source hygiene

Frontend dependencies and lockfile include the available security patches. The Storybook docgen plugin has a scoped glob override to 14.0.2 or later because its declared glob 13 range is affected by [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4); the updated minimatch dependency also resolves [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Remove the override once the upstream plugin adopts a patched range. CI audits high-severity vulnerabilities.

Generated Storybook output and Python bytecode are ignored and removed from Git tracking, while local generated files remain on disk. Prettier configuration and `npm run format` establish consistent formatting for ongoing changes; the new shared API and planning components have been formatted.
