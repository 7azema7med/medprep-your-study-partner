import { motion } from "framer-motion";
import { Stethoscope, Pill, Scissors, Baby, Brain, CheckCircle2 } from "lucide-react";

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

const subjectIcons: Record<string, React.ElementType> = {
  Pediatrics: Baby,
  Medicine: Pill,
  Surgery: Scissors,
  "Obstetrics & Gynecology": Stethoscope,
  Psychiatry: Brain,
};

export function SubjectSelector({
  subjects,
  selectedSubjects,
  onToggleSubject,
  onSelectAll,
  selectAll,
}: SubjectSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Subjects</h3>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Select All
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {subjects.map((subject) => {
          const Icon = subjectIcons[subject.name] || Stethoscope;
          const isSelected = selectedSubjects.includes(subject.id);
          return (
            <motion.button
              key={subject.id}
              onClick={() => onToggleSubject(subject.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </motion.div>
              )}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p
                  className={`text-xs font-medium leading-tight ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {subject.name}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {subject.question_count} questions
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
