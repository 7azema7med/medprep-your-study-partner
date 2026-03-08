import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileQuestion, BookOpen, TrendingUp, Key, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { adminApi } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardStats(),
      adminApi.getAnalytics(),
    ]).then(([s, a]) => { setStats(s); setAnalytics(a); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-14 rounded bg-muted" /></CardContent></Card>)}
      </div>
    </div>
  );

  const summaryCards = [
    { label: "Users", value: stats?.total_users || 0, icon: Users, accent: "bg-primary/10 text-primary" },
    { label: "Questions", value: analytics?.total_questions || 0, icon: FileQuestion, accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Tests", value: analytics?.total_tests || 0, icon: BookOpen, accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Active Subs", value: analytics?.active_subscriptions || 0, icon: CreditCard, accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  ];

  const subjectData = (analytics?.subjects || []).map((s: any) => ({ name: s.name?.slice(0, 15), questions: s.question_count }));

  const testScores = (analytics?.recent_tests || [])
    .filter((t: any) => t.score != null)
    .slice(0, 20)
    .map((t: any, i: number) => ({ name: `T${i + 1}`, score: Number(t.score) }));

  const completionData = [
    { name: "Completed", value: analytics?.completed_tests || 0 },
    { name: "In Progress", value: (analytics?.total_tests || 0) - (analytics?.completed_tests || 0) },
  ];

  const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground) / 0.3)"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Platform metrics and performance data</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.accent}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{c.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Questions by Subject</CardTitle></CardHeader>
          <CardContent>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjectData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="questions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No subject data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Test Completion</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} className="text-xs">
                    {completionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm font-semibold">Recent Test Scores</CardTitle></CardHeader>
          <CardContent>
            {testScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={testScores}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No test score data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
