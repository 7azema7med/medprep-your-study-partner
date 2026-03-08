import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useExamStore } from "@/stores/exam-store";

export default function CalculatorDialog() {
  const { activeDialog, setActiveDialog } = useExamStore();
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const open = activeDialog === "calc";

  const input = (val: string) => {
    if (fresh) {
      setDisplay(val === "." ? "0." : val);
      setFresh(false);
    } else {
      if (val === "." && display.includes(".")) return;
      setDisplay(display + val);
    }
  };

  const operate = (nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op) {
      let result = prev;
      if (op === "+") result = prev + current;
      if (op === "-") result = prev - current;
      if (op === "×") result = prev * current;
      if (op === "÷") result = current !== 0 ? prev / current : 0;
      setDisplay(String(parseFloat(result.toFixed(10))));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setFresh(true);
  };

  const equals = () => {
    if (prev !== null && op) {
      operate("=");
      setOp(null);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setActiveDialog(null)}>
      <DialogContent className="max-w-xs p-4">
        <DialogHeader>
          <DialogTitle className="text-sm">Calculator</DialogTitle>
        </DialogHeader>

        <div className="rounded border bg-card p-3 text-right text-2xl font-mono text-foreground">
          {display}
        </div>

        <div className="grid grid-cols-4 gap-1.5 mt-2">
          <button
            onClick={clear}
            className="col-span-2 rounded bg-destructive/10 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
          >
            C
          </button>
          <button
            onClick={() => setDisplay(display.slice(0, -1) || "0")}
            className="col-span-2 rounded bg-muted py-2 text-sm font-medium text-foreground hover:bg-muted/80"
          >
            ⌫
          </button>
          {buttons.map((row, ri) =>
            row.map((btn) => {
              const isOp = ["+", "-", "×", "÷"].includes(btn);
              const isEq = btn === "=";
              return (
                <button
                  key={`${ri}-${btn}`}
                  onClick={() => {
                    if (isEq) equals();
                    else if (isOp) operate(btn);
                    else input(btn);
                  }}
                  className={`rounded py-2.5 text-sm font-medium transition-colors ${
                    isOp
                      ? "bg-[hsl(var(--sidebar-bg))] text-white hover:bg-[hsl(var(--sidebar-bg-hover))]"
                      : isEq
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {btn}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
