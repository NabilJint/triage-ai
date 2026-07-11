import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterTab, SortOption } from "@/types";

const tabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "auto_reply", label: "Auto-replied" },
  { value: "escalate", label: "Escalated" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priority", label: "Priority" },
];

type DecisionFiltersProps = {
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function DecisionFilters({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: DecisionFiltersProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onFilterChange(tab.value)}
            onMouseEnter={() => setHoveredTab(tab.value)}
            onMouseLeave={() => setHoveredTab(null)}
            className="relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150"
          >
            {activeFilter === tab.value && (
              <motion.div
                layoutId="activeFilterTab"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className="absolute inset-0 bg-primary rounded-md"
              />
            )}
            {hoveredTab === tab.value && activeFilter !== tab.value && (
              <motion.div
                layoutId="hoverFilterTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                className="absolute inset-0 bg-surface-secondary rounded-md"
              />
            )}
            <span
              className={cn(
                "relative z-10",
                activeFilter === tab.value
                  ? "text-primary-foreground"
                  : "text-text-secondary",
              )}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 ml-auto w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
          <Input
            placeholder="Filter by subject, sender, or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(v) => onSortChange(v as SortOption)}
        >
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
