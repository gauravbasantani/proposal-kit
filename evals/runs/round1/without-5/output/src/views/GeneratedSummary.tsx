import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";

// All money is in whole cents.
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
};

const savings: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: 15,
  yearlyIncreasePct: 3,
  years: 25,
};

const kwh = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className={strong ? "font-semibold text-foreground" : "text-sm text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-sm text-foreground"}>{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, system, price, loan } = proposal;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto grid max-w-3xl gap-6">
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
          <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
          <p className="text-muted-foreground">{homeowner.address}</p>
          <p className="text-sm text-muted-foreground">Prepared {proposal.preparedOn}</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your system</CardTitle>
            <CardDescription>
              {system.panelCount} panels at {system.panelWatts} W each
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">System size</p>
              <p className="text-2xl font-semibold">{system.sizeKw} kW</p>
              <p className="text-sm">{system.inverters}</p>
            </div>
            <div className="grid gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">Estimated yearly production</p>
                <Badge variant="estimate">Estimated</Badge>
              </div>
              <p className="text-2xl font-semibold tabular-nums">{kwh.format(system.annualKwh)} kWh</p>
              <p className="text-sm text-muted-foreground">per year</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <dl>
              {price.lineItems.map((item) => (
                <Row key={item.label} label={item.label}>
                  <Money cents={item.cents} />
                </Row>
              ))}
            </dl>
            <Separator />
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
            <CardTitle className="text-lg">Financing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PaymentLine monthlyCents={loan.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
            <Separator />
            <dl>
              <Row label="Amount financed">
                <Money cents={price.financedCents} />
              </Row>
              <Row label={`Total of ${loan.termMonths} payments`}>
                <Money cents={loan.totalOfPaymentsCents} />
              </Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsEstimate assumptions={savings} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
