import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Loader2 } from "lucide-react";
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
    all: totalAvailable, unused: totalAvailable,
    used: 0, incorrect: 0, marked: 0, omitted: 0, correct: 0,
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

  const toggleSubject = (id: string) =>
    setSelectedSubjects((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleSystem = (id: string) =>
    setSelectedSystems((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

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
    if (!error && test) navigate(`/dashboard/exam/${test.id}`);
  };

  const canGenerate = questionMode === "standard"
    ? numQuestions > 0 && (selectedSubjects.length > 0 || selectedSystems.length > 0)
    : customQuestionIds.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Create Test</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a custom block of questions for practice.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {/* Test Name */}
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Test Name <span className="font-normal text-muted-foreground">(optional)</span></h3>
          <Input
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g., Cardiology Review"
            className="max-w-sm"
          />
        </div>

        {/* Mode */}
        <div className="px-5 py-4">
          <ModeSelector mode={mode} onModeChange={setMode} />
        </div>

        {/* Question Mode */}
        <div className="px-5 py-4">
          <QuestionModeSelector questionMode={questionMode} onQuestionModeChange={setQuestionMode} />
        </div>

        {/* Conditional content */}
        <AnimatePresence mode="wait">
          {questionMode === "standard" ? (
            <motion.div
              key="standard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-border"
            >
              <div className="px-5 py-4">
                <StatusFilter selectedFilters={selectedFilters} onToggleFilter={toggleFilter} filterCounts={filterCounts} />
              </div>
              <div className="px-5 py-4">
                <SubjectSelector subjects={subjects} selectedSubjects={selectedSubjects} onToggleSubject={toggleSubject} onSelectAll={handleSelectAllSubjects} selectAll={selectAllSubjects} />
              </div>
              <div className="px-5 py-4">
                <SystemSelector systems={systems} selectedSystems={selectedSystems} onToggleSystem={toggleSystem} onSelectAll={handleSelectAllSystems} selectAll={selectAllSystems} />
              </div>
              <div className="px-5 py-4">
                <QuestionCountInput value={numQuestions} onChange={setNumQuestions} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-5 py-4">
                <CustomModePanel maxQuestions={40} onValidQuestionsChange={setCustomQuestionIds} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {questionMode === "standard"
              ? `${selectedSubjects.length + selectedSystems.length} selected · ${numQuestions} questions`
              : `${customQuestionIds.length} Question IDs`}
          </p>
          <Button
            onClick={handleGenerateTest}
            disabled={!canGenerate || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Test</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
