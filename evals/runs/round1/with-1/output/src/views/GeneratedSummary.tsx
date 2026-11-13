import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { monthlyPaymentCents } from "@/lib/loan";

/** Every number on this page comes from this object. Amounts are whole cents. */
const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
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
  loan: { apr: 6.49, termMonths: 240 },
  savings: { ratePerKwhCents: 15, yearlyIncreasePct: 3, years: 25 },
} as const;

// Derived values, so the totals always agree with the line items.
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0);
const financedCents = totalCents - proposal.downPaymentCents;
const paymentCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths);
const totalOfPaymentsCents = paymentCents * proposal.loan.termMonths;

const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const countFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-4 font-semibold text-foreground" : "flex justify-between gap-4 text-foreground"}>
      <dt className={strong ? undefined : "text-muted-foreground"}>{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, installer, system, lineItems, loan, savings } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Proposal {proposal.id} · Prepared {proposal.preparedOn}
          </p>
          <Badge variant="success">
            <CheckCircle2 aria-hidden="true" />
            Ready to sign
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
        <p className="text-muted-foreground">
          {homeowner.address} · Prepared by {installer}
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-tight">Your system</h2>
          <CardDescription>What will be installed on your home.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm">
            <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
            <Row label="Panels">
              {system.panelCount} panels at {system.panelWatts} W each
            </Row>
            <Row label="Inverters">{system.inverter}</Row>
            <Row label="Estimated production">{countFormat.format(system.annualKwh)} kWh a year</Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-tight">Price</h2>
          <CardDescription>The full cost of the system, installed.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <dl className="grid gap-2 text-sm">
            {lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
          </dl>
          <Separator />
          <dl className="grid gap-2">
            <Row label="Total price" strong>
              <Money cents={totalCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-tight">Financing</h2>
          <CardDescription>A loan covers the price after your down payment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="grid gap-2 text-sm">
            <Row label="Total price">
              <Money cents={totalCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={proposal.downPaymentCents} />
            </Row>
            <Row label="Amount financed" strong>
              <Money cents={financedCents} />
            </Row>
          </dl>
          <Separator />
          <PaymentLine monthlyCents={paymentCents} apr={loan.apr} termMonths={loan.termMonths} />
          <dl className="grid gap-2 text-sm">
            <Row label={`Total of ${loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-tight">Estimated savings</h2>
          <CardDescription>Based on the electricity your system is expected to produce.</CardDescription>
        </CardHeader>
        <CardContent>
          <SavingsEstimate
            assumptions={{
              annualKwh: system.annualKwh,
              ratePerKwhCents: savings.ratePerKwhCents,
              yearlyIncreasePct: savings.yearlyIncreasePct,
              years: savings.years,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-tight">Next step</h2>
          <CardDescription>
            Review the details above. When you are ready, sign proposal {proposal.id} with {installer}.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" size="lg">
            Review and sign
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
