import type { ReactNode } from "react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// All amounts are whole cents. Dollars are converted once, here.
const proposal = {
  id: "P-2077",
  preparedOn: { iso: "2026-11-12", text: "November 12, 2026" },
  status: "Ready to sign",
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  installer: "Brightline Home Solar",
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
    annualKwh: 11_900,
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  } satisfies SavingsAssumptions,
};

const totalPriceCents = proposal.price.lineItems.reduce((sum, item) => sum + item.cents, 0);
const amountFinancedCents = totalPriceCents - proposal.price.downPaymentCents;
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths;
const totalWithFinancingCents = proposal.price.downPaymentCents + totalOfPaymentsCents;
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;

const kwhFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, installer, system, price, loan, savings } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Proposal {proposal.id} · Prepared <time dateTime={proposal.preparedOn.iso}>{proposal.preparedOn.text}</time>
          </p>
          <Badge variant="success">{proposal.status}</Badge>
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
        <p className="text-base text-muted-foreground">
          {homeowner.address} · Prepared by {installer}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Your system</h2>
            </CardTitle>
            <CardDescription>{kwFormat.format(systemKw)} kW of panels on your roof</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 text-sm">
              <Row label="Panels">
                {system.panelCount} × {system.panelWatts} W
              </Row>
              <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
              <Row label="Inverters">{system.inverter}</Row>
              <Row label="Estimated production">{kwhFormat.format(system.annualKwh)} kWh a year</Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Price</h2>
            </CardTitle>
            <CardDescription>What the system costs before financing</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <dl className="grid gap-2 text-sm">
              {price.lineItems.map((item) => (
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
                <Money cents={price.downPaymentCents} />
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
              <h2 className="text-lg">Financing</h2>
            </CardTitle>
            <CardDescription>
              Loan on <Money cents={amountFinancedCents} />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <PaymentLine monthlyCents={loan.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
            <Separator />
            <dl className="grid gap-2 text-sm">
              <Row label={`Total of ${loan.termMonths} payments`}>
                <Money cents={totalOfPaymentsCents} />
              </Row>
              <Row label="Down payment plus all loan payments" strong>
                <Money cents={totalWithFinancingCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Your electric bill</h2>
            </CardTitle>
            <CardDescription>Based on your utility's rate today</CardDescription>
          </CardHeader>
          <CardContent>
            <SavingsEstimate assumptions={savings} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
