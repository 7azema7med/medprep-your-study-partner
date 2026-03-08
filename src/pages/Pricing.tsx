import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "7 days",
    features: ["50 Practice Questions", "Basic Analytics", "Limited Notes Access"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Monthly",
    price: "$49",
    period: "/month",
    features: ["Full QBank Access", "Advanced Analytics", "Medical Library", "Custom Tests", "Notebook"],
    cta: "Subscribe",
    popular: true,
  },
  {
    name: "Lifetime",
    price: "$299",
    period: "one-time",
    features: ["Everything in Monthly", "Lifetime Updates", "Priority Support", "Early Feature Access"],
    cta: "Get Lifetime",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <PublicLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="mb-12 text-center text-muted-foreground">
            Choose the plan that fits your study needs
          </p>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`relative shadow-card transition-shadow hover:shadow-card-hover ${
                  p.popular ? "border-2 border-primary" : ""
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-muted-foreground"> {p.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={p.popular ? "default" : "outline"} asChild>
                    <Link to="/signup">{p.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
