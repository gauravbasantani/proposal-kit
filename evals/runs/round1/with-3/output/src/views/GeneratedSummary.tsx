import type { ReactNode } from "react";
import { CheckCircle2, FileSignature } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { monthlyPaymentCents } from "@/lib/loan";

// One source for every number on the page. Amounts are whole cents.
const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  installer: "Brightline Home Solar",
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
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
    // Payment quoted on the loan offer; checked against the amortization below.
    monthlyCents: 14900,
  },
  savings: {
    annualKwh: 11900,
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  },
} as const;

// Derived values, so totals always agree with their parts.
const systemWatts = proposal.system.panelCount * proposal.system.panelWatts;
const systemKw = systemWatts / 1000;
const totalPriceCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0);
const amountFinancedCents = totalPriceCents - proposal.downPaymentCents;
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths;
const financeChargeCents = totalOfPaymentsCents - amountFinancedCents;
const totalCostWithLoanCents = proposal.downPaymentCents + totalOfPaymentsCents;

// Fail loudly rather than show a payment that doesn't match the loan terms.
const computedMonthlyCents = monthlyPaymentCents(amountFinancedCents, proposal.loan.apr, proposal.loan.termMonths);
if (Math.abs(computedMonthlyCents - proposal.loan.monthlyCents) > 1) {
  throw new Error(
    `Proposal ${proposal.id}: quoted payment ${proposal.loan.monthlyCents} cents does not match ` +
      `${computedMonthlyCents} cents computed from the amount financed, APR and term.`,
  );
}

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
          <Badge variant="success">
            <CheckCircle2 aria-hidden="true" />
            Ready to sign
          </Badge>
          <Badge variant="outline">Proposal {proposal.id}</Badge>
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {proposal.homeowner.name}</h1>
        <p className="text-sm text-muted-foreground">
          {proposal.homeowner.address} · Prepared by {proposal.installer} on {proposal.preparedOn}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Your system</h2>
          </CardTitle>
          <CardDescription>What we will install on your home.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm">
            <Row label="System size">{numberFormat.format(systemKw)} kW</Row>
            <Row label="Panels">
              {proposal.system.panelCount} panels at {proposal.system.panelWatts} W each
            </Row>
            <Row label="Inverters">{proposal.system.inverter}</Row>
            <Row label="Estimated production">{numberFormat.format(proposal.savings.annualKwh)} kWh a year</Row>
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
            <Row label="Amount financed">
              <Money cents={amountFinancedCents} />
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
            Loan on the amount financed of <Money cents={amountFinancedCents} />.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
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
            <Row label="Finance charge (interest)">
              <Money cents={financeChargeCents} />
            </Row>
            <Row label="Total cost with down payment and loan" strong>
              <Money cents={totalCostWithLoanCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Your electricity bill</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={proposal.savings} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg">
          <FileSignature aria-hidden="true" />
          Review and sign proposal {proposal.id}
        </Button>
        <p className="text-sm text-muted-foreground">Questions? Contact {proposal.installer} before you sign.</p>
      </div>
    </main>
  );
}
