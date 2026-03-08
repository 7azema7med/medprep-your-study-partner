import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Brain, BarChart3, FileText, CheckCircle, Stethoscope, Clock, Shield, ArrowRight, Star } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem, PageTransition } from "@/components/motion";

const features = [
  { icon: Brain, title: "Smart QBank", desc: "Thousands of clinically-oriented questions with detailed, evidence-based explanations." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Comprehensive progress tracking with subject breakdowns and score trends." },
  { icon: FileText, title: "Medical Library", desc: "High-yield study notes organized by subject and system for efficient review." },
  { icon: CheckCircle, title: "Custom Tests", desc: "Build personalized exam blocks by subject, system, difficulty, and status." },
  { icon: Clock, title: "Timed & Tutor Modes", desc: "Practice under exam conditions or learn interactively with instant feedback." },
  { icon: Shield, title: "Secure & Reliable", desc: "Your progress is saved automatically with encrypted, cloud-based storage." },
];

const stats = [
  { value: "10,000+", label: "Questions" },
  { value: "98%", label: "Student Satisfaction" },
  { value: "50+", label: "Medical Subjects" },
  { value: "24/7", label: "Access" },
];

export default function Landing() {
  return (
    <PublicLayout>
      <PageTransition>
        {/* Hero */}
        <section className="gradient-hero relative overflow-hidden py-20 text-primary-foreground lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_50%)]" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <FadeIn>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Professional Medical Exam Preparation
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="mb-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                  Master Medicine with
                  <span className="block text-white/90">MedPrep</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="mb-8 text-base leading-relaxed text-white/70 md:text-lg">
                  The comprehensive question bank and study platform designed for medical students who demand excellence. Practice smarter, not harder.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" className="gap-2 font-semibold shadow-lg" asChild>
                    <Link to="/signup">Start Free Trial <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 font-semibold text-white hover:bg-white/10" asChild>
                    <Link to="/features">Explore Features</Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border/60 bg-card py-10">
          <div className="container mx-auto px-4">
            <StaggerChildren className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s) => (
                <StaggerItem key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-primary md:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto mb-12 max-w-xl text-center">
              <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
                Everything You Need to Succeed
              </h2>
              <p className="text-sm text-muted-foreground">
                Built by medical educators for medical students — every feature is designed to maximize your learning efficiency.
              </p>
            </FadeIn>
            <StaggerChildren className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <StaggerItem key={f.title}>
                  <div className="group h-full rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/20">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-1.5 text-[15px] font-semibold text-foreground">{f.title}</h3>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Testimonials placeholder */}
        <section className="border-t border-border/60 bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto max-w-xl text-center">
              <h2 className="mb-3 text-2xl font-bold tracking-tight">Trusted by Medical Students</h2>
              <p className="mb-8 text-sm text-muted-foreground">Join thousands of students who improved their scores with MedPrep</p>
            </FadeIn>
            <StaggerChildren className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
              {[
                { name: "Sarah K.", text: "MedPrep's question bank is incredibly well-written. The explanations are detailed and helped me understand concepts deeply." },
                { name: "Ahmed M.", text: "The performance analytics helped me identify my weak areas quickly. I improved my score by 15 points in just 3 months." },
                { name: "Emily R.", text: "The tutor mode is fantastic for learning. I love how the interface is clean and doesn't distract from studying." },
              ].map((t) => (
                <StaggerItem key={t.name}>
                  <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
                    <div className="mb-3 flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}
                    </div>
                    <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">"{t.text}"</p>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto max-w-xl text-center">
              <h2 className="mb-3 text-2xl font-bold tracking-tight">Ready to Start Studying?</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Create your free account and start practicing today.
              </p>
              <Button size="lg" className="gap-2 font-semibold" asChild>
                <Link to="/signup">Create Free Account <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </FadeIn>
          </div>
        </section>
      </PageTransition>
    </PublicLayout>
  );
}
