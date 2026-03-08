import { useExamStore } from "@/stores/exam-store";
import type { ExamQuestion } from "@/lib/exam-types";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  question: ExamQuestion;
}

export default function AnswerChoices({ question }: Props) {
  const { answers, selectAnswer, strikeoutsArray, showExplanation, isReviewMode } = useExamStore();

  const answer = answers[question.id];
  const selectedId = answer?.selected_choice_id;
  const isRevealed = showExplanation[question.id] || isReviewMode;
  const struckChoices = strikeoutsArray[question.id] || [];

  return (
    <div className="space-y-1 rounded-lg border border-border bg-card p-4">
      {question.choices.map((choice) => {
        const isSelected = selectedId === choice.id;
        const isStruck = struckChoices.includes(choice.id);
        const isCorrect = choice.is_correct;

        let rowStyle = "border-transparent hover:bg-muted/50";
        if (isRevealed) {
          if (isCorrect) rowStyle = "border-green-500 bg-green-50";
          else if (isSelected && !isCorrect) rowStyle = "border-destructive bg-red-50";
          else rowStyle = "border-transparent opacity-60";
        } else if (isSelected) {
          rowStyle = "border-[hsl(var(--sidebar-bg))] bg-[hsl(var(--sidebar-bg))]/5";
        }

        return (
          <button
            key={choice.id}
            onClick={() => !isRevealed && selectAnswer(question.id, choice.id)}
            disabled={isRevealed}
            className={`flex w-full items-center gap-3 rounded-md border-2 px-3 py-2.5 text-left transition-all ${rowStyle} ${
              isStruck && !isRevealed ? "opacity-40" : ""
            }`}
          >
            {/* Radio circle */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                isSelected && !isRevealed
                  ? "border-[hsl(var(--sidebar-bg))] bg-[hsl(var(--sidebar-bg))]"
                  : isRevealed && isCorrect
                  ? "border-green-500 bg-green-500"
                  : isRevealed && isSelected && !isCorrect
                  ? "border-destructive bg-destructive"
                  : "border-muted-foreground/40"
              }`}
            >
              {(isSelected || (isRevealed && isCorrect)) && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>

            {/* Label */}
            <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">
              {choice.choice_letter}.
            </span>

            {/* Text */}
            <span className={`flex-1 text-sm text-foreground ${isStruck && !isRevealed ? "line-through" : ""}`}>
              {choice.choice_text}
            </span>

            {/* Correct/incorrect icons in review */}
            {isRevealed && isCorrect && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            )}
            {isRevealed && isSelected && !isCorrect && (
              <XCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
          </button>
        );
      })}
    </div>
  );
}
