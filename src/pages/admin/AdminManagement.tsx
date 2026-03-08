import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = () => {
    setLoading(true);
    adminApi.listUsers().then(data => {
      const adminUsers = (data.users || []).filter((u: any) =>
        u.roles?.some((r: string) => r !== "user")
      );
      setAdmins(adminUsers);
    }).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleRemoveAdmin = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role from this user?`)) return;
    try {
      await adminApi.removeRole(userId, role);
      toast.success("Role removed");
      fetchAdmins();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAdmins}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No admins found</TableCell></TableRow>
                ) : admins.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{a.username || "—"}</p>
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {a.roles?.map((r: string) => (
                          <Badge key={r} variant="default" className="text-[10px]">{r}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.last_sign_in_at ? new Date(a.last_sign_in_at).toLocaleString() : "Never"}</TableCell>
                    <TableCell className="text-right">
                      {a.roles?.filter((r: string) => r !== "user").map((r: string) => (
                        <Button key={r} variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => handleRemoveAdmin(a.id, r)}>
                          Remove {r}
                        </Button>
                      ))}
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
