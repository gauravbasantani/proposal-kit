import type { ReactNode } from "react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// All amounts are whole cents.
const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  installer: "Brightline Home Solar",
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
    annualKwh: 11900,
  },
  priceLines: [
    { label: "Panels and inverters", cents: 1395000 },
    { label: "Installation", cents: 645000 },
    { label: "Permits and inspection", cents: 160000 },
  ],
  downPaymentCents: 200000,
  loan: { monthlyCents: 14900, apr: 6.49, termMonths: 240 },
  savings: { ratePerKwhCents: 15, yearlyIncreasePct: 3, years: 25 },
};

const totalCents = proposal.priceLines.reduce((sum, line) => sum + line.cents, 0);
const financedCents = totalCents - proposal.downPaymentCents;
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths;
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: proposal.savings.ratePerKwhCents,
  yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
  years: proposal.savings.years,
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {proposal.installer} · Proposal {proposal.id}
          </p>
          <Badge variant="success">Ready to sign</Badge>
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {proposal.homeowner.name}</h1>
        <p className="text-base text-muted-foreground">
          {proposal.homeowner.address} · Prepared {proposal.preparedOn}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>Your system</h2>
            </CardTitle>
            <CardDescription>{numberFormat.format(systemKw)} kW rooftop solar</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 text-sm">
              <Row label="Panels">
                {proposal.system.panelCount} × {proposal.system.panelWatts} W
              </Row>
              <Row label="System size">{numberFormat.format(systemKw)} kW</Row>
              <Row label="Inverters">{proposal.system.inverter}</Row>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  Yearly production <Badge variant="estimate">Estimated</Badge>
                </dt>
                <dd className="text-foreground">{numberFormat.format(proposal.system.annualKwh)} kWh</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>Price</h2>
            </CardTitle>
            <CardDescription>What the system costs</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 text-sm">
              {proposal.priceLines.map((line) => (
                <Row key={line.label} label={line.label}>
                  <Money cents={line.cents} />
                </Row>
              ))}
              <Separator className="my-1" />
              <Row label="Total price" strong>
                <Money cents={totalCents} />
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>Your loan</h2>
            </CardTitle>
            <CardDescription>
              Financing <Money cents={financedCents} />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PaymentLine
              monthlyCents={proposal.loan.monthlyCents}
              apr={proposal.loan.apr}
              termMonths={proposal.loan.termMonths}
            />
            <Separator />
            <dl className="grid gap-2 text-sm">
              <Row label={`Total of ${proposal.loan.termMonths} payments`}>
                <Money cents={totalOfPaymentsCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <h2>Savings</h2>
            </CardTitle>
            <CardDescription>Based on today's utility rate</CardDescription>
          </CardHeader>
          <CardContent>
            <SavingsEstimate assumptions={savingsAssumptions} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
