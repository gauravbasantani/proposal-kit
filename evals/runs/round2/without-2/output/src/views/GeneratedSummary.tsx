import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/Money";
import { PaymentLine, formatApr, formatTerm } from "@/components/PaymentLine";
import { SavingsEstimate, estimateSavings, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { monthlyPaymentCents } from "@/lib/loan";

/* ------------------------------------------------------------------ */
/* Proposal data. All money is in whole cents.                         */
/* ------------------------------------------------------------------ */

const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
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
    estimatedAnnualKwh: 11_900,
  },
  lineItems: [
    { label: "Panels and inverters", cents: 1_395_000 },
    { label: "Installation", cents: 645_000 },
    { label: "Permits and inspection", cents: 160_000 },
  ],
  downPaymentCents: 200_000,
  loan: {
    apr: 6.49,
    termMonths: 240,
  },
  savings: {
    annualKwh: 11_900,
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  } satisfies SavingsAssumptions,
} as const;

/* Everything below is derived from the data above, so the page can't disagree with itself. */
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0);
const financedCents = totalCents - proposal.downPaymentCents;
const monthlyCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths);
const totalOfPaymentsCents = monthlyCents * proposal.loan.termMonths;
const totalPaidCents = totalOfPaymentsCents + proposal.downPaymentCents;
const financeChargeCents = totalOfPaymentsCents - financedCents;
const firstYearLoanPaymentsCents = monthlyCents * 12;
const { firstYearCents: firstYearSavingsCents } = estimateSavings(proposal.savings);

const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className={strong ? "font-semibold text-foreground" : "text-sm text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-sm text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, system, loan } = proposal;

  return (
    <main className="min-h-screen bg-background px-4 py-8 font-sans text-foreground">
      <div className="mx-auto grid max-w-3xl gap-6">
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
          <h1 className="text-3xl font-semibold leading-tight">Solar proposal for {homeowner.name}</h1>
          <p className="text-sm text-muted-foreground">
            {homeowner.address} · Prepared {proposal.preparedOn}
          </p>
        </header>

        {/* Headline numbers */}
        <Card>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <PaymentLine monthlyCents={monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
            <SavingsEstimate assumptions={proposal.savings} />
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your system</CardTitle>
            <CardDescription>{kwFormat.format(systemKw)} kW of solar on your roof</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              <Row label="Panels">
                {system.panelCount} panels × {intFormat.format(system.panelWatts)} W
              </Row>
              <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
              <Row label="Inverters">{system.inverter}</Row>
              <Row label="Estimated production">{intFormat.format(system.estimatedAnnualKwh)} kWh a year</Row>
            </dl>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              {proposal.lineItems.map((item) => (
                <Row key={item.label} label={item.label}>
                  <Money cents={item.cents} />
                </Row>
              ))}
              <Separator className="my-2" />
              <Row label="Total price" strong>
                <Money cents={totalCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        {/* Financing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financing</CardTitle>
            <CardDescription>
              {formatApr(loan.apr)} · {formatTerm(loan.termMonths)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              <Row label="Total price">
                <Money cents={totalCents} />
              </Row>
              <Row label="Down payment">
                <Money cents={proposal.downPaymentCents} />
              </Row>
              <Row label="Amount financed">
                <Money cents={financedCents} />
              </Row>
              <Separator className="my-2" />
              <Row label="Monthly payment">
                <Money cents={monthlyCents} /> × {loan.termMonths}
              </Row>
              <Row label={`Total of ${loan.termMonths} payments`}>
                <Money cents={totalOfPaymentsCents} />
              </Row>
              <Row label="Interest and finance charges">
                <Money cents={financeChargeCents} />
              </Row>
              <Separator className="my-2" />
              <Row label="Total you pay, including down payment" strong>
                <Money cents={totalPaidCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        {/* Payments vs. savings, year one */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">First year at a glance</CardTitle>
              <Badge variant="estimate">Estimated</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              <Row label="Loan payments in year one">
                <Money cents={firstYearLoanPaymentsCents} />
              </Row>
              <Row label="Estimated bill savings in year one">
                <Money cents={firstYearSavingsCents} precision="dollars" />
              </Row>
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              In the first year, loan payments and estimated bill savings are about the same. Savings are an
              estimate based on the assumptions shown above and are not guaranteed; loan payments are fixed for
              the full {formatTerm(loan.termMonths)}.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
