import type { Decorator, Preview } from "@storybook/react-vite";

import "../src/styles/index.css";

/** Light or dark. A story can force a theme with parameters.theme; otherwise the toolbar decides. */
const withTheme: Decorator = (Story, context) => {
  const theme: "light" | "dark" = context.parameters.theme ?? context.globals.theme ?? "light";
  if (context.viewMode === "story") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
  return (
    <div className={theme === "dark" ? "dark" : undefined}>
      <div className="bg-background p-4 text-foreground">
        <Story />
      </div>
    </div>
  );
};

/** parameters.narrow = true renders the story in a 360px-wide column (max-w-90 is 90 x 0.25rem). */
const withNarrow: Decorator = (Story, context) =>
  context.parameters.narrow ? (
    <div className="w-full max-w-90">
      <Story />
    </div>
  ) : (
    <Story />
  );

const preview: Preview = {
  decorators: [withNarrow, withTheme],
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: { test: "error" },
  },
};

export default preview;
