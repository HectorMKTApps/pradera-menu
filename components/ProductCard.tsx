import Image from "next/image";
import type { Product } from "@/types/menu";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, description, price, image, featured } = product;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-bronze)]/30 bg-[var(--color-charcoal)]/40 transition-colors hover:border-[var(--color-gold)]/60">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-olive)]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="h-16 w-16 text-[var(--color-bronze)]/50"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {featured && (
          <span className="absolute top-3 left-3 rounded-full bg-[var(--color-gold)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink)]">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-[family-name:var(--font-playfair)] text-lg leading-tight text-[var(--color-ivory)]">
            {name}
          </h3>
          <span className="shrink-0 font-[family-name:var(--font-playfair)] text-lg text-[var(--color-gold)]">
            {price}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-beige)]/80">
          {description}
        </p>
      </div>
    </div>
  );
}
