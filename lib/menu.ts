import fs from "fs";
import path from "path";
import type { MenuData } from "@/types/menu";

const MENU_JSON_PATH = path.join(process.cwd(), "data", "menu.json");

const FALLBACK_MENU: MenuData = {
  Drinks: [
    {
      name: "House Blend Coffee",
      description: "Freshly brewed, medium roast coffee.",
      price: "$4",
      order: 1,
    },
  ],
  Desserts: [
    {
      name: "Almond Cake",
      description: "Moist almond sponge cake with a light glaze.",
      price: "$6",
      order: 1,
    },
  ],
};

function sortProducts(menu: MenuData): MenuData {
  const sorted: MenuData = {};
  for (const category of Object.keys(menu)) {
    sorted[category] = [...menu[category]].sort((a, b) => {
      const orderA = a.order ?? Number.POSITIVE_INFINITY;
      const orderB = b.order ?? Number.POSITIVE_INFINITY;
      return orderA - orderB;
    });
  }
  return sorted;
}

export function getMenuData(): MenuData {
  try {
    const raw = fs.readFileSync(MENU_JSON_PATH, "utf-8");
    const parsed = JSON.parse(raw) as MenuData;
    return sortProducts(parsed);
  } catch {
    return sortProducts(FALLBACK_MENU);
  }
}

export function getCategories(menu: MenuData): string[] {
  return Object.keys(menu);
}
