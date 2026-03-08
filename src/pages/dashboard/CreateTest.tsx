import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { CustomModePanel } from "@/components/dashboard/create-test/CustomModePanel";

interface Subject {
  id: string;
  name: string;
  question_count: number;
  category: string;
}

const questionFilters = [
  { key: "all", label: "All" },
  { key: "unused", label: "Unused" },
  { key: "used", label: "Used" },
  { key: "incorrect", label: "Incorrect" },
  { key: "marked", label: "Marked" },
  { key: "omitted", label: "Omitted" },
  { key: "correct", label: "Correct" },
];

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
  const [numQuestions, setNumQuestions] = useState(0);
  const [maxPerBlock] = useState(40);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [systems, setSystems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter counts (mock for now since we don't have user question status yet)
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
    if (!user || numQuestions === 0) return;

    const { data: test, error } = await supabase
      .from("tests")
      .insert({
        user_id: user.id,
        test_name: testName || null,
        mode,
        question_mode: questionMode,
        num_questions: numQuestions,
      })
      .select()
      .single();

    if (!error && test) {
      navigate(`/dashboard/exam/${test.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Create Test</h1>

      {/* Test Mode */}
      <Section>
        <SectionTitle>Test mode</SectionTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={mode === "tutor"}
              onCheckedChange={(checked) => setMode(checked ? "tutor" : "timed")}
            />
            <span className="text-sm text-muted-foreground">{mode === "tutor" ? "Tutor" : "Timed"}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {mode === "timed" ? "Timed" : ""}
          </span>
        </div>
      </Section>

      {/* Test Name */}
      <Section>
        <SectionTitle>
          Test Name <span className="font-normal text-muted-foreground">- Optional</span>
        </SectionTitle>
        <Input
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Important Test"
          className="max-w-xs"
        />
      </Section>

      {/* Question Mode */}
      <Section>
        <div className="flex items-center gap-3 mb-3">
          <SectionTitle className="mb-0">Question mode</SectionTitle>
          <span className="text-sm text-primary/70">Total Available</span>
          <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
            {totalAvailable}
          </span>
        </div>
        <div className="mb-3 flex gap-1">
          {(["standard", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setQuestionMode(m)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
                questionMode === m
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {questionFilters.map((f) => (
            <label key={f.key} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={selectedFilters.includes(f.key)}
                onCheckedChange={() => toggleFilter(f.key)}
              />
              <span className={`text-sm ${selectedFilters.includes(f.key) ? "text-foreground" : "text-muted-foreground"}`}>
                {f.label}
              </span>
              <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs text-primary">
                {filterCounts[f.key]}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Subjects */}
      <Section>
        <label className="flex cursor-pointer items-center gap-2 mb-3">
          <Checkbox
            checked={selectAllSubjects}
            onCheckedChange={(checked) => handleSelectAllSubjects(!!checked)}
          />
          <span className="font-semibold text-sm text-foreground">Subjects</span>
        </label>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2">
          {subjects.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={selectedSubjects.includes(s.id)}
                onCheckedChange={() => toggleSubject(s.id)}
              />
              <span className="text-sm text-muted-foreground flex-1">{s.name}</span>
              <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs text-primary">
                {s.question_count}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Systems */}
      <Section>
        <label className="flex cursor-pointer items-center gap-2 mb-3">
          <Checkbox
            checked={selectAllSystems}
            onCheckedChange={(checked) => handleSelectAllSystems(!!checked)}
          />
          <span className="font-semibold text-sm text-foreground">Systems</span>
        </label>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2">
          {systems.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={selectedSystems.includes(s.id)}
                onCheckedChange={() => toggleSystem(s.id)}
              />
              <span className="text-sm text-muted-foreground flex-1">{s.name}</span>
              <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs text-primary">
                {s.question_count}
              </span>
              <button className="text-muted-foreground hover:text-foreground">
                <Plus className="h-4 w-4" />
              </button>
            </label>
          ))}
        </div>
      </Section>

      {/* Number of Questions */}
      <Section>
        <SectionTitle>No. of Questions</SectionTitle>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.min(Number(e.target.value), maxPerBlock))}
            className="w-20"
            min={0}
            max={maxPerBlock}
          />
          <span className="text-sm text-muted-foreground">
            Max Allowed per block{" "}
            <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs text-primary">
              {maxPerBlock}
            </span>
          </span>
        </div>
      </Section>

      {/* Generate Button */}
      <div className="mt-6">
        <Button
          onClick={handleGenerateTest}
          disabled={numQuestions === 0 || (selectedSubjects.length === 0 && selectedSystems.length === 0)}
          className="bg-primary hover:bg-primary/90"
        >
          Generate Test
        </Button>
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 rounded-lg border border-border bg-card p-5">
      {children}
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`mb-2 text-sm font-bold text-foreground ${className}`}>
      {children}
    </h2>
  );
}
