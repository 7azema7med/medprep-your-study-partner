import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Ban, Trash2, Shield, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

const ROLES = ["user", "super_admin", "admin", "editor", "moderator", "support", "content_manager", "question_reviewer"];

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", role: "user", country: "", phone: "" });

  const fetchUsers = () => {
    setLoading(true);
    adminApi.listUsers().then(data => setUsers(data.users || [])).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    try {
      await adminApi.createUser(form);
      toast.success("User created");
      setCreateOpen(false);
      setForm({ email: "", password: "", username: "", role: "user", country: "", phone: "" });
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleBan = async (userId: string, ban: boolean) => {
    try {
      await adminApi.updateUser({ user_id: userId, ban });
      toast.success(ban ? "User banned" : "User unbanned");
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Permanently delete this user?")) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted");
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminApi.assignRole(userId, role);
      toast.success("Role assigned");
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Create User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                <div><Label>Username</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div><Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <Button className="w-full" onClick={handleCreate}>Create User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                ) : (
                  filtered.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{u.username || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.length ? u.roles.map((r: string) => (
                            <Badge key={r} variant={r.includes("admin") ? "default" : "secondary"} className="text-[10px]">{r}</Badge>
                          )) : <Badge variant="outline" className="text-[10px]">user</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.banned ? (
                          <Badge variant="destructive" className="text-[10px]">Banned</Badge>
                        ) : u.email_confirmed ? (
                          <Badge variant="default" className="text-[10px] bg-success">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Unverified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.has_subscription ? "default" : "outline"} className="text-[10px]">
                          {u.has_subscription ? "Active" : "None"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Select onValueChange={v => handleRoleChange(u.id, v)}>
                            <SelectTrigger className="h-7 w-24 text-[10px]"><SelectValue placeholder="Set role" /></SelectTrigger>
                            <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBan(u.id, !u.banned)} title={u.banned ? "Unban" : "Ban"}>
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(u.id)} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
