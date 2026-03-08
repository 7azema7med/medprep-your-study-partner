import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Lock, Users, Key, Activity } from "lucide-react";
import { adminApi } from "@/lib/admin-api";

export default function SecurityDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const securityCards = [
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-primary" },
    { label: "Admin Accounts", value: stats?.admin_count || 0, icon: Shield, color: "text-info" },
    { label: "Failed Logins", value: stats?.failed_logins || 0, icon: AlertTriangle, color: "text-destructive" },
    { label: "Active Codes", value: stats?.active_codes || 0, icon: Key, color: "text-success" },
    { label: "Active Subscriptions", value: stats?.active_subscriptions || 0, icon: Lock, color: "text-info" },
    { label: "Audit Events", value: stats?.recent_audit_logs?.length || 0, icon: Activity, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {securityCards.map(c => (
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
          <CardHeader><CardTitle className="text-base">Recent Security Events</CardTitle></CardHeader>
          <CardContent>
            {stats?.recent_audit_logs?.length ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {stats.recent_audit_logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{log.action}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{log.entity_type} • {log.entity_id?.slice(0, 8)}...</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No security events recorded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Login Activity</CardTitle></CardHeader>
          <CardContent>
            {stats?.recent_logins?.length ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {stats.recent_logins.map((login: any) => (
                  <div key={login.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${login.success ? "bg-success" : "bg-destructive"}`} />
                      <div>
                        <span className="font-medium text-foreground">{login.event_type}</span>
                        <p className="text-xs text-muted-foreground">{login.ip_address || "Unknown IP"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(login.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No login activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
