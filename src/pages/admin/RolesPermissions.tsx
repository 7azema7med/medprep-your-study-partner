import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ALL_ROLES = ["super_admin", "admin", "editor", "moderator", "support", "content_manager", "question_reviewer"];

export default function RolesPermissions() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: perms } = await supabase.from("permissions").select("*").order("category");
      const { data: rp } = await supabase.from("role_permissions").select("*");
      setPermissions(perms || []);
      setRolePermissions(rp || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const hasPermission = (role: string, permId: string) =>
    rolePermissions.some(rp => rp.role === role && rp.permission_id === permId);

  const togglePermission = async (role: string, permId: string) => {
    if (hasPermission(role, permId)) {
      await supabase.from("role_permissions").delete().eq("role", role).eq("permission_id", permId);
      setRolePermissions(prev => prev.filter(rp => !(rp.role === role && rp.permission_id === permId)));
    } else {
      const { data } = await supabase.from("role_permissions").insert({ role, permission_id: permId }).select().single();
      if (data) setRolePermissions(prev => [...prev, data]);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const grouped = permissions.reduce((acc: Record<string, any[]>, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Key className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Matrix</CardTitle>
          <p className="text-xs text-muted-foreground">Click cells to toggle permissions for each role</p>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 sticky left-0 bg-card">Permission</TableHead>
                {ALL_ROLES.map(r => (
                  <TableHead key={r} className="text-center text-[10px] min-w-[90px]">{r}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(grouped).map(([category, perms]) => (
                <>
                  <TableRow key={category}>
                    <TableCell colSpan={ALL_ROLES.length + 1} className="bg-muted/50 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                      {category}
                    </TableCell>
                  </TableRow>
                  {(perms as any[]).map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="sticky left-0 bg-card text-sm">{p.name}</TableCell>
                      {ALL_ROLES.map(r => {
                        const has = hasPermission(r, p.id);
                        return (
                          <TableCell key={r} className="text-center">
                            <button
                              onClick={() => togglePermission(r, p.id)}
                              className={`h-6 w-6 rounded-md border text-xs font-bold transition-colors ${
                                has ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"
                              }`}
                            >
                              {has ? "✓" : ""}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Available Roles</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map(r => (
              <Badge key={r} variant="outline" className="px-3 py-1.5">{r}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
