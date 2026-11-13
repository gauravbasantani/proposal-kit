import type { Meta, StoryObj } from "@storybook/react-vite";

import { docsPageFor } from "../../.storybook/DocsPage";
import { SavingsEstimate } from "./SavingsEstimate";

const meta = {
  title: "Kit/SavingsEstimate",
  component: SavingsEstimate,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: docsPageFor("SavingsEstimate"),
      description: {
        component:
          "Estimated bill savings. The figure is computed from the assumptions, it always says Estimated, and the assumptions are always printed under it.",
      },
    },
  },
  args: { assumptions: { annualKwh: 13_860, ratePerKwhCents: 16, yearlyIncreasePct: 3, years: 25 } },
} satisfies Meta<typeof SavingsEstimate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongNumbers: Story = {
  args: { assumptions: { annualKwh: 1_250_000, ratePerKwhCents: 21.5, yearlyIncreasePct: 4.25, years: 30 } },
};
export const Zero: Story = { args: { assumptions: { annualKwh: 0, ratePerKwhCents: 16, yearlyIncreasePct: 3, years: 25 } } };
/** No label: the heading is "Estimated bill savings over 25 years". */
export const MissingOptionalData: Story = {};
/** A custom label that does not start with "Estimated" gets it added. */
export const CustomLabel: Story = { args: { label: "Savings over 25 years" } };
export const DarkMode: Story = { parameters: { theme: "dark" } };
export const Narrow360: Story = { parameters: { narrow: true } };
