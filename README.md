# proposal-kit

A tiny design system for one solar proposal summary, built so an AI coding tool can't make the
costly mistakes quietly.

**Unofficial sample for the Artemis Design Engineer application; made-up data.** The company,
homeowner and numbers are invented. Nothing here is a quote, and nothing mentions tax credits or
incentives.

I designed it and directed Claude Code, which wrote the code.

- Storybook: https://gauravbasantani.github.io/proposal-kit/
- Stack: Vite, React, TypeScript, Tailwind CSS v4, shadcn/ui (Card, Badge, Button, Separator), Storybook with the a11y addon, Vitest, Testing Library, vitest-axe, ESLint

## The mistakes it designs against

Each one looks finished on screen and is wrong in a signed proposal.

| # | Mistake | What stops it |
|---|---|---|
| 1 | A price typed as a string ("$24,900") instead of `Money` | ESLint `proposal-kit/no-raw-currency` |
| 2 | A monthly payment without its APR and term | `PaymentLine` requires `apr` and `termMonths` (TypeScript), plus `proposal-kit/payment-needs-terms` |
| 3 | A hex color or px value instead of a token | Tailwind palette switched off, `proposal-kit/tokens-only`, `scripts/check-tokens.mjs` |
| 4 | Savings with no "Estimated" label or assumptions | `SavingsEstimate` requires `assumptions` and always prints them, plus `proposal-kit/savings-needs-estimate` |
| 5 | Status by color alone, or contrast under 4.5:1 | `proposal-kit/no-color-only-status`, token contrast test (light and dark), vitest-axe on the reference view |

## What's in it

- `src/components/Money.tsx`, `PaymentLine.tsx`, `SavingsEstimate.tsx`: the three components
- `src/components/ui/`: shadcn/ui Card, Badge, Button, Separator (copied from shadcn source and moved onto the tokens)
- `src/styles/tokens.css`: color, type, spacing and radius tokens, light and dark. The only file allowed hex or px.
- `src/views/ProposalSummary.tsx`: the reference view, built only from the kit
- `AGENTS.md`, `components.json`, `llms.txt`: the layer an AI tool reads
- `eslint-rules/index.js`: the five custom rules
- `evals/`: fresh Claude Code runs with and without the AI layer, and what the checks caught

Note: shadcn's CLI also uses a file called `components.json`. Here that name holds the component
manifest for AI tools, and the four shadcn components were added by hand, so the shadcn CLI is not used.

## Run it

```sh
npm ci
npm run check            # tsc, eslint (with the kit's rules), token check, vitest
npm run storybook        # http://localhost:6006
npm run build-storybook  # static Storybook in storybook-static/
```

GitHub Actions runs `npm run check` on every push and publishes Storybook to GitHub Pages from `main`.
