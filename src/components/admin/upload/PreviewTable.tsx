import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ParsedQuestion } from "./QuestionParser";

interface PreviewTableProps {
  parsed: ParsedQuestion[];
  onToggle: (index: number) => void;
  onToggleAll: (selected: boolean) => void;
}

export function PreviewTable({ parsed, onToggle, onToggleAll }: PreviewTableProps) {
  const validItems = parsed.filter(q => !q._error);
  const allSelected = validItems.every(q => q._selected);
  const someSelected = validItems.some(q => q._selected);

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onToggleAll(!!checked)}
                  aria-label="Select all"
                  className={someSelected && !allSelected ? "opacity-50" : ""}
                />
              </TableHead>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-24">Choices</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-28">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsed.map((q, i) => (
              <TableRow key={i} className={q._error ? "bg-destructive/5" : q._selected ? "" : "opacity-50"}>
                <TableCell>
                  <Checkbox
                    checked={q._selected && !q._error}
                    disabled={!!q._error}
                    onCheckedChange={() => onToggle(i)}
                    aria-label={`Select question ${q._row}`}
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{q._row}</TableCell>
                <TableCell className="max-w-[350px]">
                  <p className="line-clamp-2 text-sm">{q.question_text || "—"}</p>
                </TableCell>
                <TableCell className="text-sm">
                  {q.choices.length} ({q.choices.filter(c => c.is_correct).length} ✓)
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{q.difficulty}</Badge>
                </TableCell>
                <TableCell>
                  {q._error ? (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <span className="text-xs text-destructive">{q._error}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Valid</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
