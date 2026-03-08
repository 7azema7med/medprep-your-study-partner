import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/stores/exam-store";
import { toast } from "sonner";

export default function FeedbackDialog() {
  const { activeDialog, setActiveDialog, questions, currentIndex } = useExamStore();
  const open = activeDialog === "feedback";
  const [issueType, setIssueType] = useState("content_error");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    // TODO: save to backend
    toast.success("Feedback submitted. Thank you!");
    setMessage("");
    setActiveDialog(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setActiveDialog(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Report Issue — Question {currentIndex + 1}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={issueType} onValueChange={setIssueType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="content_error">Content Error</SelectItem>
              <SelectItem value="wrong_answer">Wrong Answer Marked</SelectItem>
              <SelectItem value="formatting">Formatting Issue</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue..."
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmit} className="w-full">Submit Feedback</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
