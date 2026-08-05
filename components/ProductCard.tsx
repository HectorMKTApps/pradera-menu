import Image from "next/image";
import type { Product } from "@/types/menu";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, description, price, image, featured } = product;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-bronze)]/30 bg-[var(--color-charcoal)]/40 transition-colors hover:border-[var(--color-gold)]/60">
      {image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-olive)]">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {featured && (
            <span className="absolute top-3 left-3 rounded-full bg-[var(--color-gold)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink)]">
              Featured
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-[family-name:var(--font-playfair)] text-lg leading-tight text-[var(--color-ivory)]">
              {name}
            </h3>
            {!image && featured && (
              <span className="shrink-0 rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-xs font-semibold tracking-wide text-[var(--color-ink)]">
                Featured
              </span>
            )}
          </div>
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
