import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate, type SavingsAssumptions } from "@/components/SavingsEstimate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// All amounts are whole cents.
const proposal = {
  id: "P-2077",
  preparedOn: "November 12, 2026",
  installer: "Brightline Home Solar",
  homeowner: { name: "Maria Okafor", address: "77 Juniper Bend, Lakeport" },
  system: {
    panelCount: 18,
    panelWatts: 410,
    sizeKw: 7.38,
    inverter: "One microinverter per panel",
    annualKwh: 11_900,
  },
  price: {
    lines: [
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

function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-4 font-semibold" : "flex justify-between gap-4 text-sm"}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

export default function GeneratedSummary() {
  const { homeowner, system, price, financing } = proposal;

  return (
    <main className="mx-auto grid max-w-3xl gap-6 bg-background p-6 font-sans text-foreground">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {proposal.installer} · Proposal {proposal.id}
          </p>
          <Badge variant="success">
            <CircleCheck aria-hidden="true" />
            Ready to sign
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold">Solar proposal for {homeowner.name}</h1>
        <p className="text-sm text-muted-foreground">
          {homeowner.address} · Prepared {proposal.preparedOn}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your monthly payment</CardTitle>
            <CardDescription>
              After a <Money cents={financing.downPaymentCents} /> down payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentLine
              monthlyCents={financing.monthlyCents}
              apr={financing.apr}
              termMonths={financing.termMonths}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your savings</CardTitle>
            <CardDescription>Based on the electricity your system produces</CardDescription>
          </CardHeader>
          <CardContent>
            <SavingsEstimate assumptions={savingsAssumptions} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your system</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2">
            <Row label="Panels">
              {system.panelCount} panels at {system.panelWatts} W each
            </Row>
            <Row label="System size">{system.sizeKw} kW</Row>
            <Row label="Inverters">{system.inverter}</Row>
            <Row label="Estimated production">{kwh.format(system.annualKwh)} kWh a year</Row>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Price</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2">
              {price.lines.map((line) => (
                <Row key={line.label} label={line.label}>
                  <Money cents={line.cents} />
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
            <CardTitle>Financing</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2">
              <Row label="Total price">
                <Money cents={price.totalCents} />
              </Row>
              <Row label="Down payment">
                <Money cents={financing.downPaymentCents} />
              </Row>
              <Row label="Amount financed">
                <Money cents={financing.amountFinancedCents} />
              </Row>
              <Separator className="my-1" />
              <Row label={`Total of ${financing.termMonths} payments`} strong>
                <Money cents={financing.totalOfPaymentsCents} />
              </Row>
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              Total of payments covers the amount financed plus interest. It does not include the down payment.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardFooter className="flex-wrap justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Review every figure above before signing. Savings are an estimate, not a guarantee.
          </p>
          <Button size="lg">Review and sign</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
