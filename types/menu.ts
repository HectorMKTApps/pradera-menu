export interface Product {
  name: string;
  description: string;
  price: string;
  image?: string;
  featured?: boolean;
  order?: number;
}

export type MenuData = Record<string, Product[]>;
