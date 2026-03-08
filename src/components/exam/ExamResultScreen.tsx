import { useExamStore } from "@/stores/exam-store";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExamResultScreen() {
  const { result, questions, answers, reset, enterReviewMode } = useExamStore();
  const navigate = useNavigate();

  if (!result) return null;

  const handleReview = () => {
    enterReviewMode();
  };

  const handleExit = () => {
    reset();
    navigate("/dashboard/previous-tests");
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex h-12 items-center justify-between bg-[hsl(var(--sidebar-bg))] px-4 shrink-0">
        <span className="text-sm font-semibold text-white">MedPrep — Test Results</span>
        <Button variant="ghost" size="sm" className="text-white hover:text-white/80" onClick={handleExit}>
          Close
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl">
          {/* Score summary */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[hsl(var(--sidebar-bg))]/10">
              <span className="text-3xl font-bold text-[hsl(var(--sidebar-bg))]">{result.score_percentage}%</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Block Complete</h1>
            <p className="text-muted-foreground mt-1">
              {result.correct} of {result.total} correct
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border bg-card p-4 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-green-500 mb-1" />
              <div className="text-2xl font-bold text-foreground">{result.correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <XCircle className="mx-auto h-6 w-6 text-destructive mb-1" />
              <div className="text-2xl font-bold text-foreground">{result.incorrect}</div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <Minus className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
              <div className="text-2xl font-bold text-foreground">{result.unanswered}</div>
              <div className="text-xs text-muted-foreground">Unanswered</div>
            </div>
          </div>

          {/* Question breakdown */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Question Breakdown</h3>
            <div className="grid grid-cols-10 gap-1">
              {questions.map((q, i) => {
                const answer = answers[q.id];
                const selected = q.choices.find((c) => c.id === answer?.selected_choice_id);
                const isCorrect = selected?.is_correct;
                const isUnanswered = !answer?.selected_choice_id;

                return (
                  <div
                    key={q.id}
                    className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
                      isUnanswered
                        ? "bg-muted text-muted-foreground"
                        : isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-destructive text-white"
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button onClick={handleReview}>Review Answers</Button>
            <Button variant="outline" onClick={() => { reset(); navigate("/dashboard/create-test"); }}>
              Create New Test
            </Button>
            <Button variant="outline" onClick={handleExit}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
