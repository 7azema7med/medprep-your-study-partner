import { Checkbox } from "@/components/ui/checkbox";

interface Subject {
  id: string;
  name: string;
  question_count: number;
  category: string;
}

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubjects: string[];
  onToggleSubject: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  selectAll: boolean;
}

export function SubjectSelector({
  subjects,
  selectedSubjects,
  onToggleSubject,
  onSelectAll,
  selectAll,
}: SubjectSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Subjects</h3>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={selectAll}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          Select All
        </label>
      </div>
      <div className="space-y-1">
        {subjects.map((subject) => {
          const isSelected = selectedSubjects.includes(subject.id);
          return (
            <label
              key={subject.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSubject(subject.id)}
              />
              <span className="flex-1 text-sm text-foreground">{subject.name}</span>
              <span className="text-xs text-muted-foreground">{subject.question_count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
