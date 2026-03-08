import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface UploadProgressBarProps {
  total: number;
  imported: number;
  errors: number;
  status: "idle" | "importing" | "done" | "error";
}

export function UploadProgressBar({ total, imported, errors, status }: UploadProgressBarProps) {
  if (status === "idle") return null;

  const progress = total > 0 ? Math.round(((imported + errors) / total) * 100) : 0;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {status === "importing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
          <span className="font-medium text-foreground">
            {status === "importing" && `Importing... ${imported + errors}/${total}`}
            {status === "done" && "Import complete"}
            {status === "error" && "Import failed"}
          </span>
        </div>
        <span className="text-muted-foreground text-xs">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="text-emerald-600 dark:text-emerald-400">{imported} imported</span>
        {errors > 0 && <span className="text-destructive">{errors} failed</span>}
        {status === "importing" && <span>{total - imported - errors} remaining</span>}
      </div>
    </div>
  );
}
