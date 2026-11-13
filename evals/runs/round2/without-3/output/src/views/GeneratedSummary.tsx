import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/Money";
import { PaymentLine, formatApr, formatTerm } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";

/* ------------------------------------------------------------------ */
/* Proposal data. Every money amount is in whole cents.                */
/* ------------------------------------------------------------------ */

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
    annualKwh: 11_900,
  },
  priceLines: [
    { label: "Panels and inverters", cents: 1_395_000 },
    { label: "Installation", cents: 645_000 },
    { label: "Permits and inspection", cents: 160_000 },
  ],
  downPaymentCents: 200_000,
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

/* ------------------------------------------------------------------ */
/* Derived figures: computed from the data above, never typed by hand. */
/* ------------------------------------------------------------------ */

const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalPriceCents = proposal.priceLines.reduce((sum, line) => sum + line.cents, 0);
const financedCents = totalPriceCents - proposal.downPaymentCents;
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths;
const financeChargeCents = totalOfPaymentsCents - financedCents;
const totalCostWithLoanCents = proposal.downPaymentCents + totalOfPaymentsCents;

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: proposal.savings.ratePerKwhCents,
  yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
  years: proposal.savings.years,
};

const preparedOnText = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(new Date(`${proposal.preparedOn}T00:00:00Z`));

const kwhFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ------------------------------------------------------------------ */

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
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto grid max-w-3xl gap-6">
        {/* Header */}
        <header className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {proposal.installer} · Proposal {proposal.id}
            </p>
            <Badge variant="success">{proposal.status}</Badge>
          </div>
          <h1 className="text-3xl font-semibold">Solar proposal for {proposal.homeowner.name}</h1>
          <p className="text-muted-foreground">
            {proposal.homeowner.address} · Prepared {preparedOnText}
          </p>
        </header>

        {/* At a glance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">At a glance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <PaymentLine
              monthlyCents={proposal.loan.monthlyCents}
              apr={proposal.loan.apr}
              termMonths={proposal.loan.termMonths}
            />
            <SavingsEstimate assumptions={savingsAssumptions} />
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your system</CardTitle>
            <CardDescription>{kwFormat.format(systemKw)} kW solar array</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2">
              <Row label="Panels">
                {proposal.system.panelCount} panels at {proposal.system.panelWatts} W each
              </Row>
              <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
              <Row label="Inverters">{proposal.system.inverter}</Row>
              <Row label="Estimated production">
                {kwhFormat.format(proposal.system.annualKwh)} kWh a year{" "}
                <Badge variant="estimate">Estimated</Badge>
              </Row>
            </dl>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2">
              {proposal.priceLines.map((line) => (
                <Row key={line.label} label={line.label}>
                  <Money cents={line.cents} />
                </Row>
              ))}
              <Separator className="my-1" />
              <Row label="Total system price" strong>
                <Money cents={totalPriceCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        {/* Financing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financing</CardTitle>
            <CardDescription>
              Borrowing adds a finance charge, so the total you pay over the loan is more than the system price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2">
              <Row label="Total system price">
                <Money cents={totalPriceCents} />
              </Row>
              <Row label="Down payment">
                <Money cents={proposal.downPaymentCents} />
              </Row>
              <Row label="Amount financed">
                <Money cents={financedCents} />
              </Row>
              <Separator className="my-1" />
              <Row label="Monthly payment">
                <Money cents={proposal.loan.monthlyCents} /> · {formatApr(proposal.loan.apr)} ·{" "}
                {formatTerm(proposal.loan.termMonths)}
              </Row>
              <Row label={`Total of ${proposal.loan.termMonths} payments`}>
                <Money cents={totalOfPaymentsCents} />
              </Row>
              <Row label="Finance charge (interest)">
                <Money cents={financeChargeCents} />
              </Row>
              <Separator className="my-1" />
              <Row label="Total cost with loan (down payment + all payments)" strong>
                <Money cents={totalCostWithLoanCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Savings and production figures are estimates, not guarantees. Actual results depend on weather, shading,
          usage, and future utility rates. Loan payments are fixed by the loan agreement and are owed regardless of
          actual savings.
        </p>
      </div>
    </main>
  );
}
