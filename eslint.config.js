import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import proposalKit from "./eslint-rules/index.js";

export default tseslint.config(
  { ignores: ["dist", "storybook-static", "node_modules", "evals/runs/**", "evals/fixtures/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
  },
  {
    // The kit's own rules apply to every view and story.
    files: ["src/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
    plugins: { "proposal-kit": proposalKit },
    rules: {
      "proposal-kit/no-raw-currency": "error",
      "proposal-kit/payment-needs-terms": "error",
      "proposal-kit/tokens-only": "error",
      "proposal-kit/savings-needs-estimate": "error",
      "proposal-kit/no-color-only-status": "error",
    },
  },
  {
    // Money.tsx is the one place allowed to format currency.
    files: ["src/components/Money.tsx"],
    rules: { "proposal-kit/no-raw-currency": "off" },
  },
  {
    // The components themselves are where payment and savings text is allowed to live.
    files: ["src/components/PaymentLine.tsx"],
    rules: { "proposal-kit/payment-needs-terms": "off" },
  },
  {
    files: ["src/components/SavingsEstimate.tsx"],
    rules: { "proposal-kit/savings-needs-estimate": "off" },
  },
  {
    // Tests feed bad examples on purpose.
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "proposal-kit/no-raw-currency": "off",
      "proposal-kit/payment-needs-terms": "off",
      "proposal-kit/tokens-only": "off",
      "proposal-kit/savings-needs-estimate": "off",
      "proposal-kit/no-color-only-status": "off",
    },
  },
  {
    files: ["eslint-rules/**/*.js", "scripts/**/*.{js,mjs}", "*.js"],
    languageOptions: { globals: globals.node },
  },
);
