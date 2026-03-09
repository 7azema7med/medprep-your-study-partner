import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, ChevronRight, Home, FileQuestion, 
  Loader2, Copy, CheckCircle2, Info
} from "lucide-react";
import { ModeSelector } from "@/components/dashboard/create-test/ModeSelector";
import { QuestionModeSelector } from "@/components/dashboard/create-test/QuestionModeSelector";
import { SubjectSelector } from "@/components/dashboard/create-test/SubjectSelector";
import { SystemSelector } from "@/components/dashboard/create-test/SystemSelector";
import { StatusFilter } from "@/components/dashboard/create-test/StatusFilter";
import { QuestionCountInput } from "@/components/dashboard/create-test/QuestionCountInput";
import { CustomModePanel } from "@/components/dashboard/create-test/CustomModePanel";

interface Subject {
  id: string;
  name: string;
  question_count: number;
  category: string;
}

export default function CreateTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"tutor" | "timed">("tutor");
  const [testName, setTestName] = useState("");
  const [questionMode, setQuestionMode] = useState<"standard" | "custom">("standard");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["unused"]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [customQuestionIds, setCustomQuestionIds] = useState<string[]>([]);
  const [selectAllSubjects, setSelectAllSubjects] = useState(false);
  const [selectAllSystems, setSelectAllSystems] = useState(false);
  const [numQuestions, setNumQuestions] = useState(20);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [systems, setSystems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalAvailable = subjects.reduce((sum, s) => sum + s.question_count, 0) +
    systems.reduce((sum, s) => sum + s.question_count, 0);

  const filterCounts: Record<string, number> = {
    all: totalAvailable,
    unused: totalAvailable,
    used: 0,
    incorrect: 0,
    marked: 0,
    omitted: 0,
    correct: 0,
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (!error && data) {
        setSubjects(data.filter((s) => s.category === "subject"));
        setSystems(data.filter((s) => s.category === "system"));
      }
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  const toggleFilter = (key: string) => {
    if (key === "all") {
      setSelectedFilters(["all"]);
    } else {
      setSelectedFilters((prev) => {
        const without = prev.filter((f) => f !== "all" && f !== key);
        if (prev.includes(key)) return without.length ? without : ["all"];
        return [...without, key];
      });
    }
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSystem = (id: string) => {
    setSelectedSystems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllSubjects = (checked: boolean) => {
    setSelectAllSubjects(checked);
    setSelectedSubjects(checked ? subjects.map((s) => s.id) : []);
  };

  const handleSelectAllSystems = (checked: boolean) => {
    setSelectAllSystems(checked);
    setSelectedSystems(checked ? systems.map((s) => s.id) : []);
  };

  const handleGenerateTest = async () => {
    if (!user) return;
    if (questionMode === "standard" && numQuestions === 0) return;
    if (questionMode === "custom" && customQuestionIds.length === 0) return;

    setIsGenerating(true);

    const { data: test, error } = await supabase
      .from("tests")
      .insert({
        user_id: user.id,
        test_name: testName || null,
        mode,
        question_mode: questionMode,
        num_questions: questionMode === "custom" ? customQuestionIds.length : numQuestions,
        source_mode: questionMode,
        custom_question_ids: questionMode === "custom" ? customQuestionIds : null,
      })
      .select()
      .single();

    setIsGenerating(false);

    if (!error && test) {
      navigate(`/dashboard/exam/${test.id}`);
    }
  };

  const canGenerate = questionMode === "standard"
    ? numQuestions > 0 && (selectedSubjects.length > 0 || selectedSystems.length > 0)
    : customQuestionIds.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-4xl pb-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-3 w-3" />
        <span>QBank</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">Create Test</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Test</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a custom block of questions for practice.
        </p>
      </div>

      {/* Main Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
      >
        {/* Card Header */}
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Test Configuration</h2>
                <p className="text-xs text-muted-foreground">
                  Customize your practice session settings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                {totalAvailable} questions available
              </span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="divide-y divide-border">
          {/* Test Name (Optional) */}
          <Section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Test Name</h3>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g., Cardiology Review Session"
              className="max-w-md"
            />
          </Section>

          {/* Test Mode */}
          <Section>
            <ModeSelector mode={mode} onModeChange={setMode} />
          </Section>

          {/* Question Mode */}
          <Section>
            <QuestionModeSelector
              questionMode={questionMode}
              onQuestionModeChange={setQuestionMode}
            />
          </Section>

          {/* Conditional Sections based on Question Mode */}
          <AnimatePresence mode="wait">
            {questionMode === "standard" ? (
              <motion.div
                key="standard"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Status Filters */}
                <Section>
                  <StatusFilter
                    selectedFilters={selectedFilters}
                    onToggleFilter={toggleFilter}
                    filterCounts={filterCounts}
                  />
                </Section>

                {/* Subjects */}
                <Section>
                  <SubjectSelector
                    subjects={subjects}
                    selectedSubjects={selectedSubjects}
                    onToggleSubject={toggleSubject}
                    onSelectAll={handleSelectAllSubjects}
                    selectAll={selectAllSubjects}
                  />
                </Section>

                {/* Systems */}
                <Section>
                  <SystemSelector
                    systems={systems}
                    selectedSystems={selectedSystems}
                    onToggleSystem={toggleSystem}
                    onSelectAll={handleSelectAllSystems}
                    selectAll={selectAllSystems}
                  />
                </Section>

                {/* Number of Questions */}
                <Section>
                  <QuestionCountInput
                    value={numQuestions}
                    onChange={setNumQuestions}
                  />
                </Section>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Section>
                  <CustomModePanel
                    maxQuestions={40}
                    onValidQuestionsChange={setCustomQuestionIds}
                  />
                </Section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Footer - Generate Button */}
        <div className="border-t border-border bg-muted/20 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {questionMode === "standard" ? (
                <>
                  <span>
                    {selectedSubjects.length + selectedSystems.length} categories selected
                  </span>
                  <span className="text-border">•</span>
                  <span>{numQuestions} questions</span>
                </>
              ) : (
                <span>{customQuestionIds.length} Question IDs entered</span>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGenerateTest}
                disabled={!canGenerate || isGenerating}
                size="lg"
                className="gap-2 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Test
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Info Footer */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground mb-1">About Question & Test IDs</p>
          <p>
            Each question has a unique Question ID (e.g., 104582) that you can share with study partners.
            After generating a test, you'll receive a Test ID that others can use to create the same block.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-5">{children}</div>;
}
