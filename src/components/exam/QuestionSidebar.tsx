import { useExamStore } from "@/stores/exam-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function QuestionSidebar() {
  const {
    questions, currentIndex, answers, isReviewMode,
    setCurrentIndex, sidebarOpen, showExplanation,
  } = useExamStore();

  if (!sidebarOpen) return null;

  const getStatusColor = (qId: string, index: number) => {
    const answer = answers[qId];
    const isCurrent = index === currentIndex;

    if (isReviewMode && answer?.selected_choice_id) {
      const q = questions[index];
      const selectedChoice = q.choices.find((c) => c.id === answer.selected_choice_id);
      if (selectedChoice?.is_correct) return "bg-green-500";
      return "bg-destructive";
    }

    if (answer?.is_marked) return "bg-yellow-400";
    if (answer?.selected_choice_id) return "bg-[hsl(var(--sidebar-bg))]";
    return "bg-muted-foreground/40";
  };

  return (
    <div className="w-16 shrink-0 border-r bg-card flex flex-col">
      <ScrollArea className="flex-1">
        <div className="py-1">
          {questions.map((q, i) => {
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`flex w-full items-center gap-2 px-2 py-1 text-xs transition-colors ${
                  isCurrent
                    ? "bg-[hsl(var(--sidebar-bg))] text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="w-6 text-right font-medium">{i + 1}</span>
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${getStatusColor(q.id, i)}`} />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
