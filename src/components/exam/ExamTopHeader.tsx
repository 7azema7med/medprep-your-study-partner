import { useExamStore } from "@/stores/exam-store";
import {
  Menu, Flag, ChevronLeft, ChevronRight, Maximize,
  Highlighter, FlaskConical, StickyNote, Calculator,
  Settings, Keyboard, Strikethrough
} from "lucide-react";

export default function ExamTopHeader() {
  const {
    questions, currentIndex, answers, isReviewMode,
    setSidebarOpen, sidebarOpen, toggleMark, setActiveDialog,
    nextQuestion, prevQuestion,
  } = useExamStore();

  const currentQ = questions[currentIndex];
  const isMarked = currentQ ? (answers[currentQ.id]?.is_marked ?? false) : false;

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toolButtons = [
    { icon: Keyboard, label: "Shortcuts", dialog: "shortcuts", action: undefined },
    { icon: Maximize, label: "Full Screen", dialog: null as string | null, action: handleFullscreen },
    { icon: Highlighter, label: "Marker", dialog: "marker", action: undefined },
    { icon: Strikethrough, label: "Strikeout", dialog: null as string | null, action: undefined },
    { icon: FlaskConical, label: "Lab Values", dialog: "lab", action: undefined },
    { icon: StickyNote, label: "Notes", dialog: "notes", action: undefined },
    { icon: Calculator, label: "Calculator", dialog: "calc", action: undefined },
    { icon: Settings, label: "Settings", dialog: "settings", action: undefined },
  ];

  return (
    <div
      className="exam-font flex h-[52px] items-center justify-between px-1 select-none shrink-0"
      style={{ background: "hsl(var(--exam-header))" }}
    >
      {/* Left section */}
      <div className="flex items-center gap-1">
        {/* Navigator toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-10 w-10 flex-col items-center justify-center rounded text-white/90 hover:text-yellow-300 transition-colors"
          style={{ minWidth: 56 }}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[9px] leading-none mt-0.5">Navigator</span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-white/20 mx-1" />

        {/* Item counter */}
        <div className="text-white px-2">
          <div className="text-[13px] font-semibold leading-tight">
            Item {currentIndex + 1} of {questions.length}
          </div>
          {currentQ?.public_id && (
            <div className="text-[10px] text-white/50 leading-tight">
              Question Id: {currentQ.public_id}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/20 mx-1" />

        {/* Mark */}
        <button
          onClick={() => currentQ && toggleMark(currentQ.id)}
          className={`flex h-10 flex-col items-center justify-center rounded px-3 transition-colors ${
            isMarked
              ? "text-yellow-300"
              : "text-white/90 hover:text-yellow-300"
          }`}
        >
          <Flag className="h-5 w-5" fill={isMarked ? "currentColor" : "none"} />
          <span className="text-[9px] leading-none mt-0.5">Mark</span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-white/20 mx-1" />

        {/* Previous / Next */}
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex h-10 flex-col items-center justify-center rounded px-3 text-white/90 hover:text-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-[9px] leading-none mt-0.5">Previous</span>
        </button>

        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
          className="flex h-10 flex-col items-center justify-center rounded px-3 text-white/90 hover:text-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="text-[9px] leading-none mt-0.5">Next</span>
        </button>
      </div>

      {/* Right section - tools */}
      <div className="flex items-center gap-0">
        {toolButtons.map(({ icon: Icon, label, dialog, action }) => (
          <button
            key={label}
            onClick={() => action ? action() : dialog ? setActiveDialog(dialog) : undefined}
            className="flex h-10 flex-col items-center justify-center rounded px-2.5 text-white/80 hover:text-yellow-300 transition-colors"
            style={{ minWidth: 48 }}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="text-[9px] leading-none mt-0.5 whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
