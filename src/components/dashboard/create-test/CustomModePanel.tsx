import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface CustomModePanelProps {
  maxQuestions: number;
  onValidQuestionsChange: (questionIds: string[]) => void;
}

export function CustomModePanel({ maxQuestions, onValidQuestionsChange }: CustomModePanelProps) {
  const [testIdInput, setTestIdInput] = useState("");
  const [questionIdsInput, setQuestionIdsInput] = useState("");
  
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const [validationResult, setValidationResult] = useState<{
    valid: string[];
    invalid: string[];
    duplicates: number;
  } | null>(null);

  // Parse and validate comma-separated IDs
  const validateInput = useCallback(async (input: string) => {
    if (!input.trim()) {
      setValidationResult(null);
      onValidQuestionsChange([]);
      return;
    }

    setIsValidating(true);
    
    // Clean input: remove spaces, split by comma, filter empty
    const rawIds = input.replace(/\s/g, "").split(",").filter(id => id.length > 0);
    const uniqueIds = Array.from(new Set(rawIds));
    const duplicateCount = rawIds.length - uniqueIds.length;

    // In a real app, we would query the database to verify if these IDs exist and are unused.
    // For now, we simulate validation by assuming numeric IDs are valid.
    const valid = [];
    const invalid = [];

    for (const id of uniqueIds) {
      if (/^\d+$/.test(id)) {
        valid.push(id);
      } else {
        invalid.push(id);
      }
    }

    setValidationResult({
      valid,
      invalid,
      duplicates: duplicateCount,
    });
    
    onValidQuestionsChange(valid.slice(0, maxQuestions));
    setIsValidating(false);
  }, [maxQuestions, onValidQuestionsChange]);

  // Debounce validation on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (questionIdsInput !== "") {
        validateInput(questionIdsInput);
      } else {
        setValidationResult(null);
        onValidQuestionsChange([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [questionIdsInput, validateInput]);

  const handleRetrieveByTestId = async () => {
    if (!testIdInput.trim()) return;
    
    setIsRetrieving(true);
    // Simulate API call to fetch question IDs by Test ID
    setTimeout(() => {
      // Dummy data for simulation
      const retrievedIds = "1001,1002,1003,1004";
      setQuestionIdsInput(retrievedIds);
      setIsRetrieving(false);
    }, 1000);
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    // Auto-clean pasted text if needed
    const cleaned = pastedText.replace(/\s+/g, ",");
    if (cleaned !== pastedText) {
      e.preventDefault();
      const newText = questionIdsInput + (questionIdsInput && !questionIdsInput.endsWith(",") ? "," : "") + cleaned;
      setQuestionIdsInput(newText.replace(/,+/g, ",").replace(/^,|,$/g, ""));
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs text-muted-foreground ml-2">
          This mode allows for faculty/group review; enter question IDs provided by your leader to create the same test. 
          Use commas (,) to separate IDs. No spaces allowed.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Retrieve Questions by Test ID</label>
        <div className="flex gap-3">
          <Input 
            placeholder="e.g. 781245" 
            value={testIdInput}
            onChange={(e) => setTestIdInput(e.target.value)}
            className="max-w-[200px]"
          />
          <Button 
            variant="secondary" 
            onClick={handleRetrieveByTestId}
            disabled={isRetrieving || !testIdInput.trim()}
          >
            {isRetrieving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Retrieve Questions
          </Button>
        </div>
      </div>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-medium">OR</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">
            Enter Question IDs separated by comma (,)
          </label>
          <span className="text-xs text-muted-foreground">Max: {maxQuestions}</span>
        </div>
        <Textarea 
          placeholder="104582,104583,104584" 
          value={questionIdsInput}
          onChange={(e) => setQuestionIdsInput(e.target.value)}
          onPaste={handleInputPaste}
          className="min-h-[120px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter only numbers and commas. Do not use spaces or special characters.
        </p>
      </div>

      {validationResult && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            Validation Summary
            {isValidating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                {validationResult.valid.length + validationResult.invalid.length}
              </span>
              <span className="text-xs text-muted-foreground">Total Entered</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.min(validationResult.valid.length, maxQuestions)}
              </span>
              <span className="text-xs text-muted-foreground">Valid & Included</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold ${validationResult.invalid.length > 0 ? "text-destructive" : "text-foreground"}`}>
                {validationResult.invalid.length}
              </span>
              <span className="text-xs text-muted-foreground">Invalid</span>
            </div>
          </div>

          {(validationResult.invalid.length > 0 || validationResult.duplicates > 0 || validationResult.valid.length > maxQuestions) && (
            <div className="space-y-2 mt-2 pt-2 border-t border-border/50 text-xs">
              {validationResult.invalid.length > 0 && (
                <div className="flex items-start gap-1.5 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Found {validationResult.invalid.length} invalid IDs that will be ignored.</span>
                </div>
              )}
              {validationResult.duplicates > 0 && (
                <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Removed {validationResult.duplicates} duplicate IDs.</span>
                </div>
              )}
              {validationResult.valid.length > maxQuestions && (
                <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Only the first {maxQuestions} valid questions will be included.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
