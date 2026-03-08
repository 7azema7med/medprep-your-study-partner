import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Clock, Loader2, FileX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Test {
  id: string;
  test_name: string | null;
  mode: string;
  num_questions: number;
  score: number | null;
  status: string;
  created_at: string;
  time_spent: number | null;
}

export default function PreviousTests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      setTests((data as Test[]) || []);
      setLoading(false);
    }
    fetch();
  }, [user]);

  const filtered = statusFilter === "all" ? tests : tests.filter((t) => t.status === statusFilter);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (s: number | null) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    return `${m} min`;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Previous Tests</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="submitted">Completed</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileX className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No tests found</p>
            <Button variant="link" onClick={() => navigate("/dashboard/create-test")} className="mt-2">Create your first test</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Test Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mode</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Questions</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm">{formatDate(t.created_at)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{t.test_name || "Untitled Test"}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="text-xs capitalize">{t.mode}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{t.num_questions}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold">
                        {t.score !== null ? `${Math.round(Number(t.score))}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(t.time_spent)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={t.status === "submitted" ? "default" : t.status === "suspended" ? "secondary" : "outline"} className="capitalize text-xs">
                          {t.status === "submitted" ? "Completed" : t.status === "in_progress" ? "In Progress" : t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/exam/${t.id}`)}>
                          {t.status === "in_progress" || t.status === "suspended" ? (
                            <><Play className="mr-1 h-3 w-3" /> Resume</>
                          ) : (
                            <><RotateCcw className="mr-1 h-3 w-3" /> Review</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
