# React + TypeScript + Vite

## Source layout

Keep the page entry point at the root of its feature. Group implementation files by
their role and create subfolders when the feature needs them.

```text
src/
  register/
    RegisterPage.tsx        Page composition
    api/                    Registration request
    components/             Registration form and fields
    entities/               Registration data types
    features/auth/hooks/    Validation, submission, and feedback
  features/tasks/           Work-item APIs, components, types, and hooks used across pages
  common/
    api/                    Request client and shared RTK Query configuration
    components/styled/      Reusable styled page and UI primitives
    sections/auth/          Shared sign-in and registration UI
    store/                  Redux store factory, session lifecycle, and typed hooks
    App.styles.ts           Theme tokens and global styles
    common.css              Tailwind entry point and theme mappings
```

Use colocated `*.styles.ts` files for feature styling and the shared styled
primitives for recurring layouts and controls. Use Tailwind utilities for simple
one-off spacing and alignment. Keep SVGs and other static files in `assets/`, and
icon registries or custom icon components in `icons/` where a feature uses them.

Feature-owned APIs use `queryApi.injectEndpoints` so server responses share a
single Redux cache. Key user and organization queries by their scope. Use slices
for shared client state such as the session, theme, notifications, and project
selection. Keep sensitive form inputs and temporary UI state inside their feature
components. The production app and Storybook use the same store factory.

## Labels

All UI text is kept in one place: `src/common/shared/i18n/labels/`, one file per page (`dashboard.ts`,
`sprint-train.ts`, ...) plus `common.ts` for shared text. Each file declares flat `"<prefix>.<name>"` keys with
`defineLabels({ ...english }, { ...optional swedish })`; Swedish falls back to English when a key is missing.
Use a label in code instead of a literal string:

```tsx
const { t } = useTranslation(); // src/common/shared/i18n/hooks/useTranslation
<h2>{t("settings.title")}</h2>;
t("projects.taskCount", { count: 3 }); // "{count}" placeholders are filled from the params
```

Outside React (api, hooks, utils) use `translate(key, params)` from `src/common/shared/i18n/translate`.

## Organization navigation

Authenticated pages share an organization and project selector. Organization
Settings manages the two organizations an account can belong to. Switching
organizations clears the selected project and reloads the application; projects,
boards, tasks, and documents are scoped to the active organization.

The sidebar links to Dashboard, My Work, Projects, Backlog, Boards, planning,
documents, reports, and Settings. User accounts are available under
Settings → Administration → Users. My Work lives in `src/my-work`; shared
organization section pages live in `src/common/components`.

Administration also contains Billing & Subscription, Audit Logs, and Configure
Taskflow (`/settings/administration/configure-taskflow`). Configure Taskflow lists
all 20 left-menu items with their original names/icons and editable fields.
Expand a row to pick an icon, save to update the sidebar, or reset to restore
the defaults. Preferences are saved per account and organization. The shared
navigation catalog and provider live in `src/common/features/navigation`.

Settings → Administration → Font & Size selects a local installed font and a
12–24 px base text size, with a draft preview and Apply/Reset controls. The
defaults are Segoe UI and 16 px. Use Load installed fonts to request the browser's
local-font listing permission; detected font names and manual entry are also
supported. Preferences are saved per user and organization. No web fonts are
downloaded. Typography helpers and the authenticated provider live in
`src/common/features/typography`.

Typography uses the root size for rem-based text and
`calc(<size>px * var(--taskflow-font-scale, 1))` for fixed-pixel CSS. Arbitrary
Tailwind pixel text utilities use the same scale variable. Keep new font sizes
compatible with these controls.

The Dashboard shows live organization totals: projects, completed tasks, pending
tasks (to do and in progress), and task completion rate. The completion rate is
the rounded percentage of tasks marked done, or 0% when there are no tasks.
Statistics use the existing project and per-project task endpoints; monthly
trends and team productivity are not tracked. Failed requests show an error and
a retry action instead of misleading zero totals.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## Maintainability and data profiles

See [database/preprod setup and architecture decisions](../docs/DATABASE-AND-PREPROD.md). Run `npm run check` and `npm run build` before submitting changes. Preprod runs with `npm run dev:preprod`; test data uses `npm run dev:test`. Both connect to separate local APIs.
