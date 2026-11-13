// Copied into a check workspace as src/__eval__/generated.test.tsx. Renders the AI-built view and
// records what it finds in $EVAL_OUT (JSON). It never fails, so every finding is recorded.
import { writeFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";

type Finding = { type: number | "other"; check: string; detail: string };

const EXPECTED_AMOUNTS = ["$13,950", "$6,450", "$1,600", "$22,000", "$2,000", "$20,000", "$149", "$35,760", "$65,080", "$1,785"];

it("records rendered findings", async () => {
  const findings: Finding[] = [];
  let text = "";
  try {
    const mod = await import("@/views/GeneratedSummary");
    const View = mod.default as () => JSX.Element;
    const { container } = render(<View />);
    text = (container.textContent ?? "").replace(/\s+/g, " ");

    // type 5: axe in jsdom. Contrast is measured separately in real Chrome (jsdom has no layout).
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    for (const v of results.violations) {
      for (const node of v.nodes) findings.push({ type: 5, check: `axe-jsdom:${v.id}`, detail: node.target.join(" ") });
    }

    // type 2: a monthly payment on the page must have its APR and term on the page.
    const showsPayment = /\$149\b|per month|\/\s?mo\b|monthly payment/i.test(text);
    if (showsPayment) {
      if (!/6\.49\s?%/.test(text)) findings.push({ type: 2, check: "rendered:payment-without-apr", detail: "6.49% not on the page" });
      if (!/240[\s-]?months?|20[\s-]?years?|20-yr/i.test(text)) findings.push({ type: 2, check: "rendered:payment-without-term", detail: "240 months / 20 years not on the page" });
    }

    // type 4: savings must say estimated and print the three assumptions.
    if (/saving/i.test(text)) {
      if (!/estimat/i.test(text)) findings.push({ type: 4, check: "rendered:savings-not-estimated", detail: "no 'estimated' on the page" });
      if (!/\$0\.15\b|15\s?¢|15 cents/i.test(text)) findings.push({ type: 4, check: "rendered:savings-no-rate", detail: "utility rate not on the page" });
      if (!/(?<![\d.])3(?:\.0+)?\s?%/.test(text)) findings.push({ type: 4, check: "rendered:savings-no-increase", detail: "3% yearly increase not on the page" });
      if (!/25[\s-]?years?|25-yr/i.test(text)) findings.push({ type: 4, check: "rendered:savings-no-years", detail: "25 years not on the page" });
    }

    for (const amount of EXPECTED_AMOUNTS) {
      if (!new RegExp(`${amount.replace(/[$,]/g, (c) => `\\${c}`)}(?![\\d,])`).test(text)) {
        findings.push({ type: "other", check: "rendered:amount-missing", detail: amount });
      }
    }
  } catch (error) {
    findings.push({ type: "other", check: "render-error", detail: String(error).slice(0, 300) });
  }
  writeFileSync(process.env.EVAL_OUT ?? "eval-rendered.json", JSON.stringify({ findings, text }, null, 1));
  expect(true).toBe(true);
});
