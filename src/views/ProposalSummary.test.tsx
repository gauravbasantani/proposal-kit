import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ProposalSummary, SAMPLE_LABEL } from "@/views/ProposalSummary";
import { sampleProposal, totals } from "@/data/sample-proposal";

describe("ProposalSummary (reference view)", () => {
  it("has no axe violations", async () => {
    const { container } = render(<ProposalSummary />);
    // jsdom has no layout or canvas, so axe cannot measure contrast here. Contrast is covered by
    // src/styles/tokens.test.ts (every token pair, light and dark) and by the real-Chrome axe run in evals/.
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("labels itself as an unofficial sample with made-up data", () => {
    render(<ProposalSummary />);
    expect(screen.getByText(SAMPLE_LABEL)).toBeInTheDocument();
  });

  it("adds up: line items = price, price - down payment = financed, payment x term = total of payments", () => {
    const t = totals(sampleProposal);
    expect(t.priceCents).toBe(2_490_000);
    expect(t.financedCents).toBe(2_490_000);
    expect(t.monthlyCents).toBe(16_028);
    expect(t.totalOfPaymentsCents).toBe(4_808_400);
    expect(t.systemKw).toBe(8.4);
    render(<ProposalSummary />);
    expect(screen.getAllByText("$24,900").length).toBe(2);
    expect(screen.getByText("$48,084")).toBeInTheDocument();
    expect(screen.getByText("8.4 kW")).toBeInTheDocument();
  });

  it("shows status in words, not color alone", () => {
    render(<ProposalSummary />);
    expect(screen.getByText("Ready to sign")).toBeInTheDocument();
  });
});
