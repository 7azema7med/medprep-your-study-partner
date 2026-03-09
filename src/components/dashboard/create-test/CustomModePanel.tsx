import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, CheckCircle2, Loader2, Info, Search, 
  Copy, HelpCircle, ChevronDown, ChevronUp 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CustomModePanelProps {
  maxQuestions: number;
  onValidQuestionsChange: (questionIds: string[]) => void;
}

export function CustomModePanel({ maxQuestions, onValidQuestionsChange }: CustomModePanelProps) {
  const [testIdInput, setTestIdInput] = useState("");
  const [questionIdsInput, setQuestionIdsInput] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [retrieveSuccess, setRetrieveSuccess] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  
  const [validationResult, setValidationResult] = useState<{
    valid: string[];
    invalid: string[];
    duplicates: number;
    used: string[];
  } | null>(null);

  const validateInput = useCallback(async (input: string) => {
    if (!input.trim()) {
      setValidationResult(null);
      onValidQuestionsChange([]);
      return;
    }

    setIsValidating(true);
    
    const rawIds = input.replace(/\s/g, "").split(",").filter(id => id.length > 0);
    const uniqueIds = Array.from(new Set(rawIds));
    const duplicateCount = rawIds.length - uniqueIds.length;

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const id of uniqueIds) {
      if (/^\d+$/.test(id)) {
        valid.push(id);
      } else {
        invalid.push(id);
      }
    }

    // Simulate async validation delay
    await new Promise(resolve => setTimeout(resolve, 300));

    setValidationResult({
      valid,
      invalid,
      duplicates: duplicateCount,
      used: [],
    });
    
    onValidQuestionsChange(valid.slice(0, maxQuestions));
    setIsValidating(false);
  }, [maxQuestions, onValidQuestionsChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (questionIdsInput !== "") {
        validateInput(questionIdsInput);
      } else {
        setValidationResult(null);
        onValidQuestionsChange([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [questionIdsInput, validateInput]);

  const handleRetrieveByTestId = async () => {
    if (!testIdInput.trim()) return;
    
    setIsRetrieving(true);
    setRetrieveSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const retrievedIds = "104582,104583,104584,104585,104586";
    setQuestionIdsInput(retrievedIds);
    setIsRetrieving(false);
    setRetrieveSuccess(true);
    
    setTimeout(() => setRetrieveSuccess(false), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    // Only allow digits and commas
    value = value.replace(/[^0-9,]/g, "");
    // Remove multiple consecutive commas
    value = value.replace(/,+/g, ",");
    setQuestionIdsInput(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    // Clean pasted text: keep only digits, commas, and convert spaces/newlines to commas
    let cleaned = pastedText
      .replace(/[\s\n]+/g, ",")
      .replace(/[^0-9,]/g, "")
      .replace(/,+/g, ",")
      .replace(/^,|,$/g, "");
    
    const newValue = questionIdsInput 
      ? (questionIdsInput.endsWith(",") ? questionIdsInput + cleaned : questionIdsInput + "," + cleaned)
      : cleaned;
    setQuestionIdsInput(newValue.replace(/,+/g, ",").replace(/^,|,$/g, ""));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Instructions Collapsible */}
      <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Custom Mode Instructions</p>
                <p className="text-xs text-muted-foreground">
                  Learn how to use Question IDs and Test IDs for group study
                </p>
              </div>
            </div>
            {instructionsOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-3"
          >
            <p>
              <strong className="text-foreground">For Faculty/Group Review:</strong> This mode enables collaborative study 
              where a group leader specifies Question IDs that all members can use to create identical tests.
            </p>
            <p>
              <strong className="text-foreground">As a Group Member:</strong> Enter the comma-separated Question IDs 
              provided by your leader. Only unused questions will be included in your test.
            </p>
            <p>
              <strong className="text-foreground">Using a Test ID:</strong> If you received a Test ID instead of 
              Question IDs, enter it above and click "Retrieve Questions" to auto-populate the list.
            </p>
            <div className="rounded-lg bg-background/50 p-3 text-xs">
              <p className="font-medium text-foreground mb-1">Format Rules:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Enter only numbers and commas (,)</li>
                <li>No spaces or special characters</li>
                <li>Invalid or deactivated IDs will be ignored</li>
                <li>Linked question sets must include all required IDs</li>
              </ul>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* Method 1: Retrieve by Test ID */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Retrieve Questions of a Test #</h4>
            <p className="text-xs text-muted-foreground">
              Enter a shared Test ID to automatically load its Question IDs
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Input 
            placeholder="e.g. 781245" 
            value={testIdInput}
            onChange={(e) => setTestIdInput(e.target.value.replace(/\D/g, ""))}
            className="max-w-[200px] font-mono"
          />
          <Button 
            onClick={handleRetrieveByTestId}
            disabled={isRetrieving || !testIdInput.trim()}
            className="gap-2"
          >
            {isRetrieving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : retrieveSuccess ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isRetrieving ? "Retrieving..." : retrieveSuccess ? "Retrieved!" : "Retrieve Questions"}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-border"></div>
        <span className="mx-4 flex-shrink-0 rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
          OR
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Method 2: Enter Question IDs */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Copy className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Enter Question IDs separated by comma (,)</h4>
              <p className="text-xs text-muted-foreground">
                Paste or type your Question IDs below
              </p>
            </div>
          </div>
          {validationResult && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isValidating && <Loader2 className="h-3 w-3 animate-spin" />}
              Max: {maxQuestions}
            </span>
          )}
        </div>
        
        <Textarea 
          placeholder="104582,104583,104584" 
          value={questionIdsInput}
          onChange={handleInputChange}
          onPaste={handlePaste}
          className="min-h-[100px] font-mono text-sm resize-none"
        />
        
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Numbers and commas only
          </span>
          <span>•</span>
          <span>No spaces</span>
          <span>•</span>
          <span>Invalid IDs will be ignored</span>
        </div>
      </div>

      {/* Live Validation Panel */}
      <AnimatePresence>
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Validation Summary
                {isValidating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              </h4>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <ValidationStat
                label="Total Entered"
                value={validationResult.valid.length + validationResult.invalid.length}
                color="default"
              />
              <ValidationStat
                label="Valid"
                value={Math.min(validationResult.valid.length, maxQuestions)}
                color="success"
              />
              <ValidationStat
                label="Invalid"
                value={validationResult.invalid.length}
                color="error"
              />
              <ValidationStat
                label="Duplicates Removed"
                value={validationResult.duplicates}
                color="warning"
              />
            </div>

            {(validationResult.invalid.length > 0 || validationResult.duplicates > 0 || validationResult.valid.length > maxQuestions) && (
              <div className="space-y-2 border-t border-border pt-4">
                {validationResult.invalid.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-xs">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">
                        {validationResult.invalid.length} invalid ID{validationResult.invalid.length > 1 ? "s" : ""} found
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        These will be ignored: {validationResult.invalid.slice(0, 5).join(", ")}
                        {validationResult.invalid.length > 5 && "..."}
                      </p>
                    </div>
                  </div>
                )}
                {validationResult.valid.length > maxQuestions && (
                  <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs">
                    <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning">
                        Exceeds maximum ({maxQuestions} questions)
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        Only the first {maxQuestions} valid questions will be included.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ValidationStatProps {
  label: string;
  value: number;
  color: "default" | "success" | "error" | "warning";
}

function ValidationStat({ label, value, color }: ValidationStatProps) {
  const colorClasses = {
    default: "text-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    error: "text-destructive",
    warning: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
