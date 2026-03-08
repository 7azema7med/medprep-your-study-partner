import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useExamStore } from "@/stores/exam-store";

const shortcuts = [
  { key: "N", desc: "Next question" },
  { key: "P", desc: "Previous question" },
  { key: "M", desc: "Mark question" },
  { key: "1–6", desc: "Select answer choice" },
  { key: "L", desc: "Open Lab Values" },
  { key: "O", desc: "Open Notes" },
  { key: "C", desc: "Open Calculator" },
  { key: "F", desc: "Toggle fullscreen" },
  { key: "S", desc: "Strikeout mode toggle" },
  { key: "Enter", desc: "Submit answer" },
  { key: "Esc", desc: "Close dialog" },
];

export default function ShortcutsDialog() {
  const { activeDialog, setActiveDialog } = useExamStore();
  const open = activeDialog === "shortcuts";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setActiveDialog(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.desc}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono font-medium">{s.key}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
