import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Brain, BarChart3, FileText, CheckCircle } from "lucide-react";

const features = [
  { icon: Brain, title: "Smart QBank", desc: "Thousands of medical questions with detailed explanations" },
  { icon: BarChart3, title: "Performance Analytics", desc: "Track your progress with detailed reports and graphs" },
  { icon: FileText, title: "Medical Library", desc: "Comprehensive notes and study materials" },
  { icon: CheckCircle, title: "Custom Tests", desc: "Create personalized tests by subject and difficulty" },
];

export default function Landing() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="gradient-hero py-24 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-6 flex justify-center">
              <BookOpen className="h-16 w-16" />
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
              Master Medicine with MedPrep
            </h1>
            <p className="mb-8 text-lg opacity-90 md:text-xl">
              The most comprehensive question bank and study platform for medical students.
              Practice, learn, and excel in your exams.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="text-base font-semibold" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything You Need to Succeed
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <f.icon className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Studying?</h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of medical students already using MedPrep.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
