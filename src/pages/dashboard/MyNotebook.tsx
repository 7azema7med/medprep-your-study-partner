import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Search, BookmarkCheck, StickyNote, Highlighter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotebookEntry {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  question_id: string | null;
}

export default function MyNotebook() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      setEntries((data as NotebookEntry[]) || []);
      setLoading(false);
    }
    fetch();
  }, [user]);

  const addEntry = async () => {
    if (!title.trim() || !user) return;
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title, content })
      .select()
      .single();
    if (!error && data) {
      setEntries((prev) => [data as NotebookEntry, ...prev]);
      setTitle("");
      setContent("");
      toast.success("Note added");
    } else {
      toast.error("Failed to add note");
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Note deleted");
    }
  };

  const filtered = entries.filter((e) => {
    const matchQuery = !query || (e.title || "").toLowerCase().includes(query.toLowerCase()) || (e.content || "").toLowerCase().includes(query.toLowerCase());
    if (activeTab === "questions") return matchQuery && e.question_id;
    if (activeTab === "personal") return matchQuery && !e.question_id;
    return matchQuery;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-xl font-bold text-foreground">My Notebook</h1>

      {/* Add new note */}
      <Card>
        <CardContent className="space-y-3 pt-5">
          <Input placeholder="Note title..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Write your note..." value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <Button onClick={addEntry} disabled={!title.trim()} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notebook..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <StickyNote className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Your notebook is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Add notes from exams or create personal notes above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-start gap-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
                    {e.question_id && <Badge variant="outline" className="text-[10px]">Question Note</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{e.content}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(e.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteEntry(e.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
