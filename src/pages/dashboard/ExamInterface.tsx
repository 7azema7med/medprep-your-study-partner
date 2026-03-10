import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/exam-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ExamTopHeader from "@/components/exam/ExamTopHeader";
import QuestionSidebar from "@/components/exam/QuestionSidebar";
import QuestionPanel from "@/components/exam/QuestionPanel";
import ExamBottomBar from "@/components/exam/ExamBottomBar";
import LabValuesDialog from "@/components/exam/dialogs/LabValuesDialog";
import CalculatorDialog from "@/components/exam/dialogs/CalculatorDialog";
import NotesDialog from "@/components/exam/dialogs/NotesDialog";
import SettingsDialog from "@/components/exam/dialogs/SettingsDialog";
import ShortcutsDialog from "@/components/exam/dialogs/ShortcutsDialog";
import FeedbackDialog from "@/components/exam/dialogs/FeedbackDialog";
import SubmitConfirmDialog from "@/components/exam/dialogs/SubmitConfirmDialog";
import ExamResultScreen from "@/components/exam/ExamResultScreen";
import type { ExamQuestion } from "@/lib/exam-types";
import { Loader2, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExamInterface() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useExamStore();
  const {
    questions, setQuestions, setSession, setTimerRunning,
    activeDialog, setActiveDialog, nextQuestion, prevQuestion,
    selectAnswer, toggleMark, setShowExplanation, isReviewMode,
    result, currentIndex, reset,
  } = store;

  // Load questions from DB only
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!testId) return;

      try {
        // Get the test details first
        const { data: testData } = await supabase
          .from("tests")
          .select("mode")
          .eq("id", testId)
          .single();

        const { data: testQuestions } = await supabase
          .from("test_questions")
          .select("question_id, question_order, questions(*, answer_choices(*))")
          .eq("test_id", testId)
          .order("question_order");

        if (!cancelled && testQuestions && testQuestions.length > 0) {
          const mapped: ExamQuestion[] = testQuestions.map((tq: any) => ({
            id: tq.questions.id,
            question_text: tq.questions.question_text,
            explanation: tq.questions.explanation,
            educational_objective: null,
            position: tq.question_order,
            public_id: tq.questions.public_id,
            choices: (tq.questions.answer_choices || []).map((c: any) => ({
              id: c.id,
              choice_letter: c.choice_letter,
              choice_text: c.choice_text,
              is_correct: c.is_correct,
              explanation: c.explanation,
            })),
          }));
          setQuestions(mapped);
          setSession({
            id: testId,
            test_id: testId,
            mode: (testData?.mode as "timed" | "tutor") || "tutor",
            status: "in_progress",
            total_questions: mapped.length,
            elapsed_seconds: 0,
            duration_seconds: 3600,
            started_at: new Date().toISOString(),
          });
          setTimerRunning(true);
        }
      } catch (e) {
        console.error("Failed to load exam questions", e);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [testId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeDialog) {
        if (e.key === "Escape") setActiveDialog(null);
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const q = questions[currentIndex];

      switch (e.key.toLowerCase()) {
        case "n": nextQuestion(); break;
        case "p": prevQuestion(); break;
        case "m": if (q) toggleMark(q.id); break;
        case "l": setActiveDialog("lab"); break;
        case "o": setActiveDialog("notes"); break;
        case "c": setActiveDialog("calc"); break;
        case "f":
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
          break;
        case "enter":
          if (q && store.answers[q.id]?.selected_choice_id && !store.showExplanation[q.id]) {
            setShowExplanation(q.id, true);
          }
          break;
        case "1": case "2": case "3": case "4": case "5": case "6":
          if (q && !store.showExplanation[q.id]) {
            const idx = parseInt(e.key) - 1;
            if (q.choices[idx]) selectAnswer(q.id, q.choices[idx].id);
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeDialog, questions, currentIndex, nextQuestion, prevQuestion, toggleMark, selectAnswer, setActiveDialog, setShowExplanation, store.answers, store.showExplanation]);

  // Show result screen after submission
  if (result && !isReviewMode) {
    return <ExamResultScreen />;
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <FileX className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">No questions found for this test.</p>
        <p className="text-xs text-muted-foreground">Questions need to be added by an admin first.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/previous-tests")}>Back to Tests</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <ExamTopHeader />
      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar />
        <QuestionPanel />
      </div>
      <ExamBottomBar />

      {/* Dialogs */}
      <LabValuesDialog />
      <CalculatorDialog />
      <NotesDialog />
      <SettingsDialog />
      <ShortcutsDialog />
      <FeedbackDialog />
      <SubmitConfirmDialog />
    </div>
  );
}
