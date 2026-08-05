"use client";

import { useMemo, useState } from "react";
import type { MenuData } from "@/types/menu";
import CategoryTabs from "./CategoryTabs";
import SearchBar from "./SearchBar";
import ProductGrid from "./ProductGrid";

interface MenuClientProps {
  menuData: MenuData;
  categories: string[];
}

export default function MenuClient({ menuData, categories }: MenuClientProps) {
  const [selected, setSelected] = useState(categories[0] ?? "");
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const products = menuData[selected] ?? [];
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(trimmed) ||
        product.description.toLowerCase().includes(trimmed)
    );
  }, [menuData, selected, query]);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-bronze)]/30 py-20 text-center">
        <p className="text-lg text-[var(--color-beige)]/70">
          Menu coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CategoryTabs
        categories={categories}
        selected={selected}
        onSelect={(category) => {
          setSelected(category);
          setQuery("");
        }}
      />
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--color-ivory)]">
        {selected}
      </h2>
      <SearchBar value={query} onChange={setQuery} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
