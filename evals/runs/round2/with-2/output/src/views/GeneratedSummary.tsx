import type { ReactNode } from "react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// All amounts are whole cents. Totals are derived from their parts so they can't drift apart.
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
    annualKwh: 11_900,
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
    monthlyCents: 14_900,
  },
  savings: {
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  },
};

const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0);
const financedCents = totalCents - proposal.downPaymentCents;
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths;

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: proposal.savings.ratePerKwhCents,
  yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
  years: proposal.savings.years,
};

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-baseline justify-between gap-4 font-semibold" : "flex items-baseline justify-between gap-4"}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className="m-0 text-foreground">{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, system, loan } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {proposal.installer} · Proposal {proposal.id}
          </p>
          <Badge variant="success">{proposal.status}</Badge>
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
        <p className="text-base text-muted-foreground">
          {homeowner.address} · Prepared {proposal.preparedOn}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your system</CardTitle>
          <CardDescription>
            {number.format(systemKw)} kW of solar on your home
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="m-0 grid gap-2 text-sm">
            <Row label="Panels">
              {system.panelCount} panels at {number.format(system.panelWatts)} W each
            </Row>
            <Row label="System size">{number.format(systemKw)} kW</Row>
            <Row label="Inverters">{system.inverter}</Row>
            <Row label="Estimated production">{number.format(system.annualKwh)} kWh a year</Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Price</CardTitle>
          <CardDescription>What the system costs, before financing</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <dl className="m-0 grid gap-2 text-sm">
            {proposal.lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
          </dl>
          <Separator />
          <dl className="m-0 grid gap-2 text-base">
            <Row label="Total price" strong>
              <Money cents={totalCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Financing</CardTitle>
          <CardDescription>How the total price is paid</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="m-0 grid gap-2 text-sm">
            <Row label="Total price">
              <Money cents={totalCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={proposal.downPaymentCents} />
            </Row>
            <Row label="Amount financed">
              <Money cents={financedCents} />
            </Row>
          </dl>
          <Separator />
          <PaymentLine monthlyCents={loan.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} label="Loan payment" />
          <dl className="m-0 grid gap-2 text-sm">
            <Row label={`Total of ${loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
            <Row label="Down payment plus all loan payments" strong>
              <Money cents={totalOfPaymentsCents + proposal.downPaymentCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your electric bill</CardTitle>
          <CardDescription>Based on the production estimate above and today's utility rate</CardDescription>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={savingsAssumptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Next step</CardTitle>
          <CardDescription>
            Proposal {proposal.id} is ready for your signature. Review every figure above before signing.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button>Review and sign</Button>
          <Button variant="outline">Ask {proposal.installer} a question</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
