/** Standard amortized loan payment, rounded to whole cents. */
export function monthlyPaymentCents(principalCents: number, apr: number, termMonths: number): number {
  if (!Number.isInteger(principalCents) || principalCents < 0) throw new RangeError("principalCents must be whole cents");
  if (!Number.isInteger(termMonths) || termMonths <= 0) throw new RangeError("termMonths must be a whole number above zero");
  if (apr === 0) return Math.round(principalCents / termMonths);
  const r = apr / 100 / 12;
  return Math.round((principalCents * r) / (1 - Math.pow(1 + r, -termMonths)));
}
