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
      const [subRes, testsWithId] = await Promise.all([
        supabase.from("subjects").select("name, question_count").eq("category", "subject"),
        supabase.from("tests").select("id, score, num_questions, status").eq("user_id", user!.id).eq("status", "submitted"),
      ]);

      const subs = subRes.data || [];
      const tests = testsWithId.data || [];
      const total = subs.reduce((s, r) => s + r.question_count, 0);

      // Get real per-question results
      let realCorrect = 0;
      let realTotal = 0;
      const subjectMap: Record<string, { correct: number; total: number }> = {};

      if (tests.length > 0) {
        const { data: tqs } = await supabase
          .from("test_questions")
          .select("is_correct, questions(subjects(name))")
          .in("test_id", tests.map(t => t.id))
          .not("is_correct", "is", null);

        (tqs || []).forEach((tq: any) => {
          realTotal++;
          if (tq.is_correct) realCorrect++;
          const name = tq.questions?.subjects?.name;
          if (name) {
            if (!subjectMap[name]) subjectMap[name] = { correct: 0, total: 0 };
            subjectMap[name].total++;
            if (tq.is_correct) subjectMap[name].correct++;
          }
        });
      }

      setTotalQ(total);
      setAnswered(realTotal);
      setCorrect(realCorrect);
      setIncorrect(realTotal - realCorrect);
      setSubjects(
        subs.map((s) => ({
          name: s.name,
          correct: subjectMap[s.name]?.correct || 0,
          total: subjectMap[s.name]?.total || 0,
        }))
      );
      setLoading(false);
    }
    fetch();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const scorePercent = answered > 0 ? Math.round((correct / answered) * 100) : 0;

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
          {subjects.filter(s => s.total > 0).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No subject performance data yet. Complete some tests first.</p>
          ) : (
            subjects.filter(s => s.total > 0).map((s) => {
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
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
