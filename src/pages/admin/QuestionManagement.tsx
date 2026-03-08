import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileQuestion, Plus, Search, Pencil, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [form, setForm] = useState({
    question_text: "", explanation: "", difficulty: "medium", subject_id: "",
    choices: [
      { choice_letter: "A", choice_text: "", is_correct: true, explanation: "" },
      { choice_letter: "B", choice_text: "", is_correct: false, explanation: "" },
      { choice_letter: "C", choice_text: "", is_correct: false, explanation: "" },
      { choice_letter: "D", choice_text: "", is_correct: false, explanation: "" },
      { choice_letter: "E", choice_text: "", is_correct: false, explanation: "" },
    ],
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: q } = await supabase.from("questions").select("*, subjects(name), answer_choices(*)").order("created_at", { ascending: false });
    const { data: s } = await supabase.from("subjects").select("*").order("name");
    setQuestions(q || []);
    setSubjects(s || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({
      question_text: "", explanation: "", difficulty: "medium", subject_id: "",
      choices: "ABCDE".split("").map((l, i) => ({ choice_letter: l, choice_text: "", is_correct: i === 0, explanation: "" })),
    });
    setEditingQuestion(null);
  };

  const handleSave = async () => {
    if (!form.question_text.trim()) { toast.error("Question text required"); return; }
    if (!form.choices.some(c => c.is_correct)) { toast.error("Mark at least one correct answer"); return; }

    try {
      if (editingQuestion) {
        await supabase.from("questions").update({
          question_text: form.question_text,
          explanation: form.explanation,
          difficulty: form.difficulty,
          subject_id: form.subject_id || null,
        }).eq("id", editingQuestion.id);
        // Delete old choices and re-insert
        await supabase.from("answer_choices").delete().eq("question_id", editingQuestion.id);
        await supabase.from("answer_choices").insert(
          form.choices.map(c => ({ ...c, question_id: editingQuestion.id }))
        );
        toast.success("Question updated");
      } else {
        const { data: q, error } = await supabase.from("questions").insert({
          question_text: form.question_text,
          explanation: form.explanation,
          difficulty: form.difficulty,
          subject_id: form.subject_id || null,
        }).select().single();
        if (error) throw error;
        await supabase.from("answer_choices").insert(
          form.choices.map(c => ({ ...c, question_id: q.id }))
        );
        toast.success("Question created");
      }
      setCreateOpen(false);
      resetForm();
      fetchData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleEdit = (q: any) => {
    setEditingQuestion(q);
    setForm({
      question_text: q.question_text,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      subject_id: q.subject_id || "",
      choices: q.answer_choices?.length ? q.answer_choices.map((c: any) => ({
        choice_letter: c.choice_letter, choice_text: c.choice_text, is_correct: c.is_correct, explanation: c.explanation || "",
      })) : "ABCDE".split("").map((l, i) => ({ choice_letter: l, choice_text: "", is_correct: i === 0, explanation: "" })),
    });
    setCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("answer_choices").delete().eq("question_id", id);
    await supabase.from("questions").delete().eq("id", id);
    toast.success("Question deleted");
    fetchData();
  };

  const filtered = questions.filter(q => {
    const matchSearch = q.question_text?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || q.subject_id === filterSubject;
    const matchDiff = filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchSearch && matchSubject && matchDiff;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileQuestion className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Question Management</h1>
          <Badge variant="secondary">{questions.length} total</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Add Question</Button></DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingQuestion ? "Edit Question" : "Create Question"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Question Text</Label><Textarea rows={5} value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Subject</Label>
                    <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Difficulty</Label>
                    <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Explanation</Label><Textarea rows={3} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} /></div>
                <div>
                  <Label className="mb-2 block">Answer Choices</Label>
                  <div className="space-y-2">
                    {form.choices.map((c, i) => (
                      <div key={c.choice_letter} className="flex items-center gap-2">
                        <button
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${c.is_correct ? "bg-success text-success-foreground border-success" : "border-border text-muted-foreground"}`}
                          onClick={() => setForm(f => ({ ...f, choices: f.choices.map((ch, j) => ({ ...ch, is_correct: j === i })) }))}
                        >
                          {c.choice_letter}
                        </button>
                        <Input placeholder={`Choice ${c.choice_letter}`} value={c.choice_text} onChange={e => setForm(f => ({ ...f, choices: f.choices.map((ch, j) => j === i ? { ...ch, choice_text: e.target.value } : ch) }))} />
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={handleSave}>{editingQuestion ? "Update Question" : "Create Question"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Question</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Choices</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No questions found</TableCell></TableRow>
              ) : filtered.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-[400px]">
                    <p className="truncate text-sm text-foreground">{q.question_text}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{q.subjects?.name || "—"}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={q.difficulty === "hard" ? "destructive" : q.difficulty === "easy" ? "default" : "secondary"} className="text-[10px]">
                      {q.difficulty || "medium"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{q.answer_choices?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(q)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
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
