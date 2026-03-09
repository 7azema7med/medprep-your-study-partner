interface QuestionModeSelectorProps {
  questionMode: "standard" | "custom";
  onQuestionModeChange: (mode: "standard" | "custom") => void;
}

export function QuestionModeSelector({ questionMode, onQuestionModeChange }: QuestionModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Question Mode</h3>
      <div className="inline-flex rounded-lg border border-border overflow-hidden">
        {(["standard", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onQuestionModeChange(m)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              questionMode === m
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "standard" ? "Standard" : "Custom"}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {questionMode === "standard"
          ? "Select subjects and systems to generate a randomized block."
          : "Enter specific Question IDs or retrieve from a shared Test ID."}
      </p>
    </div>
  );
}
