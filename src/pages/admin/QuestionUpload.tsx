import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, AlertCircle, CheckCircle2, ArrowLeft, HelpCircle } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface ParsedQuestion {
  question_text: string;
  explanation: string;
  difficulty: string;
  subject_id: string;
  choices: { choice_letter: string; choice_text: string; is_correct: boolean; explanation: string }[];
  _error?: string;
  _row?: number;
}

const SAMPLE_FORMAT = `Q: A 45-year-old male presents with chest pain radiating to the left arm. ECG shows ST elevation in leads II, III, aVF. What is the most likely diagnosis?
A: Inferior myocardial infarction *correct
B: Anterior myocardial infarction
C: Pericarditis
D: Pulmonary embolism
E: Aortic dissection
Explanation: ST elevation in leads II, III, aVF indicates inferior MI, typically caused by right coronary artery occlusion.
Difficulty: medium

Q: Which enzyme is the most specific marker for myocardial injury?
A: Creatine kinase MB
B: Troponin I *correct
C: Lactate dehydrogenase
D: Aspartate aminotransferase
Explanation: Troponin I is the most specific and sensitive biomarker for myocardial injury.
Difficulty: easy`;

export default function QuestionUpload() {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultDifficulty, setDefaultDifficulty] = useState("medium");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: any[] } | null>(null);

  useEffect(() => {
    supabase.from("subjects").select("*").order("name").then(({ data }) => setSubjects(data || []));
  }, []);

  const parseText = () => {
    const blocks = rawText.split(/\n\s*\n/).filter(b => b.trim());
    const questions: ParsedQuestion[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const lines = blocks[i].split("\n").map(l => l.trim()).filter(Boolean);
      const q: ParsedQuestion = {
        question_text: "",
        explanation: "",
        difficulty: defaultDifficulty,
        subject_id: defaultSubject,
        choices: [],
        _row: i + 1,
      };

      for (const line of lines) {
        if (line.startsWith("Q:") || line.startsWith("Q.")) {
          q.question_text = line.replace(/^Q[:.]?\s*/, "").trim();
        } else if (/^[A-F][:.)]\s/.test(line)) {
          const letter = line[0];
          const isCorrect = line.includes("*correct") || line.includes("*");
          const text = line.replace(/^[A-F][:.)]\s*/, "").replace(/\s*\*correct\s*/g, "").replace(/\s*\*\s*$/g, "").trim();
          q.choices.push({ choice_letter: letter, choice_text: text, is_correct: isCorrect, explanation: "" });
        } else if (line.toLowerCase().startsWith("explanation:")) {
          q.explanation = line.replace(/^explanation:\s*/i, "").trim();
        } else if (line.toLowerCase().startsWith("difficulty:")) {
          q.difficulty = line.replace(/^difficulty:\s*/i, "").trim().toLowerCase();
        } else if (!q.question_text) {
          q.question_text = line;
        }
      }

      // Validation
      if (!q.question_text) q._error = "Missing question text";
      else if (q.choices.length < 2) q._error = "Need at least 2 choices";
      else if (!q.choices.some(c => c.is_correct)) q._error = "No correct answer marked (use *correct or * after choice)";

      questions.push(q);
    }

    setParsed(questions);
    toast.success(`Parsed ${questions.length} questions`);
  };

  const handleImport = async () => {
    const valid = parsed.filter(q => !q._error);
    if (valid.length === 0) { toast.error("No valid questions to import"); return; }

    setImporting(true);
    try {
      const res = await adminApi.importQuestions(valid.map(q => ({
        question_text: q.question_text,
        explanation: q.explanation,
        difficulty: q.difficulty,
        subject_id: q.subject_id && q.subject_id !== "none" ? q.subject_id : null,
        choices: q.choices,
      })));
      setResult(res);
      toast.success(`Imported ${res.success} questions`);
      if (res.errors?.length) toast.warning(`${res.errors.length} errors`);
    } catch (e: any) { toast.error(e.message); }
    setImporting(false);
  };

  const validCount = parsed.filter(q => !q._error).length;
  const errorCount = parsed.filter(q => q._error).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/questions")}><ArrowLeft className="h-4 w-4" /></Button>
        <Upload className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Import Questions</h1>
          <p className="text-sm text-muted-foreground">Paste plain text questions to import in bulk</p>
        </div>
      </div>

      {result ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-lg font-bold text-foreground">Import Complete</p>
                <p className="text-sm text-muted-foreground">{result.success} questions imported successfully</p>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-destructive">{result.errors.length} errors:</p>
                {result.errors.map((e, i) => (
                  <div key={i} className="text-sm bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    <p className="font-medium">Row {e.row}: {e.error}</p>
                    {e.question && <p className="text-xs text-muted-foreground mt-1">{e.question}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <Button onClick={() => { setResult(null); setParsed([]); setRawText(""); }}>Import More</Button>
              <Button variant="outline" onClick={() => navigate("/admin/questions")}>Back to Questions</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="input">
          <TabsList>
            <TabsTrigger value="input">1. Input</TabsTrigger>
            <TabsTrigger value="preview" disabled={parsed.length === 0}>2. Preview ({parsed.length})</TabsTrigger>
            <TabsTrigger value="guide">Format Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Subject</Label>
                <Select value={defaultSubject} onValueChange={setDefaultSubject}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default Difficulty</Label>
                <Select value={defaultDifficulty} onValueChange={setDefaultDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Paste Questions (separate with blank lines)</Label>
              <Textarea rows={18} value={rawText} onChange={e => setRawText(e.target.value)} placeholder={SAMPLE_FORMAT} className="font-mono text-xs" />
            </div>
            <Button onClick={parseText} disabled={!rawText.trim()} className="w-full">
              <FileText className="mr-2 h-4 w-4" />Parse Questions
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Badge variant="default" className="text-xs">{validCount} valid</Badge>
                {errorCount > 0 && <Badge variant="destructive" className="text-xs">{errorCount} errors</Badge>}
              </div>
              <Button onClick={handleImport} disabled={importing || validCount === 0}>
                {importing ? "Importing..." : `Import ${validCount} Questions`}
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Choices</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((q, i) => (
                      <TableRow key={i} className={q._error ? "bg-destructive/5" : ""}>
                        <TableCell className="text-xs text-muted-foreground">{q._row}</TableCell>
                        <TableCell className="max-w-[350px]">
                          <p className="line-clamp-2 text-sm">{q.question_text || "—"}</p>
                        </TableCell>
                        <TableCell className="text-sm">{q.choices.length} ({q.choices.filter(c => c.is_correct).length} correct)</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{q.difficulty}</Badge></TableCell>
                        <TableCell>
                          {q._error ? (
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                              <span className="text-xs text-destructive">{q._error}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">Valid</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><HelpCircle className="h-4 w-4" />Import Format Guide</CardTitle>
                <CardDescription>Paste questions in this plain-text format. Separate each question with a blank line.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono">{SAMPLE_FORMAT}</pre>
                <div className="mt-4 space-y-2 text-sm">
                  <p><strong>Rules:</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Start question with <code className="bg-muted px-1 rounded">Q:</code></li>
                    <li>Choices start with <code className="bg-muted px-1 rounded">A:</code> through <code className="bg-muted px-1 rounded">F:</code></li>
                    <li>Mark correct answer with <code className="bg-muted px-1 rounded">*correct</code> or <code className="bg-muted px-1 rounded">*</code> at end of choice</li>
                    <li>Optional: <code className="bg-muted px-1 rounded">Explanation:</code> line</li>
                    <li>Optional: <code className="bg-muted px-1 rounded">Difficulty: easy|medium|hard</code></li>
                    <li>Minimum 2 choices per question</li>
                    <li>At least 1 correct answer required</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
