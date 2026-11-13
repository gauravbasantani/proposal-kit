import { CheckCircle2 } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { monthlyPaymentCents } from "@/lib/loan";

// All amounts are whole cents. Every number on the page is derived from this one object.
const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  readyToSign: true,
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  installer: "Brightline Home Solar",
  system: {
    panelCount: 18,
    panelWatts: 410,
    inverter: "One microinverter per panel",
    annualKwh: 11900,
  },
  lineItems: [
    { label: "Panels and inverters", cents: 1395000 },
    { label: "Installation", cents: 645000 },
    { label: "Permits and inspection", cents: 160000 },
  ],
  downPaymentCents: 200000,
  loan: { apr: 6.49, termMonths: 240 },
  savings: { ratePerKwhCents: 15, yearlyIncreasePct: 3, years: 25 },
} as const;

const systemKw = (proposal.system.panelCount * proposal.system.panelWatts) / 1000;
const totalCents = proposal.lineItems.reduce((sum, item) => sum + item.cents, 0);
const financedCents = totalCents - proposal.downPaymentCents;
const monthlyCents = monthlyPaymentCents(financedCents, proposal.loan.apr, proposal.loan.termMonths);
const totalOfPaymentsCents = monthlyCents * proposal.loan.termMonths;

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export default function GeneratedSummary() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Proposal {proposal.id} · Prepared {proposal.preparedOn}
          </p>
          {proposal.readyToSign ? (
            <Badge variant="success">
              <CheckCircle2 aria-hidden="true" />
              Ready to sign
            </Badge>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {proposal.homeowner.name}</h1>
        <p className="text-muted-foreground">
          {proposal.homeowner.address} · Prepared by {proposal.installer}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Your system</h2>
          </CardTitle>
          <CardDescription>
            {proposal.system.panelCount} panels at {proposal.system.panelWatts} W each
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">System size</dt>
              <dd className="text-2xl font-semibold tabular-nums">{numberFormat.format(systemKw)} kW</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">Inverters</dt>
              <dd className="text-base">{proposal.system.inverter}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                Production per year
                <Badge variant="estimate">Estimated</Badge>
              </dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {numberFormat.format(proposal.system.annualKwh)} kWh
              </dd>
            </div>
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
          <dl className="grid gap-2">
            {proposal.lineItems.map((item) => (
              <div key={item.label} className="flex justify-between gap-4">
                <dt>{item.label}</dt>
                <dd>
                  <Money cents={item.cents} />
                </dd>
              </div>
            ))}
          </dl>
          <Separator />
          <dl className="grid gap-2">
            <div className="flex justify-between gap-4 font-semibold">
              <dt>Total price</dt>
              <dd>
                <Money cents={totalCents} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Down payment</dt>
              <dd>
                <Money cents={proposal.downPaymentCents} />
              </dd>
            </div>
            <div className="flex justify-between gap-4 font-semibold">
              <dt>Amount financed</dt>
              <dd>
                <Money cents={financedCents} />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Financing</h2>
          </CardTitle>
          <CardDescription>
            Loan on the amount financed, <Money cents={financedCents} />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <PaymentLine
            monthlyCents={monthlyCents}
            apr={proposal.loan.apr}
            termMonths={proposal.loan.termMonths}
          />
          <Separator />
          <div className="flex justify-between gap-4">
            <p>Total of {proposal.loan.termMonths} payments</p>
            <p className="font-semibold">
              <Money cents={totalOfPaymentsCents} />
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Estimated savings</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsEstimate
            assumptions={{
              annualKwh: proposal.system.annualKwh,
              ratePerKwhCents: proposal.savings.ratePerKwhCents,
              yearlyIncreasePct: proposal.savings.yearlyIncreasePct,
              years: proposal.savings.years,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Next step</h2>
          </CardTitle>
          <CardDescription>
            Review the details above with {proposal.installer} before you sign proposal {proposal.id}.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="lg">Review and sign</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
