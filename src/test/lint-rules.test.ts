import { RuleTester, type Rule } from "eslint";
import tseslint from "typescript-eslint";
import plugin from "../../eslint-rules/index.js";

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const rules = plugin.rules as Record<string, Rule.RuleModule>;

tester.run("no-raw-currency (type 1)", rules["no-raw-currency"], {
  valid: [
    `const a = <Money cents={2490000} />;`,
    `const a = <p>21 panels × 400 W</p>;`,
    "const a = `${n} months`;",
  ],
  invalid: [
    { code: `const a = <p>$24,900</p>;`, errors: [{ messageId: "text" }] },
    { code: `const a = <p>Total: {"$24,900"}</p>;`, errors: [{ messageId: "text" }] },
    { code: "const a = <p>${price}</p>;", errors: [{ messageId: "dollarBeforeValue" }] },
    { code: "const a = `$${(c / 100).toFixed(2)}`;", errors: [{ messageId: "dollarBeforeValue" }] },
    { code: `const f = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });`, errors: [{ messageId: "intl" }] },
    { code: `const s = n.toLocaleString("en-US", { style: "currency", currency: "USD" });`, errors: [{ messageId: "intl" }] },
  ],
});

tester.run("payment-needs-terms (type 2)", rules["payment-needs-terms"], {
  valid: [
    `const a = <div><h2>Monthly payment</h2><PaymentLine monthlyCents={16028} apr={5.99} termMonths={300} /></div>;`,
    `const a = <p>Estimated monthly savings</p>;`,
  ],
  invalid: [{ code: `const a = <p><Money cents={16028} />/mo</p>;`, errors: [{ messageId: "bare" }] }],
});

tester.run("tokens-only (type 3)", rules["tokens-only"], {
  valid: [
    `const a = <div className="bg-card text-muted-foreground p-4 rounded-lg" />;`,
    `const a = <p>Proposal #1042</p>;`,
    `const id = "#1042-a";`,
  ],
  invalid: [
    { code: `const a = <div className="bg-green-500" />;`, errors: [{ messageId: "palette" }] },
    { code: `const a = <div className="text-[#0d5c48]" />;`, errors: [{ messageId: "arbitrary" }] },
    { code: `const a = <div style={{ color: "#0d5c48" }} />;`, errors: [{ messageId: "hex" }] },
    { code: `const a = <div style={{ padding: "16px" }} />;`, errors: [{ messageId: "px" }] },
    { code: `const a = <div style={{ padding: 16 }} />;`, errors: [{ messageId: "styleNumber" }] },
    { code: `const brand = "#0d5c48";`, errors: [{ messageId: "hex" }] },
  ],
});

tester.run("savings-needs-estimate (type 4)", rules["savings-needs-estimate"], {
  valid: [
    `const a = <Card><h2>Savings</h2><SavingsEstimate assumptions={a} /></Card>;`,
    `const a = <Button>Save proposal</Button>;`,
  ],
  invalid: [{ code: `const a = <p>25-year savings: <Money cents={8085206} /></p>;`, errors: [{ messageId: "bare" }] }],
});

tester.run("no-color-only-status (type 5)", rules["no-color-only-status"], {
  valid: [
    `const a = <Badge variant="success"><CheckCircle2 aria-hidden="true" />Ready to sign</Badge>;`,
    `const a = <span className="size-2 rounded-full bg-success" aria-label="Ready to sign" />;`,
  ],
  invalid: [{ code: `const a = <span className="size-2 rounded-full bg-success" />;`, errors: [{ messageId: "dot" }] }],
});
