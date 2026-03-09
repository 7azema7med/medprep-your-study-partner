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

  const copyQuestionId = () => {
    if (question.public_id) {
      navigator.clipboard.writeText(question.public_id.toString());
      toast.success("Question ID copied to clipboard");
    }
  };

  return (
    <div className="exam-font mt-8 space-y-4 border-t-2 pt-6" style={{ borderColor: "hsl(var(--exam-header))" }}>
      {/* Result banner */}
      <div className={`flex items-center gap-3 rounded-lg p-4 ${
        isCorrect
          ? "bg-green-50 dark:bg-green-900/20 border border-green-300"
          : answer?.selected_choice_id
          ? "bg-red-50 dark:bg-red-900/20 border border-red-300"
          : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300"
      }`}>
        {isCorrect ? (
          <>
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-green-800 dark:text-green-300">Correct!</p>
              <p className="text-[12px] text-green-700 dark:text-green-400">
                You selected: {selectedChoice?.choice_letter}. {selectedChoice?.choice_text}
              </p>
            </div>
          </>
        ) : answer?.selected_choice_id ? (
          <>
            <XCircle className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-red-800 dark:text-red-300">Incorrect</p>
              <p className="text-[12px] text-red-700 dark:text-red-400">
                You selected: {selectedChoice?.choice_letter}. {selectedChoice?.choice_text}
              </p>
              <p className="text-[12px] text-green-700 dark:text-green-400 mt-1">
                Correct answer: {correctChoice?.choice_letter}. {correctChoice?.choice_text}
              </p>
            </div>
          </>
        ) : (
          <>
            <Lightbulb className="h-6 w-6 text-yellow-600 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-yellow-800 dark:text-yellow-300">Unanswered</p>
              <p className="text-[12px] text-yellow-700 dark:text-yellow-400">
                Correct answer: {correctChoice?.choice_letter}. {correctChoice?.choice_text}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Explanation - UWorld green box style */}
      {question.explanation && (
        <div className="rounded border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/10 p-5">
          <h3 className="mb-2 text-[13px] font-bold text-green-800 dark:text-green-300 uppercase tracking-wide">
            Explanation
          </h3>
          <p className="text-[13px] leading-relaxed text-foreground">{question.explanation}</p>
        </div>
      )}

      {/* Educational objective - UWorld blue box */}
      {question.educational_objective && (
        <div
          className="rounded border-l-4 p-4"
          style={{
            borderColor: "hsl(var(--exam-header))",
            background: "hsl(var(--exam-header) / 0.05)",
          }}
        >
          <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "hsl(var(--exam-header))" }}>
            Educational Objective
          </h4>
          <p className="text-[13px] text-foreground">{question.educational_objective}</p>
        </div>
      )}

      {/* Question ID */}
      {question.public_id && (
        <div className="flex items-center justify-between rounded bg-muted/30 px-4 py-2 border border-border">
          <span className="text-[12px] text-muted-foreground">
            Question ID: <span className="font-semibold text-foreground">{question.public_id}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={copyQuestionId} className="h-7 text-[11px]">
            <Copy className="mr-1.5 h-3 w-3" />
            Copy ID
          </Button>
        </div>
      )}

      {/* Per-choice explanations table */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wide">
          Answer Explanations
        </h4>
        {question.choices.map((c) => (
          <div
            key={c.id}
            className={`flex gap-2 rounded border p-3 text-[13px] ${
              c.is_correct
                ? "border-green-300 bg-green-50/50 dark:bg-green-900/10"
                : "border-border"
            }`}
          >
            <span className="font-bold text-muted-foreground shrink-0">{c.choice_letter}.</span>
            <div>
              <span className="font-medium">{c.choice_text}</span>
              {c.explanation && (
                <p className="mt-1 text-[12px] text-muted-foreground">{c.explanation}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
