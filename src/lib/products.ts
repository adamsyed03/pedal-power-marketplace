export type ProductKey = 'glide' | 'core' | 'cargo';

export type Product = {
  key: ProductKey;
  name: string;
  description: string;
  priceRsd: number;
  listPriceRsd?: number;
  image: string;
};

// This catalog is mirrored by api/_lib/catalog.mjs. The API copy is authoritative:
// checkout totals must never be calculated from browser-supplied prices.
export const products: readonly Product[] = [
  { key: 'cargo', name: 'Pogon Cargo', description: 'Električni teretni bicikl za praktičan prevoz stvari kroz grad.', priceRsd: 130_000, image: '/Core main.jpg' },
  { key: 'core', name: 'Pogon Core', description: 'Svestrani električni bicikl za svakodnevne obaveze i duže gradske rute.', priceRsd: 130_000, listPriceRsd: 135_000, image: '/Cargo Main.jpg' },
  { key: 'glide', name: 'Pogon Glide', description: 'Premium električni bicikl za udobnu svakodnevnu gradsku vožnju.', priceRsd: 165_000, image: '/Glide main.jpg' },
];

export const formatRsd = (amount: number) =>
  `${new Intl.NumberFormat('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} RSD`;
