import { useExamStore } from "@/stores/exam-store";
import {
  Menu, Flag, ChevronLeft, ChevronRight, Maximize, Highlighter,
  FlaskConical, StickyNote, Calculator, Settings, Keyboard
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

  return (
    <div className="flex h-12 items-center justify-between bg-[hsl(var(--sidebar-bg))] px-2 select-none shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-8 w-8 items-center justify-center rounded text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-1 text-white">
          <div className="text-sm font-semibold leading-tight">
            Item {currentIndex + 1} of {questions.length}
          </div>
          {currentQ?.external_question_id && (
            <div className="text-[10px] text-white/60 leading-tight">
              Question Id: {currentQ.external_question_id}
            </div>
          )}
        </div>
      </div>

      {/* Center section */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => currentQ && toggleMark(currentQ.id)}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            isMarked
              ? "bg-white/20 text-yellow-300"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Flag className="h-4 w-4" fill={isMarked ? "currentColor" : "none"} />
          Mark
        </button>

        <div className="mx-2 h-6 w-px bg-white/20" />

        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 rounded px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-1 rounded px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Right section - tools */}
      <div className="flex items-center gap-0.5">
        {[
          { icon: Keyboard, label: "Shortcuts", dialog: "shortcuts" },
          { icon: Maximize, label: "Full Screen", dialog: null, action: handleFullscreen },
          { icon: Highlighter, label: "Marker", dialog: "marker" },
          { icon: FlaskConical, label: "Lab Values", dialog: "lab" },
          { icon: StickyNote, label: "Notes", dialog: "notes" },
          { icon: Calculator, label: "Calculator", dialog: "calc" },
          { icon: Settings, label: "Settings", dialog: "settings" },
        ].map(({ icon: Icon, label, dialog, action }) => (
          <button
            key={label}
            onClick={() => action ? action() : setActiveDialog(dialog)}
            className="flex flex-col items-center gap-0.5 rounded px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Icon className="h-4 w-4" />
            <span className="text-[9px] leading-none">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
