import { render, screen } from "@testing-library/react";
import { Money, formatMoney, formatRatePerKwh } from "@/components/Money";

describe("Money", () => {
  it("renders whole dollars without .00 by default", () => {
    render(<Money cents={2_490_000} />);
    expect(screen.getByText("$24,900")).toBeInTheDocument();
  });

  it("keeps cents when the amount has them", () => {
    expect(formatMoney(16_028)).toBe("$160.28");
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toBe("$0");
    expect(formatMoney(0, "cents")).toBe("$0.00");
  });

  it("formats long numbers with separators", () => {
    expect(formatMoney(123_456_789_012)).toBe("$1,234,567,890.12");
  });

  it("rounds half away from zero in dollars mode", () => {
    expect(formatMoney(221_750, "dollars")).toBe("$2,218");
    expect(formatMoney(-221_750, "dollars")).toBe("-$2,218");
    expect(formatMoney(-49, "dollars")).toBe("$0");
  });

  it("refuses dollars or fractions of a cent", () => {
    expect(() => formatMoney(249.5)).toThrow(RangeError);
    expect(() => formatMoney(Number.NaN)).toThrow(RangeError);
  });

  it("formats a utility rate per kWh", () => {
    expect(formatRatePerKwh(16)).toBe("$0.16");
    expect(formatRatePerKwh(16.5)).toBe("$0.165");
  });
});
