import Image from "next/image";
import { getMenuData, getCategories } from "@/lib/menu";
import MenuClient from "@/components/MenuClient";

export default function Home() {
  const menuData = getMenuData();
  const categories = getCategories(menuData);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-semibold tracking-[0.3em] text-[var(--color-gold-text)] uppercase">
          Fine Dining
        </span>
        <Image
          src="/praderalogo.svg"
          alt="Pradera"
          width={550}
          height={120}
          priority
          className="h-14 w-auto sm:h-20"
        />
        <p className="text-sm tracking-widest text-[var(--color-beige)]/90 uppercase">
          Costa Mesa
        </p>
      </header>
      <MenuClient menuData={menuData} categories={categories} />
    </main>
  );
}
