import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reports = [
  { date: "2026-03-07", test: "Anatomy + Physiology", score: 75, correct: 30, incorrect: 8, omitted: 2, time: "48 min" },
  { date: "2026-03-06", test: "Pharmacology", score: 82, correct: 16, incorrect: 3, omitted: 1, time: "25 min" },
  { date: "2026-03-04", test: "Microbiology", score: 68, correct: 20, incorrect: 8, omitted: 2, time: "35 min" },
  { date: "2026-03-02", test: "Immunology + Genetics", score: 90, correct: 22, incorrect: 2, omitted: 1, time: "30 min" },
];

export default function Reports() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>
      <div className="space-y-4">
        {reports.map((r, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div>
                <p className="font-semibold">{r.test}</p>
                <p className="text-sm text-muted-foreground">{r.date} · {r.time}</p>
              </div>
              <div className="flex gap-6 text-center text-sm">
                <div>
                  <p className="text-lg font-bold text-primary">{r.score}%</p>
                  <p className="text-muted-foreground">Score</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-success">{r.correct}</p>
                  <p className="text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-destructive">{r.incorrect}</p>
                  <p className="text-muted-foreground">Incorrect</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{r.omitted}</p>
                  <p className="text-muted-foreground">Omitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
