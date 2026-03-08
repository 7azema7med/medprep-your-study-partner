import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ParsedQuestion, parseQuestionsFromText } from "@/components/admin/upload/QuestionParser";
import { UploadProgressBar } from "@/components/admin/upload/UploadProgressBar";
import { FormatGuide, SAMPLE_FORMAT } from "@/components/admin/upload/FormatGuide";
import { PreviewTable } from "@/components/admin/upload/PreviewTable";

const BATCH_SIZE = 25;

export default function QuestionUpload() {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [defaultSubject, setDefaultSubject] = useState("none");
  const [defaultDifficulty, setDefaultDifficulty] = useState("medium");
  const [activeTab, setActiveTab] = useState("input");

  // Progress state
  const [uploadStatus, setUploadStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);
  const [importErrors, setImportErrors] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("subjects").select("*").order("name").then(({ data }) => setSubjects(data || []));
  }, []);

  const parseText = () => {
    const questions = parseQuestionsFromText(rawText, defaultDifficulty, defaultSubject);
    setParsed(questions);
    setActiveTab("preview");
    toast.success(`Parsed ${questions.length} questions`);
  };

  const toggleQuestion = useCallback((index: number) => {
    setParsed(prev => prev.map((q, i) => i === index ? { ...q, _selected: !q._selected } : q));
  }, []);

  const toggleAll = useCallback((selected: boolean) => {
    setParsed(prev => prev.map(q => q._error ? q : { ...q, _selected: selected }));
  }, []);

  const handleImport = async () => {
    const valid = parsed.filter(q => !q._error && q._selected);
    if (valid.length === 0) { toast.error("No questions selected for import"); return; }

    setUploadStatus("importing");
    setImportedCount(0);
    setErrorCount(0);
    setTotalToImport(valid.length);
    setImportErrors([]);

    const prepared = valid.map(q => ({
      question_text: q.question_text,
      explanation: q.explanation,
      difficulty: q.difficulty,
      subject_id: q.subject_id && q.subject_id !== "none" ? q.subject_id : null,
      choices: q.choices,
    }));

    let totalSuccess = 0;
    let totalErrors: any[] = [];

    // Import in batches
    for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
      const batch = prepared.slice(i, i + BATCH_SIZE);
      try {
        const res = await adminApi.importQuestions(batch);
        totalSuccess += res.success || 0;
        if (res.errors?.length) {
          totalErrors = [...totalErrors, ...res.errors];
        }
        setImportedCount(totalSuccess);
        setErrorCount(totalErrors.length);
        setImportErrors(totalErrors);
      } catch (e: any) {
        totalErrors.push({ error: e.message, row: `Batch ${Math.floor(i / BATCH_SIZE) + 1}` });
        setErrorCount(totalErrors.length);
        setImportErrors(totalErrors);
      }
    }

    setUploadStatus("done");
    toast.success(`Imported ${totalSuccess} questions`);
    if (totalErrors.length) toast.warning(`${totalErrors.length} errors during import`);
  };

  const selectedCount = parsed.filter(q => !q._error && q._selected).length;
  const validCount = parsed.filter(q => !q._error).length;
  const parseErrorCount = parsed.filter(q => q._error).length;

  const resetAll = () => {
    setRawText("");
    setParsed([]);
    setUploadStatus("idle");
    setImportedCount(0);
    setErrorCount(0);
    setImportErrors([]);
    setActiveTab("input");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/questions")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Upload className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Import Questions</h1>
          <p className="text-sm text-muted-foreground">Paste plain text questions to import in bulk</p>
        </div>
      </div>

      {uploadStatus === "done" ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-lg font-bold text-foreground">Import Complete</p>
                <p className="text-sm text-muted-foreground">{importedCount} questions imported successfully</p>
              </div>
            </div>
            <UploadProgressBar total={totalToImport} imported={importedCount} errors={errorCount} status="done" />
            {importErrors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">{importErrors.length} errors:</p>
                {importErrors.slice(0, 10).map((e, i) => (
                  <div key={i} className="text-sm bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    <p className="font-medium">Row {e.row}: {e.error}</p>
                    {e.question && <p className="text-xs text-muted-foreground mt-1">{e.question}</p>}
                  </div>
                ))}
                {importErrors.length > 10 && (
                  <p className="text-xs text-muted-foreground">...and {importErrors.length - 10} more</p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={resetAll}>Import More</Button>
              <Button variant="outline" onClick={() => navigate("/admin/questions")}>Back to Questions</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {uploadStatus === "importing" && (
            <UploadProgressBar total={totalToImport} imported={importedCount} errors={errorCount} status="importing" />
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="input">1. Input</TabsTrigger>
              <TabsTrigger value="preview" disabled={parsed.length === 0}>
                2. Preview ({parsed.length})
              </TabsTrigger>
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
                <Textarea
                  rows={18}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={SAMPLE_FORMAT}
                  className="font-mono text-xs"
                />
              </div>
              <Button onClick={parseText} disabled={!rawText.trim()} className="w-full">
                <FileText className="mr-2 h-4 w-4" />Parse Questions
              </Button>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Badge variant="default" className="text-xs">{selectedCount}/{validCount} selected</Badge>
                  {parseErrorCount > 0 && <Badge variant="destructive" className="text-xs">{parseErrorCount} errors</Badge>}
                </div>
                <Button
                  onClick={handleImport}
                  disabled={uploadStatus === "importing" || selectedCount === 0}
                >
                  {uploadStatus === "importing" ? "Importing..." : `Import ${selectedCount} Questions`}
                </Button>
              </div>
              <PreviewTable parsed={parsed} onToggle={toggleQuestion} onToggleAll={toggleAll} />
            </TabsContent>

            <TabsContent value="guide" className="mt-4">
              <FormatGuide />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
