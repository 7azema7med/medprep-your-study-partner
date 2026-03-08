import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Plus, Copy, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function generateCode(prefix: string = "MEDPREP") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix + "-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ActivationCodes() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ prefix: "MEDPREP", count: 1, duration_days: 30, max_uses: 1, plan_id: "" });

  const fetchData = async () => {
    setLoading(true);
    const { data: c } = await supabase.from("activation_codes").select("*, plans(name)").order("created_at", { ascending: false });
    const { data: p } = await supabase.from("plans").select("*").eq("is_active", true);
    setCodes(c || []);
    setPlans(p || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerate = async () => {
    const newCodes = [];
    for (let i = 0; i < form.count; i++) {
      newCodes.push({
        code: generateCode(form.prefix),
        duration_days: form.duration_days,
        max_uses: form.max_uses,
        plan_id: form.plan_id || null,
        is_active: true,
        created_by: user?.id,
      });
    }
    const { error } = await supabase.from("activation_codes").insert(newCodes);
    if (error) { toast.error(error.message); return; }
    toast.success(`Generated ${form.count} code(s)`);
    setCreateOpen(false);
    fetchData();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from("activation_codes").update({ is_active: !active }).eq("id", id);
    toast.success(active ? "Code disabled" : "Code enabled");
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this code?")) return;
    await supabase.from("activation_codes").delete().eq("id", id);
    toast.success("Code deleted");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Activation Codes</h1>
          <Badge variant="secondary">{codes.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Generate Codes</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate Activation Codes</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Prefix</Label><Input value={form.prefix} onChange={e => setForm(f => ({ ...f, prefix: e.target.value }))} /></div>
                <div><Label>Number of Codes</Label><Input type="number" min={1} max={100} value={form.count} onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) || 1 }))} /></div>
                <div><Label>Duration (days)</Label><Input type="number" min={1} value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 30 }))} /></div>
                <div><Label>Max Uses</Label><Input type="number" min={1} value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: parseInt(e.target.value) || 1 }))} /></div>
                <div><Label>Plan (optional)</Label>
                  <Select value={form.plan_id} onValueChange={v => setForm(f => ({ ...f, plan_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="No plan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleGenerate}>Generate {form.count} Code(s)</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : codes.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No codes</TableCell></TableRow>
              ) : codes.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{c.code}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.plans?.name || "—"}</TableCell>
                  <TableCell className="text-sm">{c.duration_days}d</TableCell>
                  <TableCell className="text-sm">{c.used_count}/{c.max_uses}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "default" : "secondary"} className="text-[10px] cursor-pointer" onClick={() => handleToggle(c.id, c.is_active)}>
                      {c.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
