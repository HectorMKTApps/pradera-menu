"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search this category..."
        aria-label="Search menu items"
        className="w-full rounded-lg border border-[var(--color-bronze)]/40 bg-[var(--color-charcoal)]/50 px-4 py-2 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-beige)]/50 outline-none transition-colors focus:border-[var(--color-gold)]"
      />
    </div>
  );
}
