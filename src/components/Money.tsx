import { cn } from "@/lib/utils";

/**
 * How many decimals to show.
 * - "auto": cents only when the amount is not whole dollars ($24,900 but $160.28)
 * - "cents": always two decimals ($24,900.00)
 * - "dollars": rounded to whole dollars, half away from zero ($2,218)
 */
export type MoneyPrecision = "auto" | "cents" | "dollars";

export type MoneyProps = {
  /** The amount in whole cents. 2490000 is $24,900. Never pass dollars. */
  cents: number;
  precision?: MoneyPrecision;
  className?: string;
};

const withCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function assertCents(cents: number): void {
  if (!Number.isFinite(cents) || !Number.isInteger(cents)) {
    throw new RangeError(`Money expects whole cents, got ${String(cents)}. 2490000 is $24,900.`);
  }
}

/** The one place in the kit that turns cents into a currency string. */
export function formatMoney(cents: number, precision: MoneyPrecision = "auto"): string {
  assertCents(cents);
  if (precision === "dollars") {
    const dollars = Math.sign(cents) * Math.round(Math.abs(cents) / 100);
    return wholeDollars.format(dollars === 0 ? 0 : dollars);
  }
  if (precision === "auto" && cents % 100 === 0) {
    return wholeDollars.format(cents / 100);
  }
  return withCents.format(cents / 100);
}

/** A utility rate such as 16 cents per kWh, shown as "$0.16". Fractions of a cent are kept ("$0.165"). */
export function formatRatePerKwh(ratePerKwhCents: number): string {
  if (!Number.isFinite(ratePerKwhCents) || ratePerKwhCents < 0) {
    throw new RangeError(`ratePerKwhCents must be zero or more, got ${String(ratePerKwhCents)}.`);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(ratePerKwhCents / 100);
}

/** Every price, payment and savings amount on a proposal goes through this component. */
export function Money({ cents, precision = "auto", className }: MoneyProps) {
  return (
    <span data-slot="money" className={cn("tabular-nums", className)}>
      {formatMoney(cents, precision)}
    </span>
  );
}
