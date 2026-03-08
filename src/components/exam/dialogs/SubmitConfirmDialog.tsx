import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useExamStore } from "@/stores/exam-store";
import { useNavigate } from "react-router-dom";

export default function SubmitConfirmDialog() {
  const { activeDialog, setActiveDialog, submitExam, answers, questions, isReviewMode } = useExamStore();
  const navigate = useNavigate();
  const open = activeDialog === "submit";

  const answeredCount = Object.values(answers).filter((a) => a.selected_choice_id).length;
  const unanswered = questions.length - answeredCount;

  const handleSubmit = () => {
    if (isReviewMode) {
      navigate("/dashboard/previous-tests");
      setActiveDialog(null);
      return;
    }
    submitExam();
    setActiveDialog(null);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && setActiveDialog(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isReviewMode ? "End Review?" : "End Block & Submit?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isReviewMode ? (
              "This will end your review and return to the dashboard."
            ) : (
              <>
                You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
                {unanswered > 0 && (
                  <span className="text-destructive"> {unanswered} question{unanswered > 1 ? "s" : ""} left unanswered.</span>
                )}
                <br />
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            {isReviewMode ? "End Review" : "Submit"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
