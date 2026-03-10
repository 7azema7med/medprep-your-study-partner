import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

export default function ExamManagement() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTests = async () => {
    setLoading(true);
    const { data } = await supabase.from("tests").select("*").order("created_at", { ascending: false });
    setTests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTests(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test and all its question records?")) return;
    try {
      await adminApi.deleteTest(id);
      toast.success("Test deleted");
      fetchTests();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete test");
    }
  };

  const filtered = tests.filter(t =>
    t.test_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.mode?.toLowerCase().includes(search.toLowerCase()) ||
    String(t.public_id).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Exam Management</h1>
          <Badge variant="secondary">{tests.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTests}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tests by name, mode, or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No tests found</TableCell></TableRow>
              ) : filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.public_id}</TableCell>
                  <TableCell className="font-medium text-foreground">{t.test_name || "Untitled"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{t.mode}</Badge></TableCell>
                  <TableCell className="text-sm">{t.num_questions}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === "submitted" ? "default" : t.status === "in_progress" ? "secondary" : "outline"} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.score != null ? `${Math.round(Number(t.score))}%` : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}>
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
