# Frontend verification

- `npm run check`: lint, TypeScript, API/cache unit tests and roadmap tests.
- `npm run build`: production compilation and route bundles.
- `npm run test-storybook`: component stories and interaction tests in Chromium, with MSW.
- `npm run test:preprod:browser`: real preprod smoke checks; requires API 8001 and frontend 5175 plus seeded synthetic accounts.

Unit regression coverage includes concurrent token refresh, temporary session failures, rejected credentials, field validation, stale document responses and identity/organization cache separation. The roadmap suite covers scheduling, dependencies, cycles, date boundaries, progress and drag behavior.

See [database and preprod setup](../../../docs/DATABASE-AND-PREPROD.md). Existing focused organization, navigation, typography and roadmap browser scripts remain available in package.json. Use disposable/local databases for browser tests that create records.
