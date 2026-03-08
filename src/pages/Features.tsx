import PublicLayout from "@/components/PublicLayout";
import { Brain, BarChart3, FileText, Search, BookMarked, FlaskConical, Target, Clock } from "lucide-react";

const features = [
  { icon: Brain, title: "Extensive QBank", desc: "Thousands of high-yield questions covering all major medical subjects with detailed explanations and references." },
  { icon: Target, title: "Custom Tests", desc: "Create tests filtered by subject, system, difficulty, and question status. Simulate real exam conditions." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Track your scores, identify weak areas, and monitor progress over time with detailed graphs and reports." },
  { icon: FileText, title: "Medical Library", desc: "Access comprehensive study notes organized by subject with high-yield summaries and illustrations." },
  { icon: Search, title: "Smart Search", desc: "Quickly find questions and topics with our powerful search functionality." },
  { icon: BookMarked, title: "Personal Notebook", desc: "Take notes, bookmark questions, and create personalized study materials." },
  { icon: FlaskConical, title: "Lab Values & References", desc: "Quick access to laboratory values, drug dosages, and clinical references." },
  { icon: Clock, title: "Timed Mode", desc: "Practice under timed conditions to build speed and confidence for exam day." },
];

export default function Features() {
  return (
    <PublicLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold">Powerful Features</h1>
          <p className="mb-12 text-center text-muted-foreground">
            Everything you need to prepare for your medical exams
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
                <f.icon className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
