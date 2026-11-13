import { Controls, Description, Primary, Stories, Subtitle, Title } from "@storybook/addon-docs/blocks";

import { ForAITools } from "./ForAITools";

/** Autodocs page with the "For AI tools" block right under the description. */
export function docsPageFor(name: string) {
  return function DocsPage() {
    return (
      <>
        <Title />
        <Subtitle />
        <Description />
        <ForAITools name={name} />
        <Primary />
        <Controls />
        <Stories />
      </>
    );
  };
}
