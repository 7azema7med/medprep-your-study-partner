import PublicLayout from "@/components/PublicLayout";
import { Award, Users, TrendingUp, Shield, Zap, BookOpen } from "lucide-react";
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";

const reasons = [
  { icon: Award, title: "Expert-Written Content", desc: "All questions and explanations are written and reviewed by board-certified physicians and medical educators." },
  { icon: Users, title: "Trusted by Thousands", desc: "Join a growing community of medical students who rely on MedPrep for their exam preparation." },
  { icon: TrendingUp, title: "Proven Results", desc: "Students using MedPrep consistently score above the national average on their board exams." },
  { icon: Shield, title: "Always Up-to-Date", desc: "Our content is continuously updated to reflect the latest guidelines and exam patterns." },
  { icon: Zap, title: "Integrated Workflow", desc: "Questions, notes, analytics, and study tools all work together seamlessly — no scattered resources." },
  { icon: BookOpen, title: "Study Efficiently", desc: "Smart filtering, performance tracking, and adaptive recommendations help you focus on what matters most." },
];

export default function WhyUs() {
  return (
    <PublicLayout>
      <PageTransition>
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto mb-12 max-w-xl text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight">Why Choose MedPrep?</h1>
              <p className="text-sm text-muted-foreground">Here's what sets us apart from other study platforms.</p>
            </FadeIn>
            <StaggerChildren className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
              {reasons.map((r) => (
                <StaggerItem key={r.title}>
                  <div className="flex gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <r.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[15px] font-semibold">{r.title}</h3>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      </PageTransition>
    </PublicLayout>
  );
}
