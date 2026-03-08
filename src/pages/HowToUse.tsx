import PublicLayout from "@/components/PublicLayout";
import { UserPlus, Settings, Play, BarChart3 } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "1. Create Account", desc: "Sign up with your email and set up your profile. Enter your activation code if you have one." },
  { icon: Settings, title: "2. Configure Your Study", desc: "Choose your exam, select subjects, and set your study preferences." },
  { icon: Play, title: "3. Start Practicing", desc: "Create custom tests, answer questions, and review detailed explanations." },
  { icon: BarChart3, title: "4. Track Progress", desc: "Monitor your performance through analytics, identify weak areas, and improve." },
];

export default function HowToUse() {
  return (
    <PublicLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold">How to Use MedPrep</h1>
          <p className="mb-12 text-center text-muted-foreground">
            Get started in just a few simple steps
          </p>
          <div className="mx-auto max-w-2xl space-y-8">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
