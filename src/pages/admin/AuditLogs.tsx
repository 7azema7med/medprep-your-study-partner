import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollText, Search, Eye, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const actions = [...new Set(logs.map(l => l.action))];
  const filtered = logs.filter(l => {
    const matchSearch = l.action?.toLowerCase().includes(search.toLowerCase()) || l.entity_type?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || l.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <Badge variant="secondary">{logs.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
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
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No logs</TableCell></TableRow>
              ) : filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell><Badge variant="outline" className="text-[10px]">{l.action}</Badge></TableCell>
                  <TableCell className="text-sm">{l.entity_type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{l.entity_id?.slice(0, 12)}...</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.actor_id?.slice(0, 8)}...</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
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
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Action:</span> <span className="font-medium">{selected.action}</span></div>
                <div><span className="text-muted-foreground">Entity:</span> <span className="font-medium">{selected.entity_type}</span></div>
                <div><span className="text-muted-foreground">Entity ID:</span> <code className="text-xs">{selected.entity_id}</code></div>
                <div><span className="text-muted-foreground">Actor:</span> <code className="text-xs">{selected.actor_id}</code></div>
                <div className="col-span-2"><span className="text-muted-foreground">Date:</span> {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              {selected.old_values && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Old Values</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">{JSON.stringify(selected.old_values, null, 2)}</pre>
                </div>
              )}
              {selected.new_values && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">New Values</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">{JSON.stringify(selected.new_values, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
