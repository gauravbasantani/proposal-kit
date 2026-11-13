import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { monthlyPaymentCents } from "@/lib/loan";

/** Every number on this page comes from this object. Amounts are whole cents. */
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
  loan: { apr: 6.49, termMonths: 240 },
  savings: {
    annualKwh: 11900,
    ratePerKwhCents: 15,
    yearlyIncreasePct: 3,
    years: 25,
  } satisfies SavingsAssumptions,
};

// Derived, so the page can't disagree with itself.
const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000; // 7.38
const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0); // $22,000
const financedCents = totalCents - proposal.downPaymentCents; // $20,000
const monthlyCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths); // $149.00
const totalOfPaymentsCents = monthlyCents * proposal.loan.termMonths; // $35,760

const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-4 font-semibold" : "flex justify-between gap-4"}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, installer, system, loan } = proposal;

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
        <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
        <p className="text-sm text-muted-foreground">
          {homeowner.address} · Prepared by {installer} on {proposal.preparedOn}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Your system</h2>
            </CardTitle>
            <CardDescription>{kwFormat.format(systemKw)} kW rooftop solar</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 text-sm">
              <Row label="Panels">
                {system.panelCount} × {intFormat.format(system.panelWatts)} W
              </Row>
              <Row label="System size">{kwFormat.format(systemKw)} kW</Row>
              <Row label="Inverters">{system.inverter}</Row>
              <Row label="Estimated production">{intFormat.format(proposal.savings.annualKwh)} kWh a year</Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Price</h2>
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
              <h2 className="text-lg">Loan</h2>
            </CardTitle>
            <CardDescription>
              Financing <Money cents={financedCents} />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PaymentLine monthlyCents={monthlyCents} apr={loan.apr} termMonths={loan.termMonths} />
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
              <h2 className="text-lg">Bill savings</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsEstimate assumptions={proposal.savings} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Proposal {proposal.id} · {installer}
        </p>
        <Button type="button">Review and sign</Button>
      </div>
    </main>
  );
}
