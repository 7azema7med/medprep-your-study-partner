import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PlansSubscriptions() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", duration_days: 30, price_cents: 0, qbank_access: true, notes_access: true, exam_access: true });

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("plans").select("*").order("created_at");
    const { data: s } = await supabase.from("subscriptions").select("*, plans(name)").order("created_at", { ascending: false }).limit(50);
    setPlans(p || []);
    setSubs(s || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreatePlan = async () => {
    const { error } = await supabase.from("plans").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Plan created");
    setCreateOpen(false);
    setForm({ name: "", description: "", duration_days: 30, price_cents: 0, qbank_access: true, notes_access: true, exam_access: true });
    fetchData();
  };

  const togglePlan = async (id: string, active: boolean) => {
    await supabase.from("plans").update({ is_active: !active }).eq("id", id);
    toast.success(active ? "Plan deactivated" : "Plan activated");
    fetchData();
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await supabase.from("plans").delete().eq("id", id);
    toast.success("Plan deleted");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Plans & Subscriptions</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Add Plan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Plan</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Duration (days)</Label><Input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 30 }))} /></div>
                  <div><Label>Price (cents)</Label><Input type="number" value={form.price_cents} onChange={e => setForm(f => ({ ...f, price_cents: parseInt(e.target.value) || 0 }))} /></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>QBank Access</Label><Switch checked={form.qbank_access} onCheckedChange={v => setForm(f => ({ ...f, qbank_access: v }))} /></div>
                  <div className="flex items-center justify-between"><Label>Notes Access</Label><Switch checked={form.notes_access} onCheckedChange={v => setForm(f => ({ ...f, notes_access: v }))} /></div>
                  <div className="flex items-center justify-between"><Label>Exam Access</Label><Switch checked={form.exam_access} onCheckedChange={v => setForm(f => ({ ...f, exam_access: v }))} /></div>
                </div>
                <Button className="w-full" onClick={handleCreatePlan}>Create Plan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Plans</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </TableCell>
                  <TableCell className="text-sm">{p.duration_days}d</TableCell>
                  <TableCell className="text-sm">${(p.price_cents / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.qbank_access && <Badge variant="outline" className="text-[9px]">QBank</Badge>}
                      {p.notes_access && <Badge variant="outline" className="text-[9px]">Notes</Badge>}
                      {p.exam_access && <Badge variant="outline" className="text-[9px]">Exams</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"} className="text-[10px] cursor-pointer" onClick={() => togglePlan(p.id, p.is_active)}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeletePlan(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Subscriptions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No subscriptions</TableCell></TableRow>
              ) : subs.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs">{s.user_id?.slice(0, 8)}...</TableCell>
                  <TableCell className="text-sm">{s.plans?.name || "—"}</TableCell>
                  <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge></TableCell>
                  <TableCell className="text-xs">{new Date(s.starts_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">{new Date(s.ends_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">{s.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
