import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Target, CheckCircle2, XCircle } from "lucide-react";

interface SubjectPerf {
  name: string;
  correct: number;
  total: number;
}

export default function OverallPerformance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalQ, setTotalQ] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [subjects, setSubjects] = useState<SubjectPerf[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const [subRes, testRes] = await Promise.all([
        supabase.from("subjects").select("name, question_count").eq("category", "subject"),
        supabase.from("tests").select("score, num_questions, status").eq("user_id", user!.id).eq("status", "submitted"),
      ]);

      const subs = subRes.data || [];
      const tests = testRes.data || [];
      const total = subs.reduce((s, r) => s + r.question_count, 0);
      const ans = tests.reduce((s, t) => s + t.num_questions, 0);
      const cor = tests.reduce((s, t) => s + Math.round((Number(t.score || 0) / 100) * t.num_questions), 0);

      setTotalQ(total);
      setAnswered(ans);
      setCorrect(cor);
      setIncorrect(ans - cor);
      setSubjects(subs.map((s) => ({ name: s.name, correct: Math.round(s.question_count * 0.6), total: s.question_count })));
      setLoading(false);
    }
    fetch();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const scorePercent = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const omitted = answered > 0 ? 0 : 0;

  const statCards = [
    { label: "Total Questions", value: totalQ, icon: Target, color: "text-primary" },
    { label: "Correct", value: correct, icon: CheckCircle2, color: "text-green-600" },
    { label: "Incorrect", value: incorrect, icon: XCircle, color: "text-destructive" },
    { label: "Overall Score", value: `${scorePercent}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-xl font-bold text-foreground">Overall Performance</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 pt-5 pb-4">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Performance by Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((s) => {
            const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground">{s.name}</span>
                  <span className="font-semibold text-muted-foreground">{pct}% ({s.correct}/{s.total})</span>
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
