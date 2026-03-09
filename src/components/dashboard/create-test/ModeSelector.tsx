import { GraduationCap, Clock } from "lucide-react";

interface ModeSelectorProps {
  mode: "tutor" | "timed";
  onModeChange: (mode: "tutor" | "timed") => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Mode</h3>
      <div className="flex gap-3">
        {[
          { key: "tutor" as const, icon: GraduationCap, label: "Tutor", desc: "See explanations after each question" },
          { key: "timed" as const, icon: Clock, label: "Timed", desc: "Countdown timer, exam conditions" },
        ].map((m) => {
          const isActive = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onModeChange(m.key)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                isActive
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <m.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
              <div>
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
