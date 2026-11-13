// Made-up company, homeowner and numbers. Not a real quote.
import { monthlyPaymentCents } from "@/lib/loan";
import type { SavingsAssumptions } from "@/components/SavingsEstimate";

export type LineItem = { label: string; cents: number };

export type Proposal = {
  id: string;
  installer: string;
  preparedOn: string;
  status: "Draft" | "Ready to sign";
  homeowner: { name: string; address: string };
  system: { panels: number; panelWatts: number; inverter: string };
  lineItems: LineItem[];
  downPaymentCents: number;
  loan: { apr: number; termMonths: number; lender?: string };
  savings: SavingsAssumptions;
};

export const sampleProposal: Proposal = {
  id: "P-1042",
  installer: "Sunmeadow Energy (made-up)",
  preparedOn: "November 12, 2026",
  status: "Ready to sign",
  homeowner: { name: "Dana Whitfield", address: "418 Cedar Hollow Road, Fairview" },
  system: { panels: 21, panelWatts: 400, inverter: "One microinverter per panel" },
  lineItems: [
    { label: "Panels and inverters", cents: 1_560_000 },
    { label: "Installation", cents: 730_000 },
    { label: "Permits and inspection", cents: 200_000 },
  ],
  downPaymentCents: 0,
  loan: { apr: 5.99, termMonths: 300, lender: "Made-up Credit Union solar loan" },
  savings: { annualKwh: 13_860, ratePerKwhCents: 16, yearlyIncreasePct: 3, years: 25 },
};

export function totals(p: Proposal) {
  const priceCents = p.lineItems.reduce((sum, item) => sum + item.cents, 0);
  const financedCents = priceCents - p.downPaymentCents;
  const monthlyCents = monthlyPaymentCents(financedCents, p.loan.apr, p.loan.termMonths);
  const systemKw = (p.system.panels * p.system.panelWatts) / 1000;
  return {
    priceCents,
    financedCents,
    monthlyCents,
    totalOfPaymentsCents: monthlyCents * p.loan.termMonths,
    systemKw,
  };
}
