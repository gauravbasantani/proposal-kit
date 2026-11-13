import { cn } from "@/lib/utils";
import { Money } from "@/components/Money";

export type PaymentLineProps = {
  /** The monthly payment in whole cents. 16028 is $160.28. */
  monthlyCents: number;
  /** Annual percentage rate as a percent: 5.99 means 5.99% APR. Required: a payment is never shown without it. */
  apr: number;
  /** Loan term in months: 300 is 25 years. Required: a payment is never shown without it. */
  termMonths: number;
  /** Optional heading. Defaults to "Monthly payment". */
  label?: string;
  /** Optional lender or program name, printed under the terms. */
  lender?: string;
  className?: string;
};

const aprFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });

export function formatApr(apr: number): string {
  if (!Number.isFinite(apr) || apr < 0) {
    throw new RangeError(`apr must be a percent of zero or more, got ${String(apr)}.`);
  }
  return `${aprFormat.format(apr)}% APR`;
}

export function formatTerm(termMonths: number): string {
  if (!Number.isInteger(termMonths) || termMonths <= 0) {
    throw new RangeError(`termMonths must be a whole number above zero, got ${String(termMonths)}.`);
  }
  const months = `${termMonths} ${termMonths === 1 ? "month" : "months"}`;
  if (termMonths % 12 !== 0) return months;
  const years = termMonths / 12;
  return `${months} (${years} ${years === 1 ? "year" : "years"})`;
}

/** A monthly payment that always carries its APR and term on the same line. */
export function PaymentLine({ monthlyCents, apr, termMonths, label = "Monthly payment", lender, className }: PaymentLineProps) {
  const terms = `${formatApr(apr)} · ${formatTerm(termMonths)}`;
  return (
    <div data-slot="payment-line" className={cn("grid gap-1", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">
        <Money cents={monthlyCents} />
        <span className="text-base font-normal text-muted-foreground"> per month</span>
      </p>
      <p className="text-sm text-foreground">{terms}</p>
      {lender ? <p className="text-sm text-muted-foreground">{lender}</p> : null}
    </div>
  );
}
