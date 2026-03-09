import { useEffect } from "react";
import { useExamStore } from "@/stores/exam-store";
import {
  Clock, BookOpen, NotebookPen, Layers,
  MessageSquare, Pause, StopCircle
} from "lucide-react";

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

  const actions = [
    { icon: BookOpen, label: "Medical Library", dialog: null as string | null },
    { icon: NotebookPen, label: "My Notebook", dialog: null as string | null },
    { icon: Layers, label: "Flashcards", dialog: "flashcard" },
    { icon: MessageSquare, label: "Feedback", dialog: "feedback" },
    { icon: Pause, label: "Suspend", dialog: "suspend" },
    { icon: StopCircle, label: isReviewMode ? "End Review" : "End Block", dialog: "submit" },
  ];

  return (
    <div
      className="exam-font flex h-[52px] items-center justify-between px-2 select-none shrink-0"
      style={{ background: "hsl(var(--exam-header))" }}
    >
      {/* Left: Timer */}
      <div className="flex items-center gap-3">
        <button className="flex h-10 flex-col items-center justify-center rounded px-3 text-white/80 hover:text-yellow-300 transition-colors">
          <Clock className="h-[18px] w-[18px]" />
          <span className="text-[9px] leading-none mt-0.5">
            {settings.showTimer ? formatTime(elapsedSeconds) : "Timer"}
          </span>
        </button>

        <div className="h-8 w-px bg-white/20" />

        <div className="text-white/70 text-[11px]">
          <span className="font-semibold text-white">
            Block Time: {settings.showTimer ? formatTime(elapsedSeconds) : "--:--:--"}
          </span>
          <span className="ml-3 text-white/50 uppercase text-[10px]">
            {session?.mode === "tutor" ? "TUTOR MODE" : "TIMED MODE"}
          </span>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-0">
        {actions.map(({ icon: Icon, label, dialog }) => (
          <button
            key={label}
            onClick={() => dialog && setActiveDialog(dialog)}
            className="flex h-10 flex-col items-center justify-center rounded px-3 text-white/80 hover:text-yellow-300 transition-colors"
            style={{ minWidth: 52 }}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="text-[9px] leading-none mt-0.5 whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
