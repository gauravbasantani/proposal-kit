import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";

// Proposal data. All money is in whole cents.
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
    annualKwh: 11_900,
  },
  lineItems: [
    { label: "Panels and inverters", cents: 1_395_000 },
    { label: "Installation", cents: 645_000 },
    { label: "Permits and inspection", cents: 160_000 },
  ],
  downPaymentCents: 200_000,
  loan: { apr: 6.49, termMonths: 240, monthlyCents: 14_900 },
};

const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0); // $22,000
const financedCents = totalCents - proposal.downPaymentCents; // $20,000
const totalOfPaymentsCents = proposal.loan.monthlyCents * proposal.loan.termMonths; // $35,760
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000; // 7.38 kW

const savingsAssumptions: SavingsAssumptions = {
  annualKwh: proposal.system.annualKwh,
  ratePerKwhCents: 15,
  yearlyIncreasePct: 3,
  years: 25,
}; // works out to about $65,080 total, $1,785 the first year

const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-4 font-semibold" : "flex justify-between gap-4"}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className="text-right text-foreground">{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, installer, system, loan } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 font-sans text-foreground">
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
        <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
        <p className="text-base text-muted-foreground">
          {homeowner.address} · Prepared by {installer}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Your system</h2>
          </CardTitle>
          <CardDescription>
            {system.panelCount} panels at {intFormat.format(system.panelWatts)} W each
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm">
            <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
            <Row label="Panels">
              {system.panelCount} × {intFormat.format(system.panelWatts)} W
            </Row>
            <Row label="Inverters">{system.inverter}</Row>
            <Row label="Estimated production">{intFormat.format(system.annualKwh)} kWh a year</Row>
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
            Loan of <Money cents={financedCents} />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <PaymentLine monthlyCents={loan.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
          <Separator />
          <dl className="grid gap-2 text-sm">
            <Row label={`Total of ${loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Estimated savings</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={savingsAssumptions} />
        </CardContent>
      </Card>
    </main>
  );
}
