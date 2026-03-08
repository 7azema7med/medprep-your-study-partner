import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollText, Search, Eye, RefreshCw, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const actions = [...new Set(logs.map(l => l.action))];
  const entities = [...new Set(logs.map(l => l.entity_type))];

  const filtered = logs.filter(l => {
    const matchSearch = l.action?.toLowerCase().includes(search.toLowerCase()) || l.entity_type?.toLowerCase().includes(search.toLowerCase()) || l.entity_id?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || l.action === filterAction;
    const matchEntity = filterEntity === "all" || l.entity_type === filterEntity;
    return matchSearch && matchAction && matchEntity;
  });

  const handleExport = () => {
    const csv = "Action,Entity,Entity ID,Actor,Date\n" +
      filtered.map(l => `${l.action},${l.entity_type},${l.entity_id || "—"},${l.actor_id?.slice(0, 8) || "—"},${new Date(l.created_at).toLocaleString()}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">{logs.length} total events</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1 h-3.5 w-3.5" />Export</Button>
          <Button variant="outline" size="sm" onClick={fetchLogs}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Entity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading logs...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12">
                  <ScrollText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No audit logs found</p>
                </TableCell></TableRow>
              ) : filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell><Badge variant="outline" className="text-[10px] font-mono">{l.action}</Badge></TableCell>
                  <TableCell className="text-sm">{l.entity_type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{l.entity_id?.slice(0, 12) || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{l.actor_id?.slice(0, 8) || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(l)}><Eye className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Audit Log Detail</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs block mb-0.5">Action</span><Badge variant="outline" className="font-mono">{selected.action}</Badge></div>
                <div><span className="text-muted-foreground text-xs block mb-0.5">Entity Type</span><p className="font-medium">{selected.entity_type}</p></div>
                <div><span className="text-muted-foreground text-xs block mb-0.5">Entity ID</span><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{selected.entity_id || "—"}</code></div>
                <div><span className="text-muted-foreground text-xs block mb-0.5">Actor ID</span><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{selected.actor_id || "—"}</code></div>
                <div className="col-span-2"><span className="text-muted-foreground text-xs block mb-0.5">Timestamp</span><p>{new Date(selected.created_at).toLocaleString()}</p></div>
              </div>
              {selected.old_values && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Previous Values</p>
                  <pre className="text-xs bg-destructive/5 border border-destructive/10 p-3 rounded-lg overflow-auto max-h-32">{JSON.stringify(selected.old_values, null, 2)}</pre>
                </div>
              )}
              {selected.new_values && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">New Values</p>
                  <pre className="text-xs bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg overflow-auto max-h-32">{JSON.stringify(selected.new_values, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
