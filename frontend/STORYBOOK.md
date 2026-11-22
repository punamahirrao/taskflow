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
- Keep related fixture data under `src/mocks` and match the backend response shapes in `src/mocks/handlers`.
- Use MSW for page or feature API requests. The preview starts with shared handlers and blocks unhandled requests to the Taskflow API.
- The shared story environment creates a fresh Redux store and provides routing, themes, language, project context, notifications, feature flags, and MSW. Set the story route with `parameters.route` and use `parameters.anonymous` for signed-out stories.
- Select Light, Professional, or Dark from the Storybook toolbar. Chromatic can capture visual snapshots after a project token is configured.

The accessibility addon is available in the Storybook toolbar. Automatic axe assertions are enabled globally with `parameters.a11y.test: "error"`; contrast and accessible-label failures fail the component test run. Keep these checks enabled when adding stories.

## Current coverage

Stories cover Dashboard, Boards, Backlog, Calendar, registration, My Work,
organization settings, Releases, and Roadmap. The sample organization shares
consistent members, projects, tasks, and release approvals. The registration,
organization filtering, and release stories also exercise user interactions.
