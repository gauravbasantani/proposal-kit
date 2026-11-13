import type { ReactNode } from "react";
import { CircleCheck, Sun, Zap } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine, formatApr, formatTerm } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { monthlyPaymentCents } from "@/lib/loan";

/*
 * Proposal data. Only the inputs live here; every total, the financed amount, the monthly
 * payment and the savings figures are derived below, so the page can't contradict itself.
 * All money is in whole cents.
 */
const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  status: "Ready to sign",
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  installer: "Brightline Home Solar",
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
  },
  annualProductionKwh: 11_900,
  lineItems: [
    { label: "Panels and inverters", cents: 1_395_000 },
    { label: "Installation", cents: 645_000 },
    { label: "Permits and inspection", cents: 160_000 },
  ],
  downPaymentCents: 200_000,
  loan: { apr: 6.49, termMonths: 240 },
  savings: { ratePerKwhCents: 15, yearlyIncreasePct: 3, years: 25 },
} as const;

const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000; // 7.38
const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0); // $22,000
const financedCents = totalCents - proposal.downPaymentCents; // $20,000
const monthlyCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths); // $149.00
const totalOfPaymentsCents = monthlyCents * proposal.loan.termMonths; // $35,760
const totalWithFinancingCents = proposal.downPaymentCents + totalOfPaymentsCents; // $37,760

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.annualProductionKwh,
  ratePerKwhCents: proposal.savings.ratePerKwhCents,
  yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
  years: proposal.savings.years,
};

const numberFormat = new Intl.NumberFormat("en-US");
const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background px-4 py-8 font-sans text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Proposal {proposal.id} · Prepared {proposal.preparedOn}
          </p>
          <Badge variant="success">
            <CircleCheck aria-hidden="true" />
            {proposal.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold leading-tight">Solar proposal for {proposal.homeowner.name}</h1>
        <p className="text-muted-foreground">
          {proposal.homeowner.address} · Prepared by {proposal.installer}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2 text-xl">
              <Sun aria-hidden="true" className="size-5 text-primary" />
              Your system
            </h2>
          </CardTitle>
          <CardDescription>What will be installed on your home.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-1 text-sm">
            <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
            <Row label="Panels">
              {proposal.system.panelCount} panels at {numberFormat.format(proposal.system.panelWatts)} W each
            </Row>
            <Row label="Inverters">{proposal.system.inverter}</Row>
            <Row label="Estimated production">
              <span className="inline-flex items-center gap-2">
                <Zap aria-hidden="true" className="size-4 text-primary" />
                {numberFormat.format(proposal.annualProductionKwh)} kWh a year
                <Badge variant="estimate">Estimated</Badge>
              </span>
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Price</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid text-sm">
            {proposal.lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
            <Separator className="my-2" />
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
          <CardTitle>
            <h2 className="text-xl">Financing</h2>
          </CardTitle>
          <CardDescription>
            Loan for the <Money cents={financedCents} /> financed.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PaymentLine monthlyCents={monthlyCents} apr={proposal.loan.apr} termMonths={proposal.loan.termMonths} />
          <Separator />
          <dl className="grid text-sm">
            <Row label="APR">{formatApr(proposal.loan.apr)}</Row>
            <Row label="Term">{formatTerm(proposal.loan.termMonths)}</Row>
            <Row label={`Total of ${proposal.loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
            <Row label="Total cost with down payment" strong>
              <Money cents={totalWithFinancingCents} />
            </Row>
          </dl>
          <p className="text-sm text-muted-foreground">
            Total cost with down payment is the <Money cents={proposal.downPaymentCents} /> down payment plus all{" "}
            {proposal.loan.termMonths} monthly payments, including interest.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Savings</h2>
          </CardTitle>
          <CardDescription>
            What the system's production would cost you from the utility instead.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <SavingsEstimate assumptions={savingsAssumptions} />
          <p className="text-sm text-muted-foreground">
            The savings estimate covers {proposal.savings.years} years; the loan runs{" "}
            {proposal.loan.termMonths / 12} years. Actual savings depend on your usage, weather, and future utility
            rates.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
