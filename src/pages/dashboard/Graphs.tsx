import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, BarChart3 } from "lucide-react";

export default function Graphs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<{ subject: string; score: number }[]>([]);
  const [overallData, setOverallData] = useState<{ name: string; value: number }[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data: tests } = await supabase
        .from("tests")
        .select("score, num_questions, created_at, status")
        .eq("user_id", user!.id)
        .eq("status", "submitted")
        .order("created_at");

      const completedTests = tests || [];

      // Calculate real overall distribution
      const totalAns = completedTests.reduce((s, t) => s + t.num_questions, 0);
      const totalCor = completedTests.reduce((s, t) => s + Math.round((Number(t.score || 0) / 100) * t.num_questions), 0);
      const totalInc = totalAns - totalCor;

      setOverallData([
        { name: "Correct", value: totalCor },
        { name: "Incorrect", value: totalInc },
      ]);

      // Real trend data from completed tests
      setTrendData(
        completedTests.map((t) => ({
          date: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: Math.round(Number(t.score || 0)),
        }))
      );

      // Subject performance - fetch from test_questions with real data
      const { data: testQs } = await supabase
        .from("test_questions")
        .select("is_correct, questions(subject_id, subjects(name))")
        .in("test_id", completedTests.map(t => (t as any).id || ""));

      // We need test IDs - re-fetch with IDs
      const { data: testsWithId } = await supabase
        .from("tests")
        .select("id")
        .eq("user_id", user!.id)
        .eq("status", "submitted");

      if (testsWithId && testsWithId.length > 0) {
        const { data: tqs } = await supabase
          .from("test_questions")
          .select("is_correct, questions(subjects(name))")
          .in("test_id", testsWithId.map(t => t.id));

        const subjectMap: Record<string, { correct: number; total: number }> = {};
        (tqs || []).forEach((tq: any) => {
          const name = tq.questions?.subjects?.name;
          if (!name) return;
          if (!subjectMap[name]) subjectMap[name] = { correct: 0, total: 0 };
          subjectMap[name].total++;
          if (tq.is_correct) subjectMap[name].correct++;
        });

        setSubjectData(
          Object.entries(subjectMap).map(([subject, stats]) => ({
            subject: subject.length > 10 ? subject.slice(0, 10) : subject,
            score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
          }))
        );
      }

      setLoading(false);
    }
    fetch();
  }, [user]);

  const COLORS = ["hsl(142, 70%, 45%)", "hsl(0, 72%, 51%)"];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const hasData = trendData.length > 0 || subjectData.length > 0;

  if (!hasData) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-xl font-bold text-foreground">Graphs</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No data yet. Complete some tests to see your performance graphs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-xl font-bold text-foreground">Graphs</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {subjectData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Score by Subject</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(207, 75%, 42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {overallData.some(d => d.value > 0) && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Overall Distribution</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={overallData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {overallData.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {trendData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Score Trend Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(207, 75%, 42%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
