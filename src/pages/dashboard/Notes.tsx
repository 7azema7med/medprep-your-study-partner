import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, StickyNote, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface NoteItem {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  question_id: string | null;
}

export default function Notes() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchNotes() {
      const { data } = await supabase
        .from("notes")
        .select("id, title, content, created_at, question_id")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      setNotes((data as NoteItem[]) || []);
      setLoading(false);
    }
    fetchNotes();
  }, [user]);

  const filtered = notes.filter((n) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (n.title?.toLowerCase().includes(q)) || (n.content?.toLowerCase().includes(q));
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Notes</h1>
        <Badge variant="secondary">{notes.length} notes</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search notes..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">{notes.length === 0 ? "No notes yet. Notes you create during exams will appear here." : "No notes match your search."}</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <Card key={n.id} className="cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{n.title || "Untitled Note"}</CardTitle>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleDateString()}
                  {n.question_id && " · Linked to question"}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-3">{n.content || "No content"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
