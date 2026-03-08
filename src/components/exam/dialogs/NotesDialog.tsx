import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useExamStore } from "@/stores/exam-store";

export default function NotesDialog() {
  const { activeDialog, setActiveDialog, questions, currentIndex, notes, setNote } = useExamStore();
  const open = activeDialog === "notes";
  const q = questions[currentIndex];
  const noteText = q ? (notes[q.id] || "") : "";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setActiveDialog(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Notes — Question {currentIndex + 1}
          </DialogTitle>
        </DialogHeader>
        <Textarea
          value={noteText}
          onChange={(e) => q && setNote(q.id, e.target.value)}
          placeholder="Type your notes here..."
          className="min-h-[200px] text-sm"
        />
        <p className="text-xs text-muted-foreground">Notes are saved automatically.</p>
      </DialogContent>
    </Dialog>
  );
}
