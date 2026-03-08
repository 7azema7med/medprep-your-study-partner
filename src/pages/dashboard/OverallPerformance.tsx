import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const subjects = [
  { name: "Anatomy", correct: 85, total: 120 },
  { name: "Physiology", correct: 60, total: 90 },
  { name: "Pharmacology", correct: 45, total: 80 },
  { name: "Pathology", correct: 70, total: 100 },
  { name: "Biochemistry", correct: 30, total: 60 },
  { name: "Microbiology", correct: 40, total: 50 },
];

export default function OverallPerformance() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Overall Performance</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Questions", value: "500" },
          { label: "Correct", value: "330" },
          { label: "Overall Score", value: "66%" },
          { label: "Avg Time/Question", value: "72s" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Performance by Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((s) => {
            const pct = Math.round((s.correct / s.total) * 100);
            return (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="font-semibold">{pct}% ({s.correct}/{s.total})</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
