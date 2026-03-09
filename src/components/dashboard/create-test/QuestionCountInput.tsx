import { Minus, Plus } from "lucide-react";

interface QuestionCountInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function QuestionCountInput({ value, onChange, max = 999 }: QuestionCountInputProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Number of Questions</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(value - 1, 1))}
          disabled={value <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const num = parseInt(e.target.value) || 1;
            onChange(Math.min(Math.max(num, 1), max));
          }}
          className="h-9 w-16 rounded-md border border-border bg-transparent text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => onChange(Math.min(value + 1, max))}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
