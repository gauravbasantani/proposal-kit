import type { ReactNode } from "react";
import { CheckCircle2, PenLine } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/* Data: one source for every number on the page. Amounts are cents.   */
/* ------------------------------------------------------------------ */

const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  readyToSign: true,
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  installer: "Brightline Home Solar",
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
    annualKwh: 11900,
  },
  lineItems: [
    { label: "Panels and inverters", cents: 1395000 },
    { label: "Installation", cents: 645000 },
    { label: "Permits and inspection", cents: 160000 },
  ],
  downPaymentCents: 200000,
  loan: {
    apr: 6.49,
    termMonths: 240,
    monthlyCents: 14900,
  },
  savings: {
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  },
} as const;

// Derived values, so the totals always agree with the line items above.
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalPriceCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0);
const amountFinancedCents = totalPriceCents - proposal.downPaymentCents;
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths;
const savingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: proposal.savings.ratePerKwhCents,
  yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
  years: proposal.savings.years,
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/* ------------------------------------------------------------------ */

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-baseline justify-between gap-4 font-semibold" : "flex items-baseline justify-between gap-4"}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, installer, system, loan } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Proposal {proposal.id} · Prepared {proposal.preparedOn}
          </p>
          {proposal.readyToSign ? (
            <Badge variant="success">
              <CheckCircle2 aria-hidden="true" />
              Ready to sign
            </Badge>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
        <p className="text-base text-muted-foreground">
          {homeowner.address} · Prepared by {installer}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Your system</h2>
          </CardTitle>
          <CardDescription>What will be installed on your home.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm">
            <Row label="System size">{numberFormat.format(systemKw)} kW</Row>
            <Row label="Panels">
              {system.panelCount} panels at {system.panelWatts} W each
            </Row>
            <Row label="Inverters">{system.inverter}</Row>
            <Row label="Estimated production">{numberFormat.format(system.annualKwh)} kWh a year</Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Price</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <dl className="grid gap-2 text-sm">
            {proposal.lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
          </dl>
          <Separator />
          <dl className="grid gap-2 text-sm">
            <Row label="Total price" strong>
              <Money cents={totalPriceCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={proposal.downPaymentCents} />
            </Row>
            <Row label="Amount financed" strong>
              <Money cents={amountFinancedCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Loan</h2>
          </CardTitle>
          <CardDescription>
            Financing <Money cents={amountFinancedCents} /> after your <Money cents={proposal.downPaymentCents} /> down
            payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <PaymentLine monthlyCents={loan.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
          <Separator />
          <dl className="grid gap-2 text-sm">
            <Row label={`Total of ${loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Estimated savings</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={savingsAssumptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Next step</h2>
          </CardTitle>
          <CardDescription>
            Review the details above with {installer} before you sign proposal {proposal.id}.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" size="lg">
            <PenLine aria-hidden="true" />
            Review and sign
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
