import { useExamStore } from "@/stores/exam-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function QuestionSidebar() {
  const {
    questions, currentIndex, answers, isReviewMode,
    setCurrentIndex, sidebarOpen, showExplanation,
  } = useExamStore();

  if (!sidebarOpen) return null;

  return (
    <div
      className="exam-font shrink-0 flex flex-col"
      style={{
        width: 110,
        background: "hsl(var(--exam-nav-bg))",
        borderRight: "1px solid hsl(var(--exam-nav-border))",
      }}
    >
      {/* Navigator header */}
      <div
        className="flex items-center justify-center py-1.5 text-[11px] font-bold text-white uppercase tracking-wide"
        style={{ background: "hsl(var(--exam-nav-header))" }}
      >
        Navigator
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-3 text-[10px] font-semibold text-center border-b"
        style={{
          borderColor: "hsl(var(--exam-nav-border))",
          background: "hsl(var(--exam-nav-border))",
          color: "hsl(var(--foreground))",
        }}
      >
        <span className="py-0.5">#</span>
        <span className="py-0.5">Status</span>
        <span className="py-0.5">Flag</span>
      </div>

      {/* Question list */}
      <ScrollArea className="flex-1">
        <div>
          {questions.map((q, i) => {
            const isCurrent = i === currentIndex;
            const answer = answers[q.id];
            const isAnswered = !!answer?.selected_choice_id;
            const isMarked = answer?.is_marked ?? false;
            const isFlagged = answer?.is_flagged ?? false;

            // Determine correctness in review mode
            let statusIndicator = "";
            let statusColor = "";
            if (isReviewMode && isAnswered) {
              const selectedChoice = q.choices.find(c => c.id === answer.selected_choice_id);
              if (selectedChoice?.is_correct) {
                statusIndicator = "✓";
                statusColor = "text-green-600";
              } else {
                statusIndicator = "✗";
                statusColor = "text-red-600";
              }
            } else if (isAnswered) {
              statusIndicator = "●";
              statusColor = "text-green-600";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`grid w-full grid-cols-3 items-center text-center text-[11px] transition-all ${
                  isCurrent
                    ? "font-bold"
                    : "hover:opacity-80"
                } ${i % 2 === 0 ? "" : "bg-black/[0.03] dark:bg-white/[0.03]"}`}
                style={
                  isCurrent
                    ? {
                        background: "hsl(var(--exam-nav-selected))",
                        color: "hsl(var(--exam-nav-selected-font))",
                      }
                    : {}
                }
              >
                <span className="py-1.5">{i + 1}</span>
                <span className={`py-1.5 ${isCurrent ? "" : statusColor}`}>
                  {statusIndicator}
                </span>
                <span className="py-1.5">
                  {isMarked && (
                    <span className={isCurrent ? "" : "text-blue-500"}>⚑</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
