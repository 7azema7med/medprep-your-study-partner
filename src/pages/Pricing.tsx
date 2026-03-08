import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";

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
    features: ["Full QBank Access", "Advanced Analytics", "Medical Library", "Custom Tests", "Notebook", "Priority Support"],
    cta: "Subscribe",
    popular: true,
  },
  {
    name: "Annual",
    price: "$399",
    period: "/year",
    features: ["Everything in Monthly", "33% Savings", "Lifetime Updates", "Early Feature Access"],
    cta: "Best Value",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <PublicLayout>
      <PageTransition>
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto mb-12 max-w-xl text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
              <p className="text-sm text-muted-foreground">Choose the plan that fits your study needs. Cancel anytime.</p>
            </FadeIn>
            <StaggerChildren className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
              {plans.map((p) => (
                <StaggerItem key={p.name}>
                  <Card className={`relative h-full border-border/60 shadow-card transition-all duration-200 hover:shadow-card-hover ${p.popular ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
                    {p.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                        <Sparkles className="h-3 w-3" /> Most Popular
                      </div>
                    )}
                    <CardHeader className="pb-3 text-center">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{p.price}</span>
                        <span className="text-sm text-muted-foreground"> {p.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="mb-5 space-y-2.5">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-[13px]">
                            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                            <span className="text-muted-foreground">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" size="sm" variant={p.popular ? "default" : "outline"} asChild>
                        <Link to="/signup">{p.cta}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
            <FadeIn className="mx-auto mt-10 max-w-md text-center">
              <p className="text-xs text-muted-foreground">
                Have an activation code? Enter it during registration for instant access.
              </p>
            </FadeIn>
          </div>
        </section>
      </PageTransition>
    </PublicLayout>
  );
}
