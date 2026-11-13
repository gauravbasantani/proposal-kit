import { render, screen } from "@testing-library/react";
import { PaymentLine, formatApr, formatTerm } from "@/components/PaymentLine";

describe("PaymentLine", () => {
  it("always shows the payment, APR and term together", () => {
    render(<PaymentLine monthlyCents={16_028} apr={5.99} termMonths={300} />);
    expect(screen.getByText("$160.28")).toBeInTheDocument();
    expect(screen.getByText("5.99% APR · 300 months (25 years)")).toBeInTheDocument();
    expect(screen.getByText("Monthly payment")).toBeInTheDocument();
  });

  it("shows 0% APR and odd terms plainly", () => {
    expect(formatApr(0)).toBe("0.00% APR");
    expect(formatTerm(18)).toBe("18 months");
    expect(formatTerm(12)).toBe("12 months (1 year)");
  });

  it("prints the optional lender only when given", () => {
    const { rerender } = render(<PaymentLine monthlyCents={100} apr={1} termMonths={12} />);
    expect(screen.queryByText(/Credit Union/)).toBeNull();
    rerender(<PaymentLine monthlyCents={100} apr={1} termMonths={12} lender="Made-up Credit Union" />);
    expect(screen.getByText("Made-up Credit Union")).toBeInTheDocument();
  });

  it("refuses impossible terms at runtime", () => {
    expect(() => formatApr(-1)).toThrow(RangeError);
    expect(() => formatTerm(0)).toThrow(RangeError);
    expect(() => formatTerm(12.5)).toThrow(RangeError);
  });

  it("will not compile without apr and termMonths", () => {
    // These lines are type errors on purpose. If the props ever become optional,
    // the @ts-expect-error comments become unused and `tsc -b` fails.
    // @ts-expect-error apr and termMonths are required
    const missingBoth = <PaymentLine monthlyCents={16_028} />;
    // @ts-expect-error termMonths is required
    const missingTerm = <PaymentLine monthlyCents={16_028} apr={5.99} />;
    expect(missingBoth).toBeTruthy();
    expect(missingTerm).toBeTruthy();
  });
});
