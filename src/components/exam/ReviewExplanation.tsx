import type { ExamQuestion } from "@/lib/exam-types";
import { useExamStore } from "@/stores/exam-store";
import { CheckCircle2, XCircle, Lightbulb, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  question: ExamQuestion;
}

export default function ReviewExplanation({ question }: Props) {
  const { answers } = useExamStore();
  const answer = answers[question.id];
  const selectedChoice = question.choices.find((c) => c.id === answer?.selected_choice_id);
  const correctChoice = question.choices.find((c) => c.is_correct);
  const isCorrect = selectedChoice?.is_correct;

  return (
    <div className="mt-6 space-y-4">
      {/* Result banner */}
      <div className={`flex items-center gap-3 rounded-lg p-4 ${
        isCorrect
          ? "bg-green-50 border border-green-200"
          : answer?.selected_choice_id
          ? "bg-red-50 border border-red-200"
          : "bg-yellow-50 border border-yellow-200"
      }`}>
        {isCorrect ? (
          <>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm font-bold text-green-800">Correct!</p>
              <p className="text-xs text-green-700">You selected: {selectedChoice?.choice_letter}. {selectedChoice?.choice_text}</p>
            </div>
          </>
        ) : answer?.selected_choice_id ? (
          <>
            <XCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="text-sm font-bold text-red-800">Incorrect</p>
              <p className="text-xs text-red-700">
                You selected: {selectedChoice?.choice_letter}. {selectedChoice?.choice_text}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Correct answer: {correctChoice?.choice_letter}. {correctChoice?.choice_text}
              </p>
            </div>
          </>
        ) : (
          <>
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="text-sm font-bold text-yellow-800">Unanswered</p>
              <p className="text-xs text-yellow-700">
                Correct answer: {correctChoice?.choice_letter}. {correctChoice?.choice_text}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main explanation */}
      {question.explanation && (
        <div className="rounded-lg border border-[hsl(var(--sidebar-bg))]/20 bg-[hsl(var(--sidebar-bg))]/5 p-5">
          <h3 className="mb-2 text-sm font-bold text-[hsl(var(--sidebar-bg))]">Explanation</h3>
          <p className="text-sm leading-relaxed text-foreground">{question.explanation}</p>
        </div>
      )}

      {/* Educational objective */}
      {question.educational_objective && (
        <div className="rounded-lg border border-muted bg-muted/30 p-4">
          <h4 className="mb-1 text-xs font-bold uppercase text-muted-foreground">Educational Objective</h4>
          <p className="text-sm text-foreground">{question.educational_objective}</p>
        </div>
      )}

      {/* Per-choice explanations */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase text-muted-foreground">Answer Explanations</h4>
        {question.choices.map((c) => (
          <div key={c.id} className={`flex gap-2 rounded border p-3 text-sm ${
            c.is_correct ? "border-green-200 bg-green-50/50" : "border-border"
          }`}>
            <span className="font-semibold text-muted-foreground shrink-0">{c.choice_letter}.</span>
            <div>
              <span className="font-medium">{c.choice_text}</span>
              {c.explanation && (
                <p className="mt-1 text-xs text-muted-foreground">{c.explanation}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
