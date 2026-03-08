import PublicLayout from "@/components/PublicLayout";
import { Award, Users, TrendingUp, Shield } from "lucide-react";

const reasons = [
  { icon: Award, title: "Expert-Written Content", desc: "All questions and explanations are written and reviewed by board-certified physicians and medical educators." },
  { icon: Users, title: "Trusted by Thousands", desc: "Join a growing community of medical students who rely on MedPrep for their exam preparation." },
  { icon: TrendingUp, title: "Proven Results", desc: "Students using MedPrep consistently score above the national average on their board exams." },
  { icon: Shield, title: "Always Up-to-Date", desc: "Our content is continuously updated to reflect the latest guidelines and exam patterns." },
];

export default function WhyUs() {
  return (
    <PublicLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold">Why Choose MedPrep?</h1>
          <p className="mb-12 text-center text-muted-foreground">
            Here's what sets us apart from other study platforms
          </p>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title} className="flex gap-4 rounded-xl bg-card p-6 shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <r.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
