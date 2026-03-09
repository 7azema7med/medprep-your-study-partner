import { motion } from "framer-motion";
import { GraduationCap, Clock } from "lucide-react";

interface ModeSelectorProps {
  mode: "tutor" | "timed";
  onModeChange: (mode: "tutor" | "timed") => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Mode</h3>
      <div className="grid grid-cols-2 gap-3">
        <ModeCard
          isActive={mode === "tutor"}
          onClick={() => onModeChange("tutor")}
          icon={GraduationCap}
          title="Tutor Mode"
          description="View explanations immediately after answering."
        />
        <ModeCard
          isActive={mode === "timed"}
          onClick={() => onModeChange("timed")}
          icon={Clock}
          title="Timed Mode"
          description="Simulate exam conditions with a countdown timer."
        />
      </div>
    </div>
  );
}

interface ModeCardProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
}

function ModeCard({ isActive, onClick, icon: Icon, title, description }: ModeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
        isActive
          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
          : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="mode-indicator"
          className="absolute inset-0 rounded-xl border-2 border-primary"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.button>
  );
}
