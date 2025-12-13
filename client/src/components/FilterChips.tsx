import { useState } from "react";

interface FilterChipsProps {
  filters: string[];
  onFilterChange?: (activeFilter: string) => void;
}

export default function FilterChips({ filters, onFilterChange }: FilterChipsProps) {
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const handleClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className="flex gap-2 flex-wrap" data-testid="container-filter-chips">
      {filters.map(filter => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => handleClick(filter)}
            className={`font-bold px-3 py-1 rounded-full text-xs transition ${
              isActive
                ? 'bg-accent-gold text-charcoal border border-accent-gold'
                : 'border border-accent-teal text-accent-teal hover:bg-accent-teal/20'
            }`}
            data-testid={`button-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
