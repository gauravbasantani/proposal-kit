import type { Meta, StoryObj } from "@storybook/react-vite";

import { docsPageFor } from "../../.storybook/DocsPage";
import { PaymentLine } from "./PaymentLine";

const meta = {
  title: "Kit/PaymentLine",
  component: PaymentLine,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: docsPageFor("PaymentLine"),
      description: {
        component: "A monthly payment that always carries its APR and term. apr and termMonths are required, so TypeScript refuses a payment without them.",
      },
    },
  },
  args: { monthlyCents: 16_028, apr: 5.99, termMonths: 300, lender: "Made-up Credit Union solar loan" },
} satisfies Meta<typeof PaymentLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongNumbers: Story = {
  args: {
    monthlyCents: 1_234_567,
    apr: 12.875,
    termMonths: 360,
    lender: "Made-up Regional Cooperative Credit Union, home energy improvement loan program",
  },
};
/** 0% APR: the payment is the price divided by the term ($24,900 / 300 = $83). */
export const Zero: Story = { args: { monthlyCents: 8_300, apr: 0, termMonths: 300 } };
/** No label and no lender: the heading falls back to "Monthly payment". */
export const MissingOptionalData: Story = { args: { lender: undefined, label: undefined } };
export const OddTerm: Story = { args: { monthlyCents: 141_312, apr: 4.5, termMonths: 18, lender: undefined } };
export const DarkMode: Story = { parameters: { theme: "dark" } };
export const Narrow360: Story = { args: { lender: "Made-up Regional Cooperative Credit Union solar loan" }, parameters: { narrow: true } };
