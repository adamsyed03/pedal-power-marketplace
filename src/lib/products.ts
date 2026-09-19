export type ProductKey = 'glide' | 'core' | 'cargo' | 'chain' | 'helmet-with-visor' | 'helmet' | 'rearview-mirror' | 'gloves' | 'phone-holder';

export type Product = {
  key: ProductKey;
  name: string;
  description: string;
  priceRsd: number;
  listPriceRsd?: number;
  image: string;
  category: 'bike' | 'accessory';
  unitLabel?: string;
};

// This catalog is mirrored by api/_lib/catalog.mjs. The API copy is authoritative:
// checkout totals must never be calculated from browser-supplied prices.
export const products: readonly Product[] = [
  { key: 'cargo', name: 'Pogon Cargo', description: 'Električni teretni bicikl za praktičan prevoz stvari kroz grad.', priceRsd: 130_000, image: '/Core main.jpg', category: 'bike' },
  { key: 'core', name: 'Pogon Core', description: 'Svestrani električni bicikl za svakodnevne obaveze i duže gradske rute.', priceRsd: 130_000, listPriceRsd: 135_000, image: '/Cargo Main.jpg', category: 'bike' },
  { key: 'glide', name: 'Pogon Glide', description: 'Premium električni bicikl za udobnu svakodnevnu gradsku vožnju.', priceRsd: 165_000, image: '/Glide main.jpg', category: 'bike' },
  { key: 'chain', name: 'Lanac za zaključavanje', description: 'Lanac za sigurno zaključavanje bicikla tokom gradskih zaustavljanja.', priceRsd: 1_999, image: '/oprema/chain.optimized.jpg', category: 'accessory' },
  { key: 'helmet-with-visor', name: 'Kaciga sa vizirom', description: 'Kaciga sa integrisanim vizirom za svakodnevnu gradsku vožnju.', priceRsd: 3_999, image: '/oprema/helmetwithvizor.optimized.jpg', category: 'accessory' },
  { key: 'helmet', name: 'Kaciga', description: 'Lagana kaciga za svakodnevnu vožnju električnog bicikla.', priceRsd: 2_999, image: '/oprema/helmet.optimized.jpg', category: 'accessory' },
  { key: 'rearview-mirror', name: 'Retrovizor', description: 'Bolja preglednost saobraćaja iza vozača tokom gradske vožnje.', priceRsd: 1_300, image: '/oprema/rearviewmirror.optimized.jpg', category: 'accessory', unitLabel: 'po komadu' },
  { key: 'gloves', name: 'Rukavice za upravljač', description: 'Par zaštitnih rukavica za hladne, vetrovite i kišne dane.', priceRsd: 2_000, image: '/oprema/gloves.optimized.jpg', category: 'accessory', unitLabel: 'po paru' },
  { key: 'phone-holder', name: 'Držač telefona', description: 'Držač za preglednu i sigurniju upotrebu navigacije.', priceRsd: 2_000, image: '/oprema/phoneholder.optimized.jpg', category: 'accessory' },
];

export const formatRsd = (amount: number) =>
  `${new Intl.NumberFormat('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} RSD`;
