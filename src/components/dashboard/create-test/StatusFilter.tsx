import { motion } from "framer-motion";

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
            <motion.button
              key={filter.key}
              onClick={() => onToggleFilter(filter.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {filterCounts[filter.key] || 0}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
