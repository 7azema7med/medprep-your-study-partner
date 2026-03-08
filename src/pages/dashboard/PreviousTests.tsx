import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";

const tests = [
  { id: 1, date: "2026-03-07", subjects: "Anatomy, Physiology", questions: 40, score: 75, status: "Completed" },
  { id: 2, date: "2026-03-06", subjects: "Pharmacology", questions: 20, score: 82, status: "Completed" },
  { id: 3, date: "2026-03-05", subjects: "Pathology, Biochemistry", questions: 40, score: null, status: "Suspended" },
  { id: 4, date: "2026-03-04", subjects: "Microbiology", questions: 30, score: 68, status: "Completed" },
  { id: 5, date: "2026-03-03", subjects: "All Subjects", questions: 40, score: null, status: "Suspended" },
  { id: 6, date: "2026-03-02", subjects: "Immunology, Genetics", questions: 25, score: 90, status: "Completed" },
];

export default function PreviousTests() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Previous Tests</h1>
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Subjects</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Questions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 text-sm">{t.date}</td>
                    <td className="px-4 py-3 text-sm">{t.subjects}</td>
                    <td className="px-4 py-3 text-center text-sm">{t.questions}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold">
                      {t.score !== null ? `${t.score}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={t.status === "Completed" ? "default" : "secondary"}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm">
                        {t.status === "Suspended" ? (
                          <><Play className="mr-1 h-3 w-3" /> Resume</>
                        ) : (
                          <><RotateCcw className="mr-1 h-3 w-3" /> Review</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
