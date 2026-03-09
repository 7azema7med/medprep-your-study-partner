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

export function SystemSelector({
  systems,
  selectedSystems,
  onToggleSystem,
  onSelectAll,
  selectAll,
}: SystemSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Systems</h3>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={selectAll}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          Select All
        </label>
      </div>
      <div className="space-y-1">
        {systems.map((system) => {
          const isSelected = selectedSystems.includes(system.id);
          return (
            <label
              key={system.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSystem(system.id)}
              />
              <span className="flex-1 text-sm text-foreground">{system.name}</span>
              <span className="text-xs text-muted-foreground">{system.question_count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
