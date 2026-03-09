import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface CustomModePanelProps {
  maxQuestions: number;
  onValidQuestionsChange: (questionIds: string[]) => void;
}

export function CustomModePanel({ maxQuestions, onValidQuestionsChange }: CustomModePanelProps) {
  const [testIdInput, setTestIdInput] = useState("");
  const [questionIdsInput, setQuestionIdsInput] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);

  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);

  const processIds = useCallback((input: string) => {
    if (!input.trim()) {
      setValidCount(0);
      setInvalidCount(0);
      onValidQuestionsChange([]);
      return;
    }
    const rawIds = input.replace(/\s/g, "").split(",").filter(Boolean);
    const unique = Array.from(new Set(rawIds));
    const valid = unique.filter((id) => /^\d+$/.test(id));
    const invalid = unique.filter((id) => !/^\d+$/.test(id));
    setValidCount(valid.length);
    setInvalidCount(invalid.length);
    onValidQuestionsChange(valid.slice(0, maxQuestions));
  }, [maxQuestions, onValidQuestionsChange]);

  useEffect(() => {
    const t = setTimeout(() => processIds(questionIdsInput), 300);
    return () => clearTimeout(t);
  }, [questionIdsInput, processIds]);

  const handleRetrieve = async () => {
    if (!testIdInput.trim()) return;
    setIsRetrieving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setQuestionIdsInput("104582,104583,104584,104585");
    setIsRetrieving(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestionIdsInput(e.target.value.replace(/[^0-9,]/g, "").replace(/,+/g, ","));
  };

  return (
    <div className="space-y-5">
      {/* Retrieve by Test ID */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Retrieve by Test ID</h4>
        <p className="text-xs text-muted-foreground">Enter a shared Test ID to load its questions.</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 781245"
            value={testIdInput}
            onChange={(e) => setTestIdInput(e.target.value.replace(/\D/g, ""))}
            className="max-w-[180px] font-mono text-sm"
          />
          <Button
            onClick={handleRetrieve}
            disabled={isRetrieving || !testIdInput.trim()}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            {isRetrieving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            Retrieve
          </Button>
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground">or</span>
        <div className="flex-grow border-t border-border" />
      </div>

      {/* Enter Question IDs */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Enter Question IDs</h4>
        <p className="text-xs text-muted-foreground">Separate with commas. Numbers only. Invalid IDs are ignored.</p>
        <Textarea
          placeholder="104582,104583,104584"
          value={questionIdsInput}
          onChange={handleInputChange}
          className="min-h-[80px] font-mono text-sm resize-none"
        />
      </div>

      {/* Summary */}
      {(validCount > 0 || invalidCount > 0) && (
        <div className="flex gap-4 text-xs">
          <span className="text-emerald-600 dark:text-emerald-400">{validCount} valid</span>
          {invalidCount > 0 && (
            <span className="text-destructive">{invalidCount} invalid</span>
          )}
        </div>
      )}
    </div>
  );
}
