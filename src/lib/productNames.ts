import type { Localized, SiteLanguage } from './productDetails';
import type { Product, ProductKey } from './products';

const accessoryNames: Partial<Record<ProductKey, Localized<string>>> = {
  chain: { sr: 'Lanac za zaključavanje', en: 'Bike lock chain', ru: 'Цепной замок' },
  'helmet-with-visor': { sr: 'Kaciga sa vizirom', en: 'Helmet with visor', ru: 'Шлем с визором' },
  helmet: { sr: 'Kaciga', en: 'Helmet', ru: 'Шлем' },
  'rearview-mirror': { sr: 'Retrovizor', en: 'Rear-view mirror', ru: 'Зеркало заднего вида' },
  gloves: { sr: 'Rukavice za upravljač', en: 'Handlebar gloves', ru: 'Перчатки на руль' },
  'phone-holder': { sr: 'Držač telefona', en: 'Phone holder', ru: 'Держатель телефона' },
};

export function productNameFor(product: Pick<Product, 'key' | 'name'>, language: SiteLanguage) {
  return accessoryNames[product.key]?.[language] ?? product.name;
}
