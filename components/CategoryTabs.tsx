"use client";

interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({
  categories,
  selected,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isActive = category === selected;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium tracking-wide whitespace-nowrap transition-colors ${
              isActive
                ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-ink)]"
                : "border-[var(--color-bronze)]/40 bg-transparent text-[var(--color-beige)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
