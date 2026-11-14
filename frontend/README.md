# React + TypeScript + Vite

## Source layout

`src/` is organised per page. Each page has its own folder (`ai-estimator`, `backlog`, `boards`, `calendar`,
`dashboard`, `documents`, `login`, `portfolio`, `profile`, `project-detail`, `projects`, `register`, `reports`,
`settings`, `share-project`, `sprint-train`, `team`, `users`) and a `common` folder holds everything shared by
more than one page or by the app shell (`App.tsx`, `main.tsx`).

```text
src/
  App.tsx, main.tsx
  <page>/
    <Name>Page.tsx        page component
    <page>.css            the page's one style sheet
    api/ assets/ components/ entities/ features/ icons/ sections/ shared/ store/
  common/
    common.css            the shared style sheet (Tailwind import + theme styles)
    api/ assets/ components/ entities/ features/ icons/ sections/ shared/ store/
```

- A file lives in a page folder only if that page is its sole consumer; anything used by two or more pages
  (or by `App.tsx`) lives in `common/`.
- Object types are declared as `interface`s. Domain/data shapes live in `entities/`; component props interfaces
  sit next to their component.

## Labels

All UI text is kept in one place: `src/common/shared/i18n/labels/`, one file per page (`dashboard.ts`,
`sprint-train.ts`, ...) plus `common.ts` for shared text. Each file declares flat `"<prefix>.<name>"` keys with
`defineLabels({ ...english }, { ...optional swedish })`; Swedish falls back to English when a key is missing.
Use a label in code instead of a literal string:

```tsx
const { t } = useTranslation();           // src/common/shared/i18n/hooks/useTranslation
<h2>{t("settings.title")}</h2>
t("projects.taskCount", { count: 3 });    // "{count}" placeholders are filled from the params
```

Outside React (api, hooks, utils) use `translate(key, params)` from `src/common/shared/i18n/translate`.

## Workspace navigation

Authenticated pages share a sidebar with Dashboard (`/dashboard`), Projects
(`/projects`), My Profile, and an expandable Administration section. Projects
opens the project listing, where users can create projects or open their task
boards. The Projects item stays highlighted on project-detail pages.

My Profile and the Administration submenu items (Users and Settings) are disabled
until their destination pages are implemented.

The Dashboard shows live workspace totals: projects, completed tasks, pending
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
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
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
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
