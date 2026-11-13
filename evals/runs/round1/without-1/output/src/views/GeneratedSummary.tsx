import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/* Proposal data. All money is in whole cents.                          */
/* ------------------------------------------------------------------ */

const proposal = {
  id: "P-2077",
  preparedOn: { iso: "2026-11-12", display: "November 12, 2026" },
  status: "Ready to sign",
  installer: "Brightline Home Solar",
  homeowner: {
    name: "Maria Okafor",
    address: "77 Juniper Bend, Lakeport",
  },
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
    annualKwh: 11_900,
  },
  price: {
    lineItems: [
      { label: "Panels and inverters", cents: 1_395_000 },
      { label: "Installation", cents: 645_000 },
      { label: "Permits and inspection", cents: 160_000 },
    ],
    downPaymentCents: 200_000,
  },
  loan: {
    apr: 6.49,
    termMonths: 240,
    monthlyCents: 14_900,
  },
  savings: {
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  },
} as const;

/* Derived figures, so the totals on the page always add up from the lines above. */
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalPriceCents = proposal.price.lineItems.reduce((sum, item) => sum + item.cents, 0); // $22,000
const amountFinancedCents = totalPriceCents - proposal.price.downPaymentCents; // $20,000
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths; // $35,760
const interestCents = totalOfPaymentsCents - amountFinancedCents; // $15,760

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: proposal.savings.ratePerKwhCents,
  yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
  years: proposal.savings.years,
};

const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ */

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className={strong ? "font-semibold text-foreground" : "text-sm text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-sm text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, system, price, loan } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      {/* Header */}
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {proposal.installer} · Proposal {proposal.id}
          </p>
          <Badge variant="success">
            <CircleCheck aria-hidden="true" />
            {proposal.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold text-foreground">Solar proposal for {homeowner.name}</h1>
        <p className="text-sm text-muted-foreground">
          {homeowner.address} · Prepared <time dateTime={proposal.preparedOn.iso}>{proposal.preparedOn.display}</time>
        </p>
      </header>

      {/* System */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Your system</h2>
          </CardTitle>
          <CardDescription>
            {system.panelCount} panels at {intFormat.format(system.panelWatts)} W each
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-1">
            <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
            <Row label="Panels">
              {system.panelCount} × {intFormat.format(system.panelWatts)} W
            </Row>
            <Row label="Inverters">{system.inverter}</Row>
            <Row label="Estimated production">{intFormat.format(system.annualKwh)} kWh a year</Row>
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
        <CardContent className="grid gap-2">
          <dl className="grid gap-1">
            {price.lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
          </dl>
          <Separator />
          <dl className="grid gap-1">
            <Row label="Total price" strong>
              <Money cents={totalPriceCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={price.downPaymentCents} />
            </Row>
            <Row label="Amount financed">
              <Money cents={amountFinancedCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      {/* Financing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Financing</h2>
          </CardTitle>
          <CardDescription>
            Loan on the <Money cents={amountFinancedCents} /> amount financed
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PaymentLine monthlyCents={loan.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
          <Separator />
          <dl className="grid gap-1">
            <Row label={`Total of ${loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
            <Row label="Interest over the loan">
              <Money cents={interestCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={price.downPaymentCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      {/* Savings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Estimated savings</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={savingsAssumptions} />
        </CardContent>
      </Card>
    </main>
  );
}
