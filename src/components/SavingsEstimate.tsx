import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Money, formatRatePerKwh } from "@/components/Money";

export type SavingsAssumptions = {
  /** Estimated yearly production that offsets the bill, in kWh. */
  annualKwh: number;
  /** Today's utility rate in cents per kWh: 16 means $0.16. */
  ratePerKwhCents: number;
  /** How much the utility rate rises each year, as a percent: 3 means 3%. */
  yearlyIncreasePct: number;
  /** How many years the estimate covers. */
  years: number;
};

export type SavingsEstimateProps = {
  /** Required. The estimate is computed from these and they are always printed under it. */
  assumptions: SavingsAssumptions;
  /** Optional heading. Defaults to "Estimated bill savings over N years". It always starts with "Estimated". */
  label?: string;
  className?: string;
};

function check(a: SavingsAssumptions): void {
  const bad = (name: string, value: number) => {
    throw new RangeError(`SavingsEstimate: ${name} must be a number of zero or more, got ${String(value)}.`);
  };
  if (!Number.isFinite(a.annualKwh) || a.annualKwh < 0) bad("annualKwh", a.annualKwh);
  if (!Number.isFinite(a.ratePerKwhCents) || a.ratePerKwhCents < 0) bad("ratePerKwhCents", a.ratePerKwhCents);
  if (!Number.isFinite(a.yearlyIncreasePct) || a.yearlyIncreasePct < 0) bad("yearlyIncreasePct", a.yearlyIncreasePct);
  if (!Number.isInteger(a.years) || a.years < 1) {
    throw new RangeError(`SavingsEstimate: years must be a whole number of 1 or more, got ${String(a.years)}.`);
  }
}

/**
 * Year 1 saves annualKwh x rate. Each later year the rate rises by yearlyIncreasePct.
 * Returns whole cents, so the numbers on the page always come from the printed assumptions.
 */
export function estimateSavings(a: SavingsAssumptions): { firstYearCents: number; totalCents: number } {
  check(a);
  const firstYear = a.annualKwh * a.ratePerKwhCents;
  let total = 0;
  for (let year = 0; year < a.years; year++) {
    total += firstYear * Math.pow(1 + a.yearlyIncreasePct / 100, year);
  }
  return { firstYearCents: Math.round(firstYear), totalCents: Math.round(total) };
}

const kwhFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const pctFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function assumptionsText(a: SavingsAssumptions): string {
  const years = `${a.years} ${a.years === 1 ? "year" : "years"}`;
  return (
    `Assumes ${kwhFormat.format(a.annualKwh)} kWh a year at ${formatRatePerKwh(a.ratePerKwhCents)} per kWh, ` +
    `rates rising ${pctFormat.format(a.yearlyIncreasePct)}% a year, over ${years}. Not a guarantee.`
  );
}

/** An estimated savings figure that always says "Estimated" and always prints its assumptions. */
export function SavingsEstimate({ assumptions, label, className }: SavingsEstimateProps) {
  const { firstYearCents, totalCents } = estimateSavings(assumptions);
  const years = `${assumptions.years} ${assumptions.years === 1 ? "year" : "years"}`;
  const heading = label
    ? /^estimated\b/i.test(label)
      ? label
      : `Estimated ${label.charAt(0).toLowerCase()}${label.slice(1)}`
    : `Estimated bill savings over ${years}`;

  return (
    <div data-slot="savings-estimate" className={cn("grid gap-1", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">{heading}</p>
        <Badge variant="estimate">Estimated</Badge>
      </div>
      <p className="text-2xl font-semibold text-foreground">
        <Money cents={totalCents} precision="dollars" />
      </p>
      <p className="text-sm text-foreground">
        First year: <Money cents={firstYearCents} precision="dollars" />
      </p>
      <p className="text-sm text-muted-foreground">{assumptionsText(assumptions)}</p>
    </div>
  );
}
