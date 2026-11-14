import { CheckCircle2, FileText, PenLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/Money";
import { PaymentLine } from "@/components/PaymentLine";
import { SavingsEstimate } from "@/components/SavingsEstimate";
import { sampleProposal, totals, type Proposal } from "@/data/sample-proposal";

export const SAMPLE_LABEL = "Unofficial sample; made-up data.";

const kwFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const intFormat = new Intl.NumberFormat("en-US");

/** The reference view: a homeowner's solar proposal summary, built only from Money, PaymentLine and SavingsEstimate. */
export function ProposalSummary({ proposal = sampleProposal }: { proposal?: Proposal }) {
  const t = totals(proposal);
  const { homeowner, system, loan } = proposal;

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-5 px-4 py-6 sm:px-6">
      <p className="text-xs text-muted-foreground">{SAMPLE_LABEL}</p>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">
            {proposal.installer} · <span className="whitespace-nowrap">Proposal {proposal.id}</span> · {proposal.preparedOn}
          </p>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Solar proposal for {homeowner.name}</h1>
          <p className="text-sm text-muted-foreground">{homeowner.address}</p>
        </div>
        <Badge variant={proposal.status === "Ready to sign" ? "success" : "secondary"} className="text-sm">
          {proposal.status === "Ready to sign" ? <CheckCircle2 aria-hidden="true" /> : <FileText aria-hidden="true" />}
          {proposal.status}
        </Badge>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Your system</h2>
            </CardTitle>
            <CardDescription>What goes on the roof</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-2xl font-semibold text-foreground">{kwFormat.format(t.systemKw)} kW</p>
            <Separator />
            <dl className="grid gap-2 text-sm">
              <div className="flex flex-wrap justify-between gap-x-4">
                <dt className="text-muted-foreground">Panels</dt>
                <dd className="ml-auto text-right text-foreground">
                  {intFormat.format(system.panels)} × {intFormat.format(system.panelWatts)} W
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-4">
                <dt className="text-muted-foreground">Inverters</dt>
                <dd className="ml-auto text-right text-foreground">{system.inverter}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-4">
                <dt className="text-muted-foreground">Estimated production</dt>
                <dd className="ml-auto text-right text-foreground">{intFormat.format(proposal.savings.annualKwh)} kWh a year</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Price</h2>
            </CardTitle>
            <CardDescription>Before any loan</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <dl className="grid gap-2 text-sm">
              {proposal.lineItems.map((item) => (
                <div key={item.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="text-foreground">
                    <Money cents={item.cents} />
                  </dd>
                </div>
              ))}
            </dl>
            <Separator />
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4 text-base font-semibold">
                <dt>Total price</dt>
                <dd>
                  <Money cents={t.priceCents} />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Down payment</dt>
                <dd>
                  <Money cents={proposal.downPaymentCents} />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Amount financed</dt>
                <dd>
                  <Money cents={t.financedCents} />
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Payment</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <PaymentLine monthlyCents={t.monthlyCents} apr={loan.apr} termMonths={loan.termMonths} lender={loan.lender} />
            <Separator />
            <p className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Total of {loan.termMonths} payments</span>
              <Money cents={t.totalOfPaymentsCents} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">Savings</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsEstimate assumptions={proposal.savings} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button>
          <PenLine aria-hidden="true" />
          Review and sign
        </Button>
        <Button variant="outline">
          <FileText aria-hidden="true" />
          Download PDF
        </Button>
      </div>
    </main>
  );
}
