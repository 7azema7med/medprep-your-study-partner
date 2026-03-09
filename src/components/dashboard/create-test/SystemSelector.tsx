import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Minus, Heart, Brain, Stethoscope, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

const systemIcons: Record<string, React.ElementType> = {
  Cardiovascular: Heart,
  Neurology: Brain,
  Respiratory: Stethoscope,
};

// Mock topics for systems (in real app, these would come from DB)
const systemTopics: Record<string, string[]> = {
  Cardiovascular: ["Heart Failure", "Arrhythmias", "Hypertension", "Valvular Disease"],
  Neurology: ["Stroke", "Epilepsy", "Headache", "Dementia"],
  Respiratory: ["Asthma", "COPD", "Pneumonia", "Lung Cancer"],
};

export function SystemSelector({
  systems,
  selectedSystems,
  onToggleSystem,
  onSelectAll,
  selectAll,
}: SystemSelectorProps) {
  const [expandedSystems, setExpandedSystems] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string[]>>({});

  const toggleExpand = (systemName: string) => {
    setExpandedSystems((prev) =>
      prev.includes(systemName)
        ? prev.filter((s) => s !== systemName)
        : [...prev, systemName]
    );
  };

  const toggleTopic = (systemId: string, topic: string) => {
    setSelectedTopics((prev) => {
      const current = prev[systemId] || [];
      const updated = current.includes(topic)
        ? current.filter((t) => t !== topic)
        : [...current, topic];
      return { ...prev, [systemId]: updated };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Systems</h3>
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
      <div className="space-y-2 rounded-xl border border-border bg-card/50 p-2">
        {systems.map((system) => {
          const Icon = systemIcons[system.name] || Stethoscope;
          const isSelected = selectedSystems.includes(system.id);
          const isExpanded = expandedSystems.includes(system.name);
          const topics = systemTopics[system.name] || [];
          const sysSelectedTopics = selectedTopics[system.id] || [];

          return (
            <div key={system.id} className="overflow-hidden rounded-lg">
              <div
                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                  isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <button
                  onClick={() => topics.length > 0 && toggleExpand(system.name)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                    topics.length > 0
                      ? "bg-muted hover:bg-muted-foreground/20"
                      : "opacity-0"
                  }`}
                >
                  {isExpanded ? (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                
                <button
                  onClick={() => onToggleSystem(system.id)}
                  className="flex flex-1 items-center gap-3"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {system.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {system.question_count} questions
                    </p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {isExpanded && topics.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-10 space-y-1 border-l-2 border-border/50 py-2 pl-6">
                      {topics.map((topic) => {
                        const isTopicSelected = sysSelectedTopics.includes(topic);
                        return (
                          <label
                            key={topic}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={isTopicSelected}
                              onCheckedChange={() => toggleTopic(system.id, topic)}
                            />
                            <span
                              className={`text-sm ${
                                isTopicSelected ? "font-medium text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {topic}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
