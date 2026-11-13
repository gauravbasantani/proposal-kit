import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { monthlyPaymentCents } from "@/lib/loan";

// ---------------------------------------------------------------------------
// Proposal data. All money is in whole cents.
// ---------------------------------------------------------------------------

const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  installer: "Brightline Home Solar",
  homeowner: {
    name: "Maria Okafor",
    address: "77 Juniper Bend, Lakeport",
  },
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
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
};

// Derived figures, so every number on the page comes from the data above.
const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0); // $22,000
const financedCents = totalCents - proposal.downPaymentCents; // $20,000
const monthlyCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths); // $149.00
const totalOfPaymentsCents = monthlyCents * proposal.loan.termMonths; // $35,760
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000; // 7.38

const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kwhFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-4 font-semibold" : "flex justify-between gap-4"}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className="text-right text-foreground">{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 p-6">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {proposal.installer} · Proposal {proposal.id}
          </p>
          <Badge variant="success">Ready to sign</Badge>
        </div>
        <h1 className="text-3xl font-semibold text-foreground">Solar proposal for {proposal.homeowner.name}</h1>
        <p className="text-sm text-muted-foreground">
          {proposal.homeowner.address} · Prepared {proposal.preparedOn}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your system</CardTitle>
          <CardDescription>
            {kwFormat.format(systemKw)} kW · {proposal.system.panelCount} panels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm">
            <Row label="Panels">
              {proposal.system.panelCount} × {proposal.system.panelWatts} W
            </Row>
            <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
            <Row label="Inverters">{proposal.system.inverter}</Row>
            <Row label="Estimated production">{kwhFormat.format(proposal.savings.annualKwh)} kWh a year</Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price</CardTitle>
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
            <Row label="Amount financed">
              <Money cents={financedCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <PaymentLine monthlyCents={monthlyCents} apr={proposal.loan.apr} termMonths={proposal.loan.termMonths} />
          <Separator />
          <dl className="grid gap-2 text-sm">
            <Row label="Amount financed">
              <Money cents={financedCents} />
            </Row>
            <Row label={`Total of ${proposal.loan.termMonths} payments`}>
              <Money cents={totalOfPaymentsCents} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate assumptions={proposal.savings} />
        </CardContent>
      </Card>
    </main>
  );
}
