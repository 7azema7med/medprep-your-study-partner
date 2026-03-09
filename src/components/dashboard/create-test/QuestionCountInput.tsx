import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

interface QuestionCountInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function QuestionCountInput({ value, onChange, max = 999 }: QuestionCountInputProps) {
  const increment = () => onChange(Math.min(value + 1, max));
  const decrement = () => onChange(Math.max(value - 1, 1));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Number of Questions</h3>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-border bg-card">
          <motion.button
            whileHover={{ backgroundColor: "hsl(var(--muted))" }}
            whileTap={{ scale: 0.95 }}
            onClick={decrement}
            disabled={value <= 1}
            className="flex h-11 w-11 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <Minus className="h-4 w-4" />
          </motion.button>
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const num = parseInt(e.target.value) || 1;
              onChange(Math.min(Math.max(num, 1), max));
            }}
            className="h-11 w-20 border-x border-border bg-transparent text-center text-lg font-semibold text-foreground focus:outline-none"
          />
          <motion.button
            whileHover={{ backgroundColor: "hsl(var(--muted))" }}
            whileTap={{ scale: 0.95 }}
            onClick={increment}
            disabled={value >= max}
            className="flex h-11 w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
        <p className="text-sm text-muted-foreground">
          questions per block
        </p>
      </div>
    </div>
  );
}
