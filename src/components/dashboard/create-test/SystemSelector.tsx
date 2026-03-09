import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface System {
  id: string;
  name: string;
  question_count: number;
  category: string;
}

interface SystemSelectorProps {
  systems: System[];
  selectedSystems: string[];
  onToggleSystem: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  selectAll: boolean;
}

export function SystemSelector({
  systems,
  selectedSystems,
  onToggleSystem,
  onSelectAll,
  selectAll,
}: SystemSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const selectedCount = selectedSystems.length;
  const totalQuestions = systems
    .filter(s => selectedSystems.includes(s.id))
    .reduce((sum, s) => sum + s.question_count, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3 transition-colors hover:bg-muted">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/50 text-secondary-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-foreground">Systems</h3>
              <p className="text-xs text-muted-foreground">
                {selectedCount > 0 
                  ? `${selectedCount} selected · ${totalQuestions} questions`
                  : `${systems.length} available`}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </button>
      </CollapsibleTrigger>

      <AnimatePresence>
        {isOpen && (
          <CollapsibleContent forceMount asChild>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pt-2">
                {/* Select All */}
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5 transition-colors hover:bg-muted/30">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">Select All Systems</span>
                  <span className="text-xs text-muted-foreground">{systems.length}</span>
                </label>

                {/* System List */}
                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                  {systems.map((system) => {
                    const isSelected = selectedSystems.includes(system.id);
                    return (
                      <motion.label
                        key={system.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                          isSelected 
                            ? "bg-primary/5 border border-primary/20" 
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSystem(system.id)}
                        />
                        <span className={`flex-1 text-sm ${isSelected ? "font-medium text-foreground" : "text-foreground"}`}>
                          {system.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{system.question_count}</span>
                      </motion.label>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}
