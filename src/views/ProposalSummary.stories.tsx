import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleProposal } from "@/data/sample-proposal";
import { ProposalSummary } from "./ProposalSummary";

const meta = {
  title: "Reference/ProposalSummary",
  component: ProposalSummary,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The reference view: a homeowner's solar proposal summary built only from Money, PaymentLine, SavingsEstimate and Card, Badge, Button, Separator. Made-up data.",
      },
    },
  },
} satisfies Meta<typeof ProposalSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongNumbers: Story = {
  args: {
    proposal: {
      ...sampleProposal,
      id: "P-1042-REVISION-0003",
      homeowner: { name: "Dana Whitfield-Montgomery Ravenscroft", address: "41850 Old Cedar Hollow Ridge Road, Unit 1207, Fairview Heights" },
      system: { panels: 2_480, panelWatts: 450, inverter: "String inverters with optimizers on every panel and three-phase service" },
      lineItems: [
        { label: "Panels and inverters", cents: 98_765_400 },
        { label: "Installation", cents: 34_567_800 },
        { label: "Permits, inspection and utility interconnection", cents: 1_234_500 },
      ],
      downPaymentCents: 12_345_600,
      loan: { apr: 12.875, termMonths: 360, lender: "Made-up Regional Cooperative Credit Union commercial solar program" },
      savings: { annualKwh: 1_450_000, ratePerKwhCents: 21.5, yearlyIncreasePct: 4.25, years: 30 },
    },
  },
};
export const Zero: Story = {
  args: { proposal: { ...sampleProposal, loan: { apr: 0, termMonths: 300, lender: "Made-up 0% APR promotion" } } },
};
export const MissingOptionalData: Story = {
  args: { proposal: { ...sampleProposal, status: "Draft", loan: { apr: 5.99, termMonths: 300 } } },
};
export const DarkMode: Story = { parameters: { theme: "dark" } };
export const Narrow360: Story = { parameters: { narrow: true } };
