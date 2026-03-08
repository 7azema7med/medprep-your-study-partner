import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, AlertTriangle, Lock, Users, Key, Activity, Ban, LogOut,
  Search, RefreshCw, Eye, UserX, ShieldAlert, Clock
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SecurityDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logDetail, setLogDetail] = useState<any>(null);

  const fetchStats = () => {
    setLoading(true);
    adminApi.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  const handleForceLogout = async (userId: string) => {
    try {
      await adminApi.forceLogout(userId);
      toast.success("User session invalidated");
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-14 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const secCards = [
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, accent: "bg-primary/10 text-primary" },
    { label: "Admin Accounts", value: stats?.admin_count || 0, icon: Shield, accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Banned Users", value: stats?.banned_users || 0, icon: Ban, accent: "bg-destructive/10 text-destructive" },
    { label: "Failed Logins", value: stats?.failed_logins || 0, icon: AlertTriangle, accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Active Codes", value: stats?.active_codes || 0, icon: Key, accent: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
    { label: "Used Codes", value: stats?.used_codes || 0, icon: Key, accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Active Subs", value: stats?.active_subscriptions || 0, icon: Lock, accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Audit Events", value: stats?.recent_audit_logs?.length || 0, icon: Activity, accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor security events and system health</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {secCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.accent}`}>
                  <c.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{c.value.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Security Events</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recent_audit_logs?.length ? (
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {stats.recent_audit_logs.map((log: any) => (
                  <button
                    key={log.id}
                    onClick={() => setLogDetail(log)}
                    className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium text-foreground">{log.action}</span>
                        <p className="text-[10px] text-muted-foreground truncate">{log.entity_type} • {log.entity_id?.slice(0, 8) || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <ShieldAlert className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No events recorded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Login Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recent_logins?.length ? (
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {stats.recent_logins.map((login: any) => (
                  <div key={login.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${login.success ? "bg-emerald-500" : "bg-destructive"}`} />
                      <div>
                        <span className="font-medium text-foreground capitalize">{login.event_type}</span>
                        <p className="text-[10px] text-muted-foreground">{login.ip_address || "Unknown IP"} • {login.user_agent?.slice(0, 30) || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={login.success ? "outline" : "destructive"} className="text-[9px] h-5">
                        {login.success ? "Success" : "Failed"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(login.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No login activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Detail Modal */}
      <Dialog open={!!logDetail} onOpenChange={() => setLogDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Event Detail</DialogTitle></DialogHeader>
          {logDetail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Action</span><p className="font-medium">{logDetail.action}</p></div>
                <div><span className="text-muted-foreground text-xs">Entity</span><p className="font-medium">{logDetail.entity_type}</p></div>
                <div><span className="text-muted-foreground text-xs">Entity ID</span><p className="font-mono text-xs">{logDetail.entity_id || "—"}</p></div>
                <div><span className="text-muted-foreground text-xs">Actor</span><p className="font-mono text-xs">{logDetail.actor_id?.slice(0, 12) || "—"}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground text-xs">Timestamp</span><p>{new Date(logDetail.created_at).toLocaleString()}</p></div>
              </div>
              {logDetail.old_values && (
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">Previous Values</p><pre className="text-xs bg-muted p-2.5 rounded-lg overflow-auto max-h-28">{JSON.stringify(logDetail.old_values, null, 2)}</pre></div>
              )}
              {logDetail.new_values && (
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">New Values</p><pre className="text-xs bg-muted p-2.5 rounded-lg overflow-auto max-h-28">{JSON.stringify(logDetail.new_values, null, 2)}</pre></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
