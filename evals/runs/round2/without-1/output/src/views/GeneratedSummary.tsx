import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Money } from "@/components/Money";
import { PaymentLine, formatApr, formatTerm } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { monthlyPaymentCents } from "@/lib/loan";

/* ------------------------------------------------------------------ */
/* Proposal data. All money is in whole cents.                         */
/* ------------------------------------------------------------------ */

const proposal = {
  id: "P-2077",
  preparedOn: "2026-11-12",
  status: "Ready to sign",
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  installer: "Brightline Home Solar",
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
    annualKwh: 11_900,
  },
  price: [
    { label: "Panels and inverters", cents: 1_395_000 },
    { label: "Installation", cents: 645_000 },
    { label: "Permits and inspection", cents: 160_000 },
  ],
  downPaymentCents: 200_000,
  loan: { apr: 6.49, termMonths: 240 },
  savings: { ratePerKwhCents: 15, yearlyIncreasePct: 3, years: 25 },
} as const;

/* Everything below is derived from the data above, so the figures can't drift apart. */

const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalPriceCents = proposal.price.reduce((sum, line) => sum + line.cents, 0);
const financedCents = totalPriceCents - proposal.downPaymentCents;
const monthlyCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths);
const totalOfPaymentsCents = monthlyCents * proposal.loan.termMonths;
const financeChargeCents = totalOfPaymentsCents - financedCents;
const totalPaidCents = proposal.downPaymentCents + totalOfPaymentsCents;

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ...proposal.savings,
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
const preparedOnText = dateFormat.format(new Date(`${proposal.preparedOn}T00:00:00Z`));

/* ------------------------------------------------------------------ */

function Row({
  label,
  children,
  strong = false,
  divider = false,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
  /** Draws a rule above the row, e.g. before a total. */
  divider?: boolean;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-1.5", divider && "mt-2 border-t pt-3")}>
      <dt className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <header className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Proposal {proposal.id} · Prepared {preparedOnText}
            </p>
            <Badge variant="success">
              <Check aria-hidden="true" />
              {proposal.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold leading-tight">Solar proposal for {proposal.homeowner.name}</h1>
          <p className="text-muted-foreground">
            {proposal.homeowner.address} · Prepared by {proposal.installer}
          </p>
        </header>

        {/* Headline figures */}
        <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent>
              <PaymentLine
                monthlyCents={monthlyCents}
                apr={proposal.loan.apr}
                termMonths={proposal.loan.termMonths}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                After a <Money cents={proposal.downPaymentCents} /> down payment.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <SavingsEstimate assumptions={savingsAssumptions} />
            </CardContent>
          </Card>
        </section>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>Your system</h2>
            </CardTitle>
            <CardDescription>{numberFormat.format(systemKw)} kW rooftop solar</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              <Row label="Panels">
                {proposal.system.panelCount} × {proposal.system.panelWatts} W
              </Row>
              <Row label="System size">{numberFormat.format(systemKw)} kW</Row>
              <Row label="Inverters">{proposal.system.inverter}</Row>
              <Row label="Estimated production">{numberFormat.format(proposal.system.annualKwh)} kWh a year</Row>
            </dl>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>Price</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              {proposal.price.map((line) => (
                <Row key={line.label} label={line.label}>
                  <Money cents={line.cents} />
                </Row>
              ))}
              <Row label="Total system price" strong divider>
                <Money cents={totalPriceCents} />
              </Row>
              <Row label="Down payment">
                <Money cents={proposal.downPaymentCents} />
              </Row>
              <Row label="Amount financed" strong>
                <Money cents={financedCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        {/* Loan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>Loan terms</h2>
            </CardTitle>
            <CardDescription>
              {formatApr(proposal.loan.apr)} · {formatTerm(proposal.loan.termMonths)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              <Row label="Amount financed">
                <Money cents={financedCents} />
              </Row>
              <Row label="Monthly payment">
                <Money cents={monthlyCents} />
              </Row>
              <Row label={`Total of ${proposal.loan.termMonths} payments`}>
                <Money cents={totalOfPaymentsCents} />
              </Row>
              <Row label="Interest over the loan">
                <Money cents={financeChargeCents} />
              </Row>
              <Row label="Total paid, including down payment" strong divider>
                <Money cents={totalPaidCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Savings are estimates based on the assumptions shown and are not guaranteed. Actual production and utility
          rates will vary.
        </p>
      </div>
    </main>
  );
}
