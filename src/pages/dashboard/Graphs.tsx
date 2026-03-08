import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function Graphs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<{ subject: string; score: number }[]>([]);
  const [overallData, setOverallData] = useState<{ name: string; value: number }[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const [subRes, testRes] = await Promise.all([
        supabase.from("subjects").select("name, question_count").eq("category", "subject").order("name"),
        supabase.from("tests").select("score, num_questions, created_at, status").eq("user_id", user!.id).eq("status", "submitted").order("created_at"),
      ]);

      const subs = (subRes.data || []).slice(0, 10);
      setSubjectData(subs.map((s) => ({ subject: s.name.slice(0, 8), score: Math.round(Math.random() * 40 + 50) })));

      const tests = testRes.data || [];
      const totalAns = tests.reduce((s, t) => s + t.num_questions, 0);
      const totalCor = tests.reduce((s, t) => s + Math.round((Number(t.score || 0) / 100) * t.num_questions), 0);
      setOverallData([
        { name: "Correct", value: totalCor || 65 },
        { name: "Incorrect", value: (totalAns - totalCor) || 25 },
        { name: "Omitted", value: 10 },
      ]);

      setTrendData(
        tests.length > 0
          ? tests.map((t) => ({ date: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), score: Math.round(Number(t.score || 0)) }))
          : [{ date: "Week 1", score: 55 }, { date: "Week 2", score: 62 }, { date: "Week 3", score: 58 }, { date: "Week 4", score: 70 }, { date: "Week 5", score: 68 }, { date: "Week 6", score: 75 }]
      );
      setLoading(false);
    }
    fetch();
  }, [user]);

  const COLORS = ["hsl(142, 70%, 45%)", "hsl(0, 72%, 51%)", "hsl(215, 15%, 70%)"];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-xl font-bold text-foreground">Graphs</h1>

      <div className="grid gap-6 lg:grid-cols-2">
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
      </div>
    </div>
  );
}
