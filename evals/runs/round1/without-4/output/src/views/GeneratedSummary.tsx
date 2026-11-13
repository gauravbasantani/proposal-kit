import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine, formatApr, formatTerm } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// All money is in whole cents. 2200000 is $22,000.
const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  readyToSign: true,
  installer: "Brightline Home Solar",
  homeowner: {
    name: "Maria Okafor",
    street: "77 Juniper Bend",
    city: "Lakeport",
  },
  system: {
    panelCount: 18,
    panelWatts: 410,
    sizeKw: 7.38,
    inverters: "One microinverter per panel",
    annualKwh: 11_900,
  },
  price: {
    lineItems: [
      { label: "Panels and inverters", cents: 1_395_000 },
      { label: "Installation", cents: 645_000 },
      { label: "Permits and inspection", cents: 160_000 },
    ],
    totalCents: 2_200_000,
    downPaymentCents: 200_000,
    financedCents: 2_000_000,
  },
  loan: {
    apr: 6.49,
    termMonths: 240,
    monthlyCents: 14_900,
    totalOfPaymentsCents: 3_576_000,
  },
} as const;

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: 15,
  yearlyIncreasePct: 3,
  years: 25,
};

const kwh = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const kw = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className={strong ? "font-semibold text-foreground" : "text-sm text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-sm text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, system, price, loan } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background px-4 py-8 text-foreground">
      <header className="grid gap-2">
        <p className="text-sm text-muted-foreground">{proposal.installer}</p>
        <h1 className="text-3xl font-semibold">Your solar proposal</h1>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Proposal {proposal.id} · Prepared {proposal.preparedOn}
          </p>
          {proposal.readyToSign ? (
            <Badge variant="success">
              <CircleCheck aria-hidden="true" />
              Ready to sign
            </Badge>
          ) : null}
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Prepared for</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{homeowner.name}</p>
          <p className="text-sm text-muted-foreground">
            {homeowner.street}, {homeowner.city}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Your system</h2>
          </CardTitle>
          <CardDescription>
            {system.panelCount} panels at {system.panelWatts} W each
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl>
            <Row label="System size">{kw.format(system.sizeKw)} kW</Row>
            <Row label="Panels">
              {system.panelCount} × {system.panelWatts} W
            </Row>
            <Row label="Inverters">{system.inverters}</Row>
            <Row label="Estimated production">
              <span className="inline-flex items-center gap-2">
                <span className="tabular-nums">{kwh.format(system.annualKwh)} kWh a year</span>
                <Badge variant="estimate">Estimated</Badge>
              </span>
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Price</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            {price.lineItems.map((item) => (
              <Row key={item.label} label={item.label}>
                <Money cents={item.cents} />
              </Row>
            ))}
          </dl>
          <Separator className="my-2" />
          <dl>
            <Row label="Total price" strong>
              <Money cents={price.totalCents} />
            </Row>
            <Row label="Down payment">
              <Money cents={price.downPaymentCents} />
            </Row>
            <Row label="Amount financed">
              <Money cents={price.financedCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Financing</h2>
          </CardTitle>
          <CardDescription>
            Loan of <Money cents={price.financedCents} /> after a <Money cents={price.downPaymentCents} /> down payment
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PaymentLine monthlyCents={loan.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
          <dl>
            <Row label="APR">{formatApr(loan.apr)}</Row>
            <Row label="Term">{formatTerm(loan.termMonths)}</Row>
            <Row label={`Total of ${loan.termMonths} payments`} strong>
              <Money cents={loan.totalOfPaymentsCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Savings</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={savingsAssumptions} />
        </CardContent>
      </Card>
    </main>
  );
}
