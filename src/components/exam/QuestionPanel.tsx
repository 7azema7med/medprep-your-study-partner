import { useExamStore } from "@/stores/exam-store";
import AnswerChoices from "./AnswerChoices";
import ReviewExplanation from "./ReviewExplanation";

export default function QuestionPanel() {
  const { questions, currentIndex, settings, showExplanation, setShowExplanation, answers, isReviewMode } = useExamStore();
  const question = questions[currentIndex];
  if (!question) return null;

  const fontSizeClass = {
    small: "text-[13px]",
    medium: "text-[14px]",
    large: "text-[16px]",
  }[settings.fontSize];

  const lineClass = {
    compact: "leading-snug",
    normal: "leading-relaxed",
    relaxed: "leading-loose",
  }[settings.lineSpacing];

  const hasAnswer = !!answers[question.id]?.selected_choice_id;
  const isExplanationShown = showExplanation[question.id];

  const handleSubmitAnswer = () => {
    if (hasAnswer) {
      setShowExplanation(question.id, true);
    }
  };

  return (
    <div
      className="exam-font flex-1 overflow-y-auto"
      style={{ background: "hsl(var(--exam-content-bg))" }}
    >
      <div className="max-w-4xl p-6 md:p-8">
        {/* Question stem */}
        <div className={`mb-6 ${fontSizeClass} ${lineClass} text-foreground`}>
          {question.question_text}
        </div>

        {/* Question image */}
        {question.question_image && (
          <div className="mb-6">
            <img
              src={question.question_image}
              alt="Question figure"
              className="max-w-full rounded border"
            />
          </div>
        )}

        {/* Answer choices */}
        <AnswerChoices question={question} />

        {/* Submit button (tutor mode) */}
        {!isReviewMode && !isExplanationShown && hasAnswer && (
          <button
            onClick={handleSubmitAnswer}
            className="mt-5 rounded px-8 py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110"
            style={{
              background: "linear-gradient(to bottom, hsl(210, 52%, 57%), hsl(227, 42%, 43%))",
            }}
          >
            Submit
          </button>
        )}

        {/* Explanation */}
        {isExplanationShown && <ReviewExplanation question={question} />}
      </div>
    </div>
  );
}
