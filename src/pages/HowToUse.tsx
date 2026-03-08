import PublicLayout from "@/components/PublicLayout";
import { UserPlus, Settings, Play, BarChart3, BookOpen, Notebook, FlaskConical, Target } from "lucide-react";
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";

const steps = [
  { icon: UserPlus, title: "Create Account", desc: "Sign up with your email and set up your profile. Enter your activation code if you have one." },
  { icon: Settings, title: "Configure Study", desc: "Choose your exam focus, select subjects, and set preferences for your learning experience." },
  { icon: Play, title: "Create Tests", desc: "Build custom exam blocks by subject, system, difficulty, and status. Choose timed or tutor mode." },
  { icon: Target, title: "Solve Questions", desc: "Work through realistic medical questions with detailed stems, images, and answer options." },
  { icon: BookOpen, title: "Review Explanations", desc: "After answering, review detailed explanations, educational objectives, and key concepts." },
  { icon: Notebook, title: "Take Notes", desc: "Create personal notes on questions, bookmark important topics, and build your study notebook." },
  { icon: FlaskConical, title: "Use Study Tools", desc: "Access lab values, calculator, highlights, and flashcards during your study sessions." },
  { icon: BarChart3, title: "Track Progress", desc: "Monitor performance with analytics, identify weak areas, and watch your scores improve." },
];

export default function HowToUse() {
  return (
    <PublicLayout>
      <PageTransition>
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto mb-12 max-w-xl text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight">How to Use MedPrep</h1>
              <p className="text-sm text-muted-foreground">Get started in just a few simple steps.</p>
            </FadeIn>
            <StaggerChildren className="mx-auto max-w-2xl space-y-4">
              {steps.map((s, i) => (
                <StaggerItem key={s.title}>
                  <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-sm font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="mb-0.5 text-[15px] font-semibold">{s.title}</h3>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
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
