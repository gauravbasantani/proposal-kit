# AGENTS.md: rules for an AI building views with proposal-kit

A proposal is something a homeowner signs. Every rule below stops a mistake that looks
finished on screen and is wrong on paper. Read `components.json` for every prop.

## Use only these

- `Money` for every amount: `<Money cents={2490000} />` shows $24,900. Pass **whole cents**, never dollars.
- `PaymentLine` for every monthly payment: `<PaymentLine monthlyCents={16028} apr={5.99} termMonths={300} />`.
  `apr` and `termMonths` are required. The APR and term print on the same line as the payment.
- `SavingsEstimate` for every savings figure:
  `<SavingsEstimate assumptions={{ annualKwh: 13860, ratePerKwhCents: 16, yearlyIncreasePct: 3, years: 25 }} />`.
  It computes the figure, says "Estimated" and prints the assumptions. Do not pass your own savings number.
- shadcn/ui `Card`, `Badge`, `Button`, `Separator` from `@/components/ui/*` for layout and status.

## Never

1. Type a currency string (`"$24,900"`, `` `$${price}` ``, `<p>${price}</p>`) or format currency yourself
   (`Intl.NumberFormat` or `toLocaleString` with `style: "currency"`). Use `Money`.
2. Show a monthly payment ("/mo", "per month") without `PaymentLine`.
3. Use a hex, rgb or px value, an inline style size, an arbitrary value like `text-[#0d5c48]`, or a Tailwind
   palette class like `bg-green-500` (the palette is switched off, so it would render unstyled). Use the token
   classes: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border`,
   `bg-primary text-primary-foreground`, `bg-success text-success-foreground`, `bg-estimate text-estimate-foreground`.
   Spacing, type and radius classes (`p-4`, `text-sm`, `rounded-lg`) are tokens too.
4. Show savings without `SavingsEstimate`, drop the word "Estimated", or hide the assumptions.
5. Show a status by color alone. Use `<Badge variant="success"><CheckCircle2 aria-hidden="true" />Ready to sign</Badge>`.
   Use one `h1`, then `h2` per card. Keep text on token colors; they are all 4.5:1 or better in light and dark.

Do not mention tax credits, rebates or incentive amounts.

## Data

Keep amounts as whole cents in one data object at the top of the file. Derive totals from it
(line items add up to the price; price minus down payment is the amount financed), so every number
on the page comes from the same source.

## Check

`npm run check` runs TypeScript (required props), ESLint with the `proposal-kit/*` rules, the token
check and the tests. A view is done when it passes.
