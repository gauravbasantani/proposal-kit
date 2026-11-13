import type { ReactNode } from "react";

import { Money } from "@/components/Money";
import { PaymentLine, formatTerm } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { monthlyPaymentCents } from "@/lib/loan";

// ---------------------------------------------------------------------------
// Proposal data. Every amount is in whole cents. Totals, the amount financed,
// the monthly payment and the total of payments are derived from these inputs
// so the figures on the page cannot drift apart.
// ---------------------------------------------------------------------------

const proposal = {
  id: "P-2077",
  preparedOn: "2026-11-12",
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
  },
  savings: {
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  },
} as const;

const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0); // 2200000
const financedCents = totalCents - proposal.downPaymentCents; // 2000000
const monthlyCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths); // 14900
const totalOfPaymentsCents = monthlyCents * proposal.loan.termMonths; // 3576000
const financeChargeCents = totalOfPaymentsCents - financedCents; // 1576000
const totalPaidCents = proposal.downPaymentCents + totalOfPaymentsCents; // 3776000

const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000; // 7.38

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: proposal.savings.ratePerKwhCents,
  yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
  years: proposal.savings.years,
};

const preparedOnText = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${proposal.preparedOn}T00:00:00Z`));

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className={strong ? "font-semibold text-foreground" : "text-sm text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "text-lg font-semibold text-foreground" : "text-sm text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-4 text-foreground sm:p-6">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {proposal.installer} · Proposal {proposal.id}
          </p>
          <Badge variant="success">{proposal.status}</Badge>
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {proposal.homeowner.name}</h1>
        <p className="text-sm text-muted-foreground">
          {proposal.homeowner.address} · Prepared <time dateTime={proposal.preparedOn}>{preparedOnText}</time>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Your system</h2>
          </CardTitle>
          <CardDescription>
            {numberFormat.format(systemKw)} kW of solar on your roof
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid">
            <Row label="Panels">
              {proposal.system.panelCount} panels at {numberFormat.format(proposal.system.panelWatts)} W each
            </Row>
            <Row label="System size">{numberFormat.format(systemKw)} kW</Row>
            <Row label="Inverters">{proposal.system.inverter}</Row>
            <Row label="Estimated production">
              {numberFormat.format(proposal.system.annualKwh)} kWh a year
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Price</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <dl className="grid">
            {proposal.lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
          </dl>
          <Separator />
          <dl className="grid">
            <Row label="Total system price" strong>
              <Money cents={totalCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={proposal.downPaymentCents} />
            </Row>
            <Row label="Amount financed">
              <Money cents={financedCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Loan</h2>
          </CardTitle>
          <CardDescription>
            Financing <Money cents={financedCents} /> over {formatTerm(proposal.loan.termMonths)}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PaymentLine
            monthlyCents={monthlyCents}
            apr={proposal.loan.apr}
            termMonths={proposal.loan.termMonths}
          />
          <Separator />
          <dl className="grid">
            <Row label={`Total of ${proposal.loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
            <Row label="Interest and finance charges">
              <Money cents={financeChargeCents} />
            </Row>
            <Row label="Total paid, including down payment" strong>
              <Money cents={totalPaidCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <h2>Your electric bill</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={savingsAssumptions} />
        </CardContent>
      </Card>
    </main>
  );
}
