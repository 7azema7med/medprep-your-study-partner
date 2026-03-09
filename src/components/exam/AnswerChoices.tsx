import { useExamStore } from "@/stores/exam-store";
import type { ExamQuestion } from "@/lib/exam-types";
import { CheckCircle2, XCircle } from "lucide-react";
import { useCallback } from "react";

interface Props {
  question: ExamQuestion;
}

export default function AnswerChoices({ question }: Props) {
  const { answers, selectAnswer, strikeoutsArray, showExplanation, isReviewMode, toggleStrikeout } = useExamStore();

  const answer = answers[question.id];
  const selectedId = answer?.selected_choice_id;
  const isRevealed = showExplanation[question.id] || isReviewMode;
  const struckChoices = strikeoutsArray[question.id] || [];

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, choiceId: string) => {
      e.preventDefault();
      if (!isRevealed) {
        toggleStrikeout(question.id, choiceId);
      }
    },
    [isRevealed, question.id, toggleStrikeout]
  );

  return (
    <div className="space-y-0.5">
      {question.choices.map((choice) => {
        const isSelected = selectedId === choice.id;
        const isStruck = struckChoices.includes(choice.id);
        const isCorrect = choice.is_correct;

        // Row background in review
        let rowBg = "";
        if (isRevealed) {
          if (isCorrect) rowBg = "bg-green-50 dark:bg-green-900/20";
          else if (isSelected && !isCorrect) rowBg = "bg-red-50 dark:bg-red-900/20";
        }

        // Radio style
        let radioClass = "";
        if (isRevealed && isCorrect) radioClass = "correct";
        else if (isRevealed && isSelected && !isCorrect) radioClass = "incorrect";
        else if (isSelected) radioClass = "selected";

        return (
          <button
            key={choice.id}
            onClick={() => !isRevealed && selectAnswer(question.id, choice.id)}
            onContextMenu={(e) => handleContextMenu(e, choice.id)}
            disabled={isRevealed}
            className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-all
              ${rowBg}
              ${!isRevealed && !isSelected ? "hover:bg-[hsl(var(--exam-answer-hover))]" : ""}
              ${isRevealed && !isCorrect && !isSelected ? "opacity-60" : ""}
            `}
          >
            {/* Radio */}
            <div className={`nbme-radio-outer ${radioClass}`}>
              {(isSelected || (isRevealed && isCorrect)) && (
                <div className="nbme-radio-inner" />
              )}
            </div>

            {/* Choice letter */}
            <span className="w-5 shrink-0 text-[13px] font-bold text-muted-foreground">
              {choice.choice_letter}.
            </span>

            {/* Choice text */}
            <span
              className={`flex-1 text-[13px] leading-snug ${
                isStruck && !isRevealed ? "choice-struck" : ""
              }`}
            >
              {choice.choice_text}
            </span>

            {/* Review icons */}
            {isRevealed && isCorrect && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            )}
            {isRevealed && isSelected && !isCorrect && (
              <XCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
          </button>
        );
      })}

      {/* Right-click hint */}
      {!isRevealed && (
        <p className="text-[10px] text-muted-foreground/50 mt-2 pl-1">
          Right-click a choice to strike it out
        </p>
      )}
    </div>
  );
}
