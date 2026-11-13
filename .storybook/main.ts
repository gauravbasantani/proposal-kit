import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  // Published at https://gauravbasantani.github.io/proposal-kit/ . Relative asset paths work under that sub-path.
  viteFinal: async (config) => ({ ...config, base: "./" }),
};

export default config;
