import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileQuestion, BookOpen, Shield, Key, CreditCard, AlertTriangle, ScrollText } from "lucide-react";
import { adminApi } from "@/lib/admin-api";

interface Stats {
  total_users: number;
  total_questions: number;
  total_tests: number;
  total_notes: number;
  admin_count: number;
  active_codes: number;
  active_subscriptions: number;
  failed_logins: number;
  recent_audit_logs: any[];
  recent_logins: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-primary" },
    { label: "Questions", value: stats?.total_questions || 0, icon: FileQuestion, color: "text-info" },
    { label: "Tests Created", value: stats?.total_tests || 0, icon: BookOpen, color: "text-success" },
    { label: "Notes", value: stats?.total_notes || 0, icon: ScrollText, color: "text-warning" },
    { label: "Admin Accounts", value: stats?.admin_count || 0, icon: Shield, color: "text-primary" },
    { label: "Active Codes", value: stats?.active_codes || 0, icon: Key, color: "text-success" },
    { label: "Active Subs", value: stats?.active_subscriptions || 0, icon: CreditCard, color: "text-info" },
    { label: "Failed Logins", value: stats?.failed_logins || 0, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-muted ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
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
          <CardHeader><CardTitle className="text-base">Recent Admin Actions</CardTitle></CardHeader>
          <CardContent>
            {stats?.recent_audit_logs?.length ? (
              <div className="space-y-2">
                {stats.recent_audit_logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      <span className="ml-2 text-muted-foreground">{log.entity_type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent actions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Logins</CardTitle></CardHeader>
          <CardContent>
            {stats?.recent_logins?.length ? (
              <div className="space-y-2">
                {stats.recent_logins.map((login: any) => (
                  <div key={login.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${login.success ? "bg-success" : "bg-destructive"}`} />
                      <span className="text-muted-foreground">{login.event_type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(login.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No login history</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
