import type { Preview } from "@storybook/react-vite";
import type { ThemeName } from "../src/common/entities/theme";
import { handlers } from "../src/mocks/handlers";
import { mswLoader } from "msw-storybook-addon/csf3";
import { setupWorker } from "msw/browser";
import "../src/common/common.css";
import { StoryEnvironment } from "./StoryEnvironment";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Application theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "original", title: "Light" },
          { value: "professional", title: "Professional" },
          { value: "night", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "original" },
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker(...Object.values(handlers).flat());
      const origin = window.location.origin;
      const apiOrigin = new URL(
        import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
        origin,
      ).origin;
      await worker.start({
        quiet: true,
        onUnhandledRequest(request, print) {
          const url = new URL(request.url);
          if (
            url.origin === apiOrigin &&
            (apiOrigin !== origin ||
              /^\/(accounts|dashboard|documents|projects|tasks)\//.test(url.pathname))
          ) {
            print.error();
          }
        },
      });
      return worker;
    }),
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true, sort: "requiredFirst" },
    a11y: { test: "error" },
    docs: { toc: true },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme ?? "original") as ThemeName;
      return (
        <StoryEnvironment
          key={context.id + theme}
          theme={theme}
          route={context.parameters.route ?? "/"}
          anonymous={context.parameters.anonymous === true}
        >
          <Story />
        </StoryEnvironment>
      );
    },
  ],
};
export default preview;
