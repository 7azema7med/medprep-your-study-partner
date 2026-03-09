import { motion } from "framer-motion";

interface QuestionModeSelectorProps {
  questionMode: "standard" | "custom";
  onQuestionModeChange: (mode: "standard" | "custom") => void;
}

export function QuestionModeSelector({ questionMode, onQuestionModeChange }: QuestionModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Question Mode</h3>
      <div className="relative inline-flex rounded-lg bg-muted p-1">
        <motion.div
          layoutId="question-mode-bg"
          className="absolute inset-y-1 rounded-md bg-card shadow-sm"
          style={{
            left: questionMode === "standard" ? "4px" : "50%",
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        />
        <button
          onClick={() => onQuestionModeChange("standard")}
          className={`relative z-10 rounded-md px-6 py-2 text-sm font-medium transition-colors ${
            questionMode === "standard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => onQuestionModeChange("custom")}
          className={`relative z-10 rounded-md px-6 py-2 text-sm font-medium transition-colors ${
            questionMode === "custom" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Custom
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {questionMode === "standard"
          ? "Select subjects and systems to generate a randomized block."
          : "Enter specific Question IDs or retrieve from a shared Test ID."}
      </p>
    </div>
  );
}
