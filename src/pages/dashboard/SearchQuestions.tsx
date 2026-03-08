import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bookmark, StickyNote, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface QuestionRow {
  id: string;
  question_text: string;
  difficulty: string | null;
  subject_name?: string;
}

export default function SearchQuestions() {
  const [query, setQuery] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [diffFilter, setDiffFilter] = useState("all");

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("questions")
        .select("id, question_text, difficulty, subjects(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      setQuestions(
        (data || []).map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          difficulty: q.difficulty,
          subject_name: q.subjects?.name || "General",
        }))
      );
      setLoading(false);
    }
    fetch();
  }, []);

  const filtered = questions.filter((q) => {
    const matchesQuery = !query || q.question_text.toLowerCase().includes(query.toLowerCase());
    const matchesDiff = diffFilter === "all" || q.difficulty === diffFilter;
    return matchesQuery && matchesDiff;
  });

  return (
    <div className="animate-fade-in">
      <h1 className="mb-5 text-xl font-bold text-foreground">Search Questions</h1>

      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by keyword..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={diffFilter} onValueChange={setDiffFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulty</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => (
            <Card key={q.id} className="transition-colors hover:bg-muted/20">
              <CardContent className="flex items-start gap-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">{q.question_text}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{q.subject_name}</Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{q.difficulty || "medium"}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Bookmark className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><StickyNote className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No questions found.</div>
          )}
        </div>
      )}
    </div>
  );
}
