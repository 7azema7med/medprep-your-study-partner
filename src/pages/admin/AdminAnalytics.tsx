import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileQuestion, BookOpen, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { adminApi } from "@/lib/admin-api";

const PIE_COLORS = ["hsl(207, 75%, 42%)", "hsl(142, 70%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;

  const contentData = [
    { name: "Questions", value: stats?.total_questions || 0 },
    { name: "Tests", value: stats?.total_tests || 0 },
    { name: "Notes", value: stats?.total_notes || 0 },
  ];

  const accessData = [
    { name: "Active Subs", value: stats?.active_subscriptions || 0 },
    { name: "Active Codes", value: stats?.active_codes || 0 },
    { name: "Admins", value: stats?.admin_count || 0 },
    { name: "Total Users", value: stats?.total_users || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: stats?.total_users || 0, icon: Users },
          { label: "Questions", value: stats?.total_questions || 0, icon: FileQuestion },
          { label: "Tests", value: stats?.total_tests || 0, icon: BookOpen },
          { label: "Active Subs", value: stats?.active_subscriptions || 0, icon: TrendingUp },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <c.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Content Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(207, 75%, 42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">User & Access Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={accessData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {accessData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
