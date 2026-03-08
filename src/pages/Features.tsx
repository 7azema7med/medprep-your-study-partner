import PublicLayout from "@/components/PublicLayout";
import { Brain, BarChart3, FileText, Search, BookMarked, FlaskConical, Target, Clock } from "lucide-react";
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";

const features = [
  { icon: Brain, title: "Extensive QBank", desc: "Thousands of high-yield questions covering all major medical subjects with detailed explanations and references." },
  { icon: Target, title: "Custom Tests", desc: "Create tests filtered by subject, system, difficulty, and question status. Simulate real exam conditions." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Track your scores, identify weak areas, and monitor progress over time with detailed graphs and reports." },
  { icon: FileText, title: "Medical Library", desc: "Access comprehensive study notes organized by subject with high-yield summaries and illustrations." },
  { icon: Search, title: "Smart Search", desc: "Quickly find questions and topics with our powerful search and filter functionality." },
  { icon: BookMarked, title: "Personal Notebook", desc: "Take notes, bookmark questions, and create personalized study materials for review." },
  { icon: FlaskConical, title: "Lab Values & Tools", desc: "Quick access to laboratory values, calculator, and clinical references during exams." },
  { icon: Clock, title: "Timed & Tutor Modes", desc: "Practice under timed conditions or learn interactively with instant explanations." },
];

export default function Features() {
  return (
    <PublicLayout>
      <PageTransition>
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto mb-12 max-w-xl text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight">Powerful Features</h1>
              <p className="text-sm text-muted-foreground">Everything you need to prepare for your medical exams, in one platform.</p>
            </FadeIn>
            <StaggerChildren className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <StaggerItem key={f.title}>
                  <div className="group h-full rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/20">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-1.5 text-[15px] font-semibold">{f.title}</h3>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
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
