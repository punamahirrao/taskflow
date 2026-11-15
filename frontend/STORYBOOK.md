# Storybook

Storybook is the component workshop and isolated UI test environment for the frontend.

## Commands

- `npm run storybook` starts the local workshop on port 6006.
- `npm run build-storybook` creates a static build in `storybook-static`.
- `npm run test-storybook` runs story render and play-function tests in headless Chromium.
- `npm run chromatic` uploads a build for visual review. Set `CHROMATIC_PROJECT_TOKEN` in the environment or CI secrets first.

## Story conventions

- Keep component stories next to the component as `[Component].stories.tsx`.
- Use titles such as `Boards/Components/BoardCard`, `Boards/Features/CreateBoard`, `Boards/Sections/BoardListSection`, and `Boards/Pages/BoardsPage`.
- Add the `autodocs` tag to component, feature, section, and page stories. Document purpose, important props, variants, usage context, and accessibility behavior in the component description.
- Cover the normal state plus useful edge states such as empty, loading, errors, long content, and dark theme. Add `play` interactions for user-facing controls.
- Keep realistic fixtures under `src/mocks/{boards,projects,sprints,tasks,users}` and network handlers under `src/mocks/handlers`.
- Use MSW for page or feature API requests. Stories must not depend on a running backend.
- Global decorators provide Redux, React Router, app and styled-components themes, language, project context, toast notifications, feature flags, and MSW handlers.
- Select Light, Professional, or Dark from the Storybook toolbar. Chromatic can capture visual snapshots after a project token is configured.

The accessibility addon is available in the Storybook toolbar for audits. Automatic axe assertions are currently switched off globally because existing application screens have baseline contrast and landmark findings; enable `parameters.a11y.test: "error"` on stories as those findings are resolved.

## Current coverage

Stories cover the Dashboard, Boards directory, Backlog, Calendar, board cards and filters, board creation, dashboard summaries and sections, backlog metrics and controls, and agile work item cards. Add a colocated story for each new reusable component or feature as it is introduced.
