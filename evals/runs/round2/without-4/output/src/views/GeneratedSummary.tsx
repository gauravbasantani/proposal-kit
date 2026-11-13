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
  preparedOn: "2026-11-12",
  status: "Ready to sign",
  homeowner: {
    name: "Maria Okafor",
    address: "77 Juniper Bend, Lakeport",
  },
  installer: "Brightline Home Solar",
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
    annualProductionKwh: 11_900,
  },
  price: {
    lineItems: [
      { label: "Panels and inverters", cents: 1_395_000 },
      { label: "Installation", cents: 645_000 },
      { label: "Permits and inspection", cents: 160_000 },
    ],
    totalCents: 2_200_000,
  },
  financing: {
    downPaymentCents: 200_000,
    amountFinancedCents: 2_000_000,
    apr: 6.49,
    termMonths: 240,
    monthlyPaymentCents: 14_900,
    totalOfPaymentsCents: 3_576_000,
  },
  savings: {
    annualKwh: 11_900,
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  } satisfies SavingsAssumptions,
  /** The figures quoted to the homeowner; checked against the calculation below. */
  quotedSavings: {
    firstYearDollars: 1_785,
    totalDollars: 65_080,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Consistency checks. A page with numbers that don't add up should    */
/* fail loudly instead of rendering quietly.                           */
/* ------------------------------------------------------------------ */

function assertProposalConsistent(): void {
  const fail = (msg: string) => {
    throw new Error(`Proposal ${proposal.id}: ${msg}`);
  };
  const { system, price, financing, savings, quotedSavings } = proposal;

  const lineItemSum = price.lineItems.reduce((sum, item) => sum + item.cents, 0);
  if (lineItemSum !== price.totalCents) fail(`line items add to ${lineItemSum} cents, total says ${price.totalCents}.`);

  if (price.totalCents - financing.downPaymentCents !== financing.amountFinancedCents) {
    fail("total price minus down payment does not equal the amount financed.");
  }

  const computedPayment = monthlyPaymentCents(financing.amountFinancedCents, financing.apr, financing.termMonths);
  if (computedPayment !== financing.monthlyPaymentCents) {
    fail(`monthly payment is ${financing.monthlyPaymentCents} cents but the loan terms give ${computedPayment}.`);
  }

  if (financing.monthlyPaymentCents * financing.termMonths !== financing.totalOfPaymentsCents) {
    fail("total of payments does not equal monthly payment times term.");
  }

  if (savings.annualKwh !== system.annualProductionKwh) fail("savings production does not match system production.");

  const { firstYearCents, totalCents } = estimateSavings(savings);
  if (Math.round(firstYearCents / 100) !== quotedSavings.firstYearDollars) fail("first-year savings do not match the quote.");
  if (Math.round(totalCents / 100) !== quotedSavings.totalDollars) fail("total savings do not match the quote.");
}

assertProposalConsistent();

/* ------------------------------------------------------------------ */
/* Derived values                                                       */
/* ------------------------------------------------------------------ */

const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const financeChargeCents = proposal.financing.totalOfPaymentsCents - proposal.financing.amountFinancedCents;
const totalCostWithFinancingCents = proposal.financing.downPaymentCents + proposal.financing.totalOfPaymentsCents;

const preparedOnText = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
  new Date(`${proposal.preparedOn}T00:00:00Z`),
);
const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className={strong ? "font-semibold text-foreground" : "text-sm text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-sm text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, installer, system, price, financing, savings } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {installer} · Proposal {proposal.id}
          </p>
          <Badge variant="success">
            <CircleCheck aria-hidden="true" />
            {proposal.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold text-foreground">Solar proposal for {homeowner.name}</h1>
        <p className="text-base text-muted-foreground">
          {homeowner.address} · Prepared {preparedOnText}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your system</CardTitle>
          <CardDescription>
            {system.panelCount} panels at {intFormat.format(system.panelWatts)} W each
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">System size</dt>
              <dd className="text-2xl font-semibold text-foreground tabular-nums">{kwFormat.format(systemKw)} kW</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">Inverters</dt>
              <dd className="text-base text-foreground">{system.inverter}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                Production
                <Badge variant="estimate">Estimated</Badge>
              </dt>
              <dd className="text-2xl font-semibold text-foreground tabular-nums">
                {intFormat.format(system.annualProductionKwh)}
                <span className="text-base font-normal text-muted-foreground"> kWh a year</span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Price</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            {price.lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
            <Separator className="my-1" />
            <Row label="Total price" strong>
              <Money cents={price.totalCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Financing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PaymentLine
            monthlyCents={financing.monthlyPaymentCents}
            apr={financing.apr}
            termMonths={financing.termMonths}
          />
          <Separator />
          <dl>
            <Row label="Total price">
              <Money cents={price.totalCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={financing.downPaymentCents} />
            </Row>
            <Row label="Amount financed">
              <Money cents={financing.amountFinancedCents} />
            </Row>
            <Row label={`Total of ${financing.termMonths} payments`}>
              <Money cents={financing.totalOfPaymentsCents} />
            </Row>
            <Row label="Finance charge (interest)">
              <Money cents={financeChargeCents} />
            </Row>
            <Separator className="my-1" />
            <Row label="Total cost with financing" strong>
              <Money cents={totalCostWithFinancingCents} />
            </Row>
          </dl>
          <p className="text-sm text-muted-foreground">
            Total cost with financing is the down payment plus all {financing.termMonths} monthly payments at{" "}
            {formatApr(financing.apr)} over {formatTerm(financing.termMonths)}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={savings} />
        </CardContent>
      </Card>
    </main>
  );
}
