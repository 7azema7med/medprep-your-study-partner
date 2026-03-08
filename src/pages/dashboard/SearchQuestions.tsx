import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useState } from "react";

const questions = [
  { id: 1, text: "A 45-year-old male presents with chest pain radiating to the left arm...", subject: "Cardiology", difficulty: "Medium" },
  { id: 2, text: "Which enzyme is deficient in Gaucher disease?", subject: "Biochemistry", difficulty: "Easy" },
  { id: 3, text: "A 30-year-old woman presents with fatigue, weight gain, and cold intolerance...", subject: "Endocrinology", difficulty: "Medium" },
  { id: 4, text: "What is the mechanism of action of Metformin?", subject: "Pharmacology", difficulty: "Easy" },
  { id: 5, text: "A newborn presents with a machine-like murmur...", subject: "Cardiology", difficulty: "Hard" },
];

export default function SearchQuestions() {
  const [query, setQuery] = useState("");
  const filtered = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(query.toLowerCase()) ||
      q.subject.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Search Questions</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by keyword or subject..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="space-y-3">
        {filtered.map((q) => (
          <Card key={q.id} className="cursor-pointer shadow-card transition-shadow hover:shadow-card-hover">
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div className="flex-1">
                <p className="text-sm">{q.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {q.subject} · {q.difficulty}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                Q{q.id}
              </span>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground">No questions found.</p>
        )}
      </div>
    </div>
  );
}
