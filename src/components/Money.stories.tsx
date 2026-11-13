import type { Meta, StoryObj } from "@storybook/react-vite";

import { docsPageFor } from "../../.storybook/DocsPage";
import { Money } from "./Money";

const meta = {
  title: "Kit/Money",
  component: Money,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: docsPageFor("Money"),
      description: { component: "Cents in, formatted currency out. The only place in the kit that formats money." },
    },
  },
  render: (args) => (
    <p className="text-2xl font-semibold">
      <Money {...args} />
    </p>
  ),
} satisfies Meta<typeof Money>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { cents: 16_028 } };
export const LongNumbers: Story = { args: { cents: 123_456_789_012 } };
export const Zero: Story = { args: { cents: 0 } };
/** No precision given: whole dollars drop the .00. */
export const MissingOptionalData: Story = { args: { cents: 2_490_000 } };
export const AlwaysCents: Story = { args: { cents: 2_490_000, precision: "cents" } };
export const RoundedForEstimates: Story = { args: { cents: 221_760, precision: "dollars" } };
export const DarkMode: Story = { args: { cents: 2_490_000 }, parameters: { theme: "dark" } };
export const Narrow360: Story = { args: { cents: 123_456_789_012 }, parameters: { narrow: true } };
