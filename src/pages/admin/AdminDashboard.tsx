import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileQuestion, BookOpen, Shield, Key, CreditCard,
  AlertTriangle, ScrollText, TrendingUp, Activity, BarChart3, StickyNote
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { motion } from "framer-motion";

interface Stats {
  total_users: number;
  total_questions: number;
  total_tests: number;
  total_notes: number;
  admin_count: number;
  active_codes: number;
  used_codes: number;
  active_subscriptions: number;
  failed_logins: number;
  total_subjects: number;
  banned_users: number;
  recent_audit_logs: any[];
  recent_logins: any[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35 } }),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview and recent activity</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-14 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, accent: "bg-primary/10 text-primary" },
    { label: "Questions", value: stats?.total_questions || 0, icon: FileQuestion, accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Tests Created", value: stats?.total_tests || 0, icon: BookOpen, accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Notes", value: stats?.total_notes || 0, icon: StickyNote, accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Admin Accounts", value: stats?.admin_count || 0, icon: Shield, accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Active Codes", value: stats?.active_codes || 0, icon: Key, accent: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
    { label: "Active Subs", value: stats?.active_subscriptions || 0, icon: CreditCard, accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    { label: "Failed Logins", value: stats?.failed_logins || 0, icon: AlertTriangle, accent: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and recent activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Admin Actions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recent_audit_logs?.length ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {stats.recent_audit_logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">{log.action}</span>
                        <span className="ml-2 text-muted-foreground text-xs">{log.entity_type}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No recent admin actions</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Login Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recent_logins?.length ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {stats.recent_logins.map((login: any) => (
                  <div key={login.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${login.success ? "bg-emerald-500" : "bg-destructive"}`} />
                      <div>
                        <span className="font-medium text-foreground capitalize">{login.event_type}</span>
                        <span className="ml-2 text-muted-foreground text-xs">{login.ip_address || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={login.success ? "outline" : "destructive"} className="text-[9px] h-5">
                        {login.success ? "OK" : "Failed"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(login.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No login activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Banned Users</span>
              <Badge variant="destructive" className="text-[10px]">{stats?.banned_users || 0}</Badge>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-destructive" style={{ width: `${Math.min(((stats?.banned_users || 0) / Math.max(stats?.total_users || 1, 1)) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Used Codes</span>
              <Badge variant="secondary" className="text-[10px]">{stats?.used_codes || 0}</Badge>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(((stats?.used_codes || 0) / Math.max(stats?.active_codes || 1, 1)) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Subjects</span>
              <Badge variant="secondary" className="text-[10px]">{stats?.total_subjects || 0}</Badge>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "100%" }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
