import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, FileText } from "lucide-react";

interface Report {
  id: string;
  test_name: string | null;
  score: number | null;
  num_questions: number;
  mode: string;
  time_spent: number | null;
  created_at: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data } = await supabase
        .from("tests")
        .select("id, test_name, score, num_questions, mode, time_spent, created_at")
        .eq("user_id", user!.id)
        .eq("status", "submitted")
        .order("created_at", { ascending: false });
      setReports((data as Report[]) || []);
      setLoading(false);
    }
    fetch();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-xl font-bold text-foreground">Reports</h1>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No completed tests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const score = r.score ? Math.round(Number(r.score)) : 0;
            const correct = Math.round((score / 100) * r.num_questions);
            const incorrect = r.num_questions - correct;
            const time = r.time_spent ? `${Math.floor(r.time_spent / 60)} min` : "—";

            return (
              <Card key={r.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{r.test_name || "Untitled Test"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(r.created_at).toLocaleDateString()} · {time} · {r.mode}
                    </p>
                  </div>
                  <div className="flex gap-6 text-center text-sm">
                    <div>
                      <p className="text-lg font-bold text-primary">{score}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{correct}</p>
                      <p className="text-xs text-muted-foreground">Correct</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-destructive">{incorrect}</p>
                      <p className="text-xs text-muted-foreground">Incorrect</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
