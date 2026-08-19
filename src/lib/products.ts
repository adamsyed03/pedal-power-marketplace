export type ProductKey = 'glide' | 'core' | 'cargo';

export type Product = {
  key: ProductKey;
  name: string;
  priceRsd: number;
  image: string;
};

// This catalog is mirrored by api/_lib/catalog.mjs. The API copy is authoritative:
// checkout totals must never be calculated from browser-supplied prices.
export const products: readonly Product[] = [
  { key: 'glide', name: 'Pogon Glide', priceRsd: 165_000, image: '/Glide main.jpg' },
  { key: 'core', name: 'Pogon Core', priceRsd: 135_000, image: '/Cargo Main.jpg' },
  { key: 'cargo', name: 'Pogon Cargo', priceRsd: 130_000, image: '/Core main.jpg' },
];

export const formatRsd = (amount: number) =>
  `${new Intl.NumberFormat('sr-RS').format(amount)} RSD`;
