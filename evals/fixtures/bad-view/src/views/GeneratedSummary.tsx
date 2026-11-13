// Negative control for the eval checker: one of each mistake, written on purpose.
import { Card, CardContent } from "@/components/ui/card";
import { PaymentLine } from "@/components/PaymentLine";

export default function GeneratedSummary() {
  return (
    <main className="p-4">
      <h1>Solar proposal for Maria Okafor</h1>
      <span className="size-2 rounded-full bg-success" />
      <Card>
        <CardContent>
          <p>Total price: $22,000</p>
          <p style={{ color: "#999999", fontSize: "13px" }}>Down payment {"$2,000"}</p>
          <PaymentLine monthlyCents={14_900} />
          <p>$149.00/mo</p>
          <p>You'll save about $65,080 over 25 years</p>
        </CardContent>
      </Card>
    </main>
  );
}
