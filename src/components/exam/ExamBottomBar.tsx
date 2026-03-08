import { useEffect } from "react";
import { useExamStore } from "@/stores/exam-store";
import { Clock, BookOpen, NotebookPen, Layers, MessageSquare, Pause, StopCircle } from "lucide-react";

export default function ExamBottomBar() {
  const {
    elapsedSeconds, timerRunning, tick, session, isReviewMode,
    settings, setActiveDialog,
  } = useExamStore();

  // Timer tick
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tick]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-12 items-center justify-between bg-[hsl(var(--sidebar-bg))] px-3 select-none shrink-0">
      {/* Left: Timer */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/70" />
          <div className="text-white">
            <div className="text-xs font-semibold leading-tight">
              Block Time Elapsed: {settings.showTimer ? formatTime(elapsedSeconds) : "--:--:--"}
            </div>
            <div className="text-[10px] text-white/60 uppercase leading-tight">
              {session?.mode === "tutor" ? "TUTOR" : "TIMED"}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1">
        {[
          { icon: BookOpen, label: "Medical Library", dialog: null },
          { icon: NotebookPen, label: "My Notebook", dialog: null },
          { icon: Layers, label: "Flashcards", dialog: "flashcard" },
          { icon: MessageSquare, label: "Feedback", dialog: "feedback" },
          { icon: Pause, label: "Suspend", dialog: "suspend" },
          { icon: StopCircle, label: isReviewMode ? "End Review" : "End Block", dialog: "submit" },
        ].map(({ icon: Icon, label, dialog }) => (
          <button
            key={label}
            onClick={() => dialog && setActiveDialog(dialog)}
            className="flex flex-col items-center gap-0.5 rounded px-3 py-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Icon className="h-4 w-4" />
            <span className="text-[9px] leading-none">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
