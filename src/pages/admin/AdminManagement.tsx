import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Plus, RefreshCw, Ban, Trash2, Shield } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

const ADMIN_ROLES = ["super_admin", "admin", "editor", "moderator", "support", "content_manager", "question_reviewer"];

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", role: "admin" });

  const fetchAdmins = () => {
    setLoading(true);
    adminApi.listUsers().then(data => {
      const adminUsers = (data.users || []).filter((u: any) => u.roles?.some((r: string) => r !== "user"));
      setAdmins(adminUsers);
    }).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreateAdmin = async () => {
    if (!form.email || !form.password) { toast.error("Email and password required"); return; }
    try {
      await adminApi.createUser({ ...form, email_confirm: true });
      toast.success("Admin created");
      setCreateOpen(false);
      setForm({ email: "", password: "", username: "", role: "admin" });
      fetchAdmins();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role?`)) return;
    try {
      await adminApi.removeRole(userId, role);
      toast.success("Role removed");
      fetchAdmins();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleBan = async (userId: string, ban: boolean) => {
    try {
      await adminApi.updateUser({ user_id: userId, ban });
      toast.success(ban ? "Admin disabled" : "Admin enabled");
      fetchAdmins();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
            <p className="text-sm text-muted-foreground">{admins.length} admin accounts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAdmins}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Create Admin</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Admin Account</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email *</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@medprep.com" /></div>
                <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                <div><Label>Username</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div><Label>Admin Role</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ADMIN_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateAdmin}>Create Admin</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading admins...</div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <Shield className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No admin accounts found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{a.username || "—"}</p>
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {a.roles?.map((r: string) => (
                          <Badge key={r} variant={r === "super_admin" ? "default" : "secondary"} className="text-[10px]">{r}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.banned ? "destructive" : "outline"} className="text-[10px]">
                        {a.banned ? "Disabled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.last_sign_in_at ? new Date(a.last_sign_in_at).toLocaleString() : "Never"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleBan(a.id, !a.banned)}>
                          <Ban className="mr-1 h-3 w-3" />{a.banned ? "Enable" : "Disable"}
                        </Button>
                        {a.roles?.filter((r: string) => r !== "user").map((r: string) => (
                          <Button key={r} variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleRemoveRole(a.id, r)}>
                            Remove {r}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
