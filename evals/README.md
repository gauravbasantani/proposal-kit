# Eval: does the AI layer stop the costly mistakes?

Fresh Claude Code runs build the same proposal summary page. Five runs get the kit **without**
its AI layer, five get it **with** it. Then the same checks run on every output and count the
mistakes by type. The counts below are copied from `runs/<round>/summary.json` as the checks
produced them.

## Setup

- **Prompt:** `prompt-round1.txt` (round 1) and `prompt-round2.txt` (round 2). Made-up homeowner data
  that adds up: line items $13,950 + $6,450 + $1,600 = $22,000; minus $2,000 down = $20,000 financed;
  6.49% APR over 240 months is $149.00 a month; 240 × $149.00 = $35,760; 11,900 kWh at $0.15 rising 3%
  a year for 25 years is $65,080 ($1,785 the first year).
- **Command:** `command.txt`. `claude -p` (Claude Code 2.1.323, default model `claude-opus-5-5`),
  `--restricted` (no Bash, no web, no user or project settings), `--strict-mcp-config` (no MCP servers),
  file tools only (Read, Write, Edit, Glob, Grep) confined to the run's own copy, `--permission-mode acceptEdits`,
  15-minute timeout, $4 budget cap per run.
- **Copies:** `harness/make-copy.mjs`. Each run gets a fresh copy in a folder outside this repo, so
  it can't find this repo's own AGENTS.md by walking up the tree.
  - **Both conditions:** `src/components` (Money, PaymentLine, SavingsEstimate, the shadcn/ui
    primitives), `src/lib`, `src/styles` (tokens), `package.json`, `tsconfig*.json`, `vite.config.ts`.
    No reference view, no tests, no lint rules, so no run can copy the answer or read the checks.
  - **"With" adds:** `AGENTS.md`, `components.json`, `llms.txt`, the Storybook stories and
    `.storybook/` (the "For AI tools" docs block).
- **Runs:** `harness/run-round.sh`, 5 pairs, each pair run at the same time.
- **Re-running the checks:** `node evals/harness/check-run.mjs <run-copy> <run-output> <work-dir>` with
  `PLAYWRIGHT_NODE_MODULES` set to a `node_modules` folder that has Playwright (used for the Chrome contrast step).

## How each mistake type is detected

`harness/check-run.mjs` copies what the run wrote into a fresh copy of the full kit and runs the
checks. Each check counts toward exactly one type.

| Type | Mistake | Checks that count toward it |
|---|---|---|
| 1 | Price typed as a string instead of `Money` | ESLint `proposal-kit/no-raw-currency` ("$" + digits in JSX text or strings, "$" next to a value, `Intl.NumberFormat` / `toLocaleString` with `style: "currency"`) |
| 2 | Payment without APR and term | TypeScript errors located on a `<PaymentLine>` (missing `apr` / `termMonths`); ESLint `proposal-kit/payment-needs-terms` ("/mo", "per month", "monthly" text in a file with no `<PaymentLine>`); rendered page shows a payment but not "6.49%" or "240 months / 20 years" |
| 3 | Hex or px instead of a token | ESLint `proposal-kit/tokens-only` (hex, rgb/hsl, px, inline style sizes, arbitrary values like `text-[#0d5c48]`, Tailwind palette classes like `bg-green-500`); `scripts/check-tokens.mjs` on any CSS the run wrote |
| 4 | Savings without "Estimated" and assumptions | TypeScript errors located on a `<SavingsEstimate>`; ESLint `proposal-kit/savings-needs-estimate` (savings text in a file with no `<SavingsEstimate>`); rendered page mentions savings but not "estimated", the $0.15 rate, the 3% increase or 25 years |
| 5 | Accessibility miss | ESLint `proposal-kit/no-color-only-status` (an empty colored dot); axe in jsdom on the rendered page (every rule except contrast, which jsdom can't measure); axe `color-contrast` in real Chrome, light and dark |
| other | Not one of the five | any other TypeScript or ESLint error, a render error, an expected amount missing from the page, a kit file the run changed. Shown, not counted in 1 to 5. |

"Instances" counts every finding; "runs with it" counts runs with at least one finding of that type.

**Negative control.** `fixtures/bad-view/` is a page written by hand with one of each mistake. The
checker finds all five types in it (`fixtures/bad-view-result/check.log`): 4 × type 1, 1 × type 2,
2 × type 3, 1 × type 4, 1 × type 5, plus a render error because `PaymentLine` refuses to render
without `apr`.

## Limits of the checks

- The payment and savings checks work per file and per page. A file that renders one
  `<SavingsEstimate>` can still show a second savings number in its own markup and pass. Round 2
  `without-2` does this: a "First year at a glance" card repeats the $1,785 estimate with `Money`
  (and labels it Estimated). Such cases are not counted.
- Color-only status is detected only as an empty colored dot. Other color-only patterns are not.
- A run could only read and write files, so no run could run `npm run check` on its own work.

## Harness fixes made before the final count (all 20 runs re-checked after them)

1. The Chrome contrast step first loaded the built page from `file://`, where Chrome does not run
   module scripts, so it measured a blank page. It now serves the page over http and records
   `chrome-blank-render` as "other" if the page is empty.
2. "Kit files the run changed" first compared the run's copy to the current kit, which blamed two
   round 2 runs for an edit made to `.storybook/ForAITools.tsx` after their copies were taken. It
   now counts only files the run itself wrote or edited, read from the transcript.
3. The Chrome step switched to dark mode and measured at once, while the button's `transition-colors`
   fade was still running, so one button read 2.21:1. CSS transitions are now off during the measure.

## Files

- `runs/<round>/<condition>-<n>/transcript.jsonl`: the full run (stream-json), local folder paths
  replaced with `<work>`
- `runs/<round>/<condition>-<n>/output/`: every file the run wrote
- `runs/<round>/<condition>-<n>/check.log` and `results.json`: every check's output and the findings
- `runs/<round>/<condition>-<n>/render-light.png`, `render-dark.png`: the page the run built
- `runs/<round>/summary.json`: the counts in the tables below

## Results (real counts, copied from summary.json)

**What changed between rounds.** Round 1's prompt ended with "Use the components in this repo." The
docs made no difference in round 1, and that line told every run where the answer was, so round 2
removes it and keeps everything else the same (`prompt-round2.txt`). The kit and the docs did not
change between rounds.

**Plain reading.** Mistake types 1 to 4 never happened, in 20 of 20 runs, with or without the docs.
Every run, with or without docs, read the three component files and used `Money`, `PaymentLine` and
`SavingsEstimate`. The required props and the computed values in the components did that work, so
the docs had nothing left to prevent. The one mistake that got through was the same every time: a
`Separator` placed directly inside a `<dl>` (axe `definition-list`, type 5). It looked fine on
screen. It showed up in 5 of 10 runs without the docs and 1 of 10 with them. The docs never mention
`<dl>` or this pattern, and these are 5-run samples, so this is not proof that the docs helped.
What it does show: the checks caught a real mistake that a person reviewing the screen would miss.
Next step (not done here): a lint rule or a `Separator` that refuses to sit inside a `<dl>`.

Who read the docs: in round 1, 4 of 5 "with" runs opened `AGENTS.md` and 2 opened `components.json`;
in round 2, 1 of 5 opened `AGENTS.md` and 4 opened `components.json`. Cost was $0.24 to $0.36 per run.

### round1

| Mistake type | Without docs: runs with it (of 5) | Without: instances | With docs: runs with it (of 5) | With: instances |
|---|---|---|---|---|
| 1. Price typed as a string, not Money | 0 | 0 | 0 | 0 |
| 2. Payment without APR and term | 0 | 0 | 0 | 0 |
| 3. Hex or px instead of a token | 0 | 0 | 0 | 0 |
| 4. Savings without Estimated and assumptions | 0 | 0 | 0 | 0 |
| 5. Accessibility miss (color-only status, contrast, axe) | 1 | 2 | 0 | 0 |
| Other (build errors, missing amounts, changed kit files) | 0 | 0 | 0 | 0 |

| Run | 1 | 2 | 3 | 4 | 5 | other | read AGENTS.md | read components.json | cost (USD) |
|---|---|---|---|---|---|---|---|---|---|
| without-1 | 0 | 0 | 0 | 0 | 0 | 0 | no | no | 0.34 |
| without-2 | 0 | 0 | 0 | 0 | 0 | 0 | no | no | 0.27 |
| without-3 | 0 | 0 | 0 | 0 | 2 | 0 | no | no | 0.30 |
| without-4 | 0 | 0 | 0 | 0 | 0 | 0 | no | no | 0.31 |
| without-5 | 0 | 0 | 0 | 0 | 0 | 0 | no | no | 0.28 |
| with-1 | 0 | 0 | 0 | 0 | 0 | 0 | yes | no | 0.29 |
| with-2 | 0 | 0 | 0 | 0 | 0 | 0 | yes | yes | 0.34 |
| with-3 | 0 | 0 | 0 | 0 | 0 | 0 | yes | yes | 0.33 |
| with-4 | 0 | 0 | 0 | 0 | 0 | 0 | yes | no | 0.25 |
| with-5 | 0 | 0 | 0 | 0 | 0 | 0 | no | no | 0.24 |

### round2

| Mistake type | Without docs: runs with it (of 5) | Without: instances | With docs: runs with it (of 5) | With: instances |
|---|---|---|---|---|
| 1. Price typed as a string, not Money | 0 | 0 | 0 | 0 |
| 2. Payment without APR and term | 0 | 0 | 0 | 0 |
| 3. Hex or px instead of a token | 0 | 0 | 0 | 0 |
| 4. Savings without Estimated and assumptions | 0 | 0 | 0 | 0 |
| 5. Accessibility miss (color-only status, contrast, axe) | 4 | 7 | 1 | 1 |
| Other (build errors, missing amounts, changed kit files) | 0 | 0 | 0 | 0 |

| Run | 1 | 2 | 3 | 4 | 5 | other | read AGENTS.md | read components.json | cost (USD) |
|---|---|---|---|---|---|---|---|---|---|
| without-1 | 0 | 0 | 0 | 0 | 0 | 0 | no | no | 0.36 |
| without-2 | 0 | 0 | 0 | 0 | 2 | 0 | no | no | 0.31 |
| without-3 | 0 | 0 | 0 | 0 | 2 | 0 | no | no | 0.31 |
| without-4 | 0 | 0 | 0 | 0 | 2 | 0 | no | no | 0.35 |
| without-5 | 0 | 0 | 0 | 0 | 1 | 0 | no | no | 0.31 |
| with-1 | 0 | 0 | 0 | 0 | 0 | 0 | yes | yes | 0.35 |
| with-2 | 0 | 0 | 0 | 0 | 0 | 0 | no | yes | 0.28 |
| with-3 | 0 | 0 | 0 | 0 | 0 | 0 | no | yes | 0.32 |
| with-4 | 0 | 0 | 0 | 0 | 0 | 0 | no | yes | 0.31 |
| with-5 | 0 | 0 | 0 | 0 | 1 | 0 | no | no | 0.26 |
