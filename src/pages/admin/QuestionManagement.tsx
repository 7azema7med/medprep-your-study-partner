import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileQuestion, Plus, Search, Pencil, Trash2, RefreshCw, Copy, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function QuestionManagement() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
    if (!form.choices.some(c => c.is_correct && c.choice_text.trim())) { toast.error("Mark at least one correct answer with text"); return; }

    try {
      if (editingQuestion) {
        await adminApi.updateQuestion({
          id: editingQuestion.id,
          question_text: form.question_text,
          explanation: form.explanation,
          difficulty: form.difficulty,
          subject_id: form.subject_id || null,
          choices: form.choices.filter(c => c.choice_text.trim()),
        });
        toast.success("Question updated");
      } else {
        await adminApi.createQuestion({
          question_text: form.question_text,
          explanation: form.explanation,
          difficulty: form.difficulty,
          subject_id: form.subject_id || null,
          choices: form.choices.filter(c => c.choice_text.trim()),
        });
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

  const handleDuplicate = (q: any) => {
    setEditingQuestion(null);
    setForm({
      question_text: q.question_text + " (copy)",
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
    try {
      await adminApi.deleteQuestion(id);
      toast.success("Question deleted");
      fetchData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected questions?`)) return;
    try {
      await adminApi.bulkDeleteQuestions(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} questions`);
      setSelectedIds(new Set());
      fetchData();
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(q => q.id)));
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Question Management</h1>
            <p className="text-sm text-muted-foreground">{questions.length} total questions</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />Delete {selectedIds.size}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/upload-questions")}>
            <Upload className="mr-1 h-3.5 w-3.5" />Import
          </Button>
          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Add Question</Button></DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingQuestion ? "Edit Question" : "Create Question"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Question Text *</Label><Textarea rows={5} value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} placeholder="Enter the question stem..." /></div>
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
                <div><Label>Explanation</Label><Textarea rows={3} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explain the correct answer..." /></div>
                <div>
                  <Label className="mb-2 block">Answer Choices (click letter to mark correct)</Label>
                  <div className="space-y-2">
                    {form.choices.map((c, i) => (
                      <div key={c.choice_letter} className="flex items-start gap-2">
                        <button
                          className={`mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${c.is_correct ? "bg-emerald-500 text-white border-emerald-500" : "border-border text-muted-foreground hover:border-primary"}`}
                          onClick={() => setForm(f => ({ ...f, choices: f.choices.map((ch, j) => ({ ...ch, is_correct: j === i })) }))}
                          type="button"
                        >
                          {c.choice_letter}
                        </button>
                        <div className="flex-1 space-y-1">
                          <Input placeholder={`Choice ${c.choice_letter} text`} value={c.choice_text} onChange={e => setForm(f => ({ ...f, choices: f.choices.map((ch, j) => j === i ? { ...ch, choice_text: e.target.value } : ch) }))} />
                          <Input placeholder="Choice explanation (optional)" value={c.explanation} onChange={e => setForm(f => ({ ...f, choices: f.choices.map((ch, j) => j === i ? { ...ch, explanation: e.target.value } : ch) }))} className="text-xs h-8" />
                        </div>
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
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Difficulty" /></SelectTrigger>
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
                <TableHead className="w-10">
                  <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead className="w-[45%]">Question</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Choices</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading questions...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12">
                  <FileQuestion className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No questions found</p>
                </TableCell></TableRow>
              ) : filtered.map(q => (
                <TableRow key={q.id} className={selectedIds.has(q.id) ? "bg-primary/5" : ""}>
                  <TableCell><Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggleSelect(q.id)} /></TableCell>
                  <TableCell className="max-w-[400px]">
                    <p className="line-clamp-2 text-sm text-foreground">{q.question_text}</p>
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
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(q)} title="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(q)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(q.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
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
