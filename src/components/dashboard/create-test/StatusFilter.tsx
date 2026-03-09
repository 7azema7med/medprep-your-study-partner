interface StatusFilterProps {
  selectedFilters: string[];
  onToggleFilter: (key: string) => void;
  filterCounts: Record<string, number>;
}

const questionFilters = [
  { key: "all", label: "All" },
  { key: "unused", label: "Unused" },
  { key: "incorrect", label: "Incorrect" },
  { key: "marked", label: "Marked" },
  { key: "correct", label: "Correct" },
  { key: "omitted", label: "Omitted" },
];

export function StatusFilter({ selectedFilters, onToggleFilter, filterCounts }: StatusFilterProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Question Status</h3>
      <div className="flex flex-wrap gap-2">
        {questionFilters.map((filter) => {
          const isActive = selectedFilters.includes(filter.key);
          return (
            <button
              key={filter.key}
              onClick={() => onToggleFilter(filter.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label} ({filterCounts[filter.key] || 0})
            </button>
          );
        })}
      </div>
    </div>
  );
}
