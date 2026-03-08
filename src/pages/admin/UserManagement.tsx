import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Ban, Trash2, Shield, RefreshCw, LogOut, Eye, UserCog, CreditCard } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

const ROLES = ["user", "super_admin", "admin", "editor", "moderator", "support", "content_manager", "question_reviewer"];

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", role: "user", country: "", phone: "" });

  // Subscription assignment
  const [subOpen, setSubOpen] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({ plan_id: "", duration_days: 30 });

  const fetchUsers = () => {
    setLoading(true);
    adminApi.listUsers().then(data => setUsers(data.users || [])).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!form.email || !form.password) { toast.error("Email and password required"); return; }
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
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted");
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleForceLogout = async (userId: string) => {
    try {
      await adminApi.forceLogout(userId);
      toast.success("User session invalidated");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminApi.assignRole(userId, role);
      toast.success("Role assigned");
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const openDetail = async (u: any) => {
    setDetailUser(u);
    setDetailLoading(true);
    try {
      const data = await adminApi.getUser(u.id);
      setDetailData(data);
    } catch (e: any) { toast.error(e.message); }
    setDetailLoading(false);
  };

  const handleAssignSub = async (userId: string) => {
    try {
      await adminApi.assignSubscription({ user_id: userId, plan_id: subForm.plan_id, duration_days: subForm.duration_days });
      toast.success("Subscription assigned");
      setSubOpen(null);
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.roles?.includes(filterRole);
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "active" && !u.banned && u.email_confirmed) ||
      (filterStatus === "banned" && u.banned) ||
      (filterStatus === "unverified" && !u.email_confirmed);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} total users</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Create User</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email *</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" /></div>
                <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" /></div>
                <div><Label>Username</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div><Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={handleCreate}>Create User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by email or username..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    No users found
                  </TableCell></TableRow>
                ) : filtered.map(u => (
                  <TableRow key={u.id} className="group">
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
                        <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Active</Badge>
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
                    <TableCell className="text-xs text-muted-foreground">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDetail(u)} title="View details"><Eye className="h-3.5 w-3.5" /></Button>
                        <Select onValueChange={v => handleRoleChange(u.id, v)}>
                          <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent"><UserCog className="h-3.5 w-3.5 text-muted-foreground mx-auto" /></SelectTrigger>
                          <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleForceLogout(u.id)} title="Force logout"><LogOut className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBan(u.id, !u.banned)} title={u.banned ? "Unban" : "Ban"}>
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(u.id)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => { setDetailUser(null); setDetailData(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : detailData ? (
            <Tabs defaultValue="profile" className="mt-2">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                <TabsTrigger value="roles" className="flex-1">Roles</TabsTrigger>
                <TabsTrigger value="subs" className="flex-1">Subscriptions</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs block">Email</span><p className="font-medium">{detailData.user?.email}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Username</span><p className="font-medium">{detailData.profile?.username || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Country</span><p>{detailData.profile?.country || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Phone</span><p>{detailData.profile?.phone || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Created</span><p>{new Date(detailData.user?.created_at).toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Last Login</span><p>{detailData.user?.last_sign_in_at ? new Date(detailData.user.last_sign_in_at).toLocaleString() : "Never"}</p></div>
                </div>
              </TabsContent>
              <TabsContent value="roles" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {detailData.roles?.length ? detailData.roles.map((r: any) => (
                    <Badge key={r.id} variant="default" className="px-3 py-1">{r.role}</Badge>
                  )) : <p className="text-sm text-muted-foreground">No admin roles assigned</p>}
                </div>
              </TabsContent>
              <TabsContent value="subs" className="mt-3">
                {detailData.subscriptions?.length ? (
                  <div className="space-y-2">
                    {detailData.subscriptions.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between border rounded-lg p-3 text-sm">
                        <div>
                          <p className="font-medium">{s.plans?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(s.starts_at).toLocaleDateString()} → {new Date(s.ends_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No subscriptions</p>}
              </TabsContent>
              <TabsContent value="activity" className="mt-3">
                {detailData.login_history?.length ? (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {detailData.login_history.map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${l.success ? "bg-emerald-500" : "bg-destructive"}`} />
                          <span>{l.event_type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No login history</p>}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
