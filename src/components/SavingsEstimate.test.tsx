import { render, screen } from "@testing-library/react";
import { SavingsEstimate, estimateSavings, assumptionsText } from "@/components/SavingsEstimate";

const assumptions = { annualKwh: 13_860, ratePerKwhCents: 16, yearlyIncreasePct: 3, years: 25 };

describe("SavingsEstimate", () => {
  it("computes the estimate from the assumptions it prints", () => {
    const { firstYearCents, totalCents } = estimateSavings(assumptions);
    expect(firstYearCents).toBe(221_760);
    // 221,760 x (1.03^25 - 1) / 0.03
    expect(totalCents).toBe(Math.round((221_760 * (Math.pow(1.03, 25) - 1)) / 0.03));
  });

  it("always says Estimated and always prints the assumptions", () => {
    render(<SavingsEstimate assumptions={assumptions} />);
    expect(screen.getByText("Estimated bill savings over 25 years")).toBeInTheDocument();
    expect(screen.getByText("Estimated")).toBeInTheDocument();
    expect(screen.getByText("$80,852")).toBeInTheDocument();
    expect(
      screen.getByText("Assumes 13,860 kWh a year at $0.16 per kWh, rates rising 3% a year, over 25 years. Not a guarantee."),
    ).toBeInTheDocument();
  });

  it("puts Estimated in front of a custom label", () => {
    render(<SavingsEstimate assumptions={assumptions} label="Savings over 25 years" />);
    expect(screen.getByText("Estimated savings over 25 years")).toBeInTheDocument();
  });

  it("handles zero savings", () => {
    render(<SavingsEstimate assumptions={{ ...assumptions, annualKwh: 0 }} />);
    expect(screen.getAllByText("$0").length).toBe(2);
  });

  it("refuses bad assumptions", () => {
    expect(() => estimateSavings({ ...assumptions, years: 0 })).toThrow(RangeError);
    expect(() => estimateSavings({ ...assumptions, ratePerKwhCents: -1 })).toThrow(RangeError);
    expect(assumptionsText({ ...assumptions, years: 1 })).toContain("over 1 year.");
  });

  it("will not compile without assumptions", () => {
    // @ts-expect-error assumptions is required
    const missing = <SavingsEstimate />;
    expect(missing).toBeTruthy();
  });
});
