export const PRODUCTS = Object.freeze({
  glide: Object.freeze({ key: 'glide', name: 'Pogon Glide', unitPriceRsd: 165_000 }),
  core: Object.freeze({ key: 'core', name: 'Pogon Core', unitPriceRsd: 130_000 }),
  cargo: Object.freeze({ key: 'cargo', name: 'Pogon Cargo', unitPriceRsd: 130_000 }),
});

export function calculateOrderTotal(productKey, quantity) {
  const product = PRODUCTS[productKey];
  if (!product) throw new Error('INVALID_PRODUCT');
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error('INVALID_QUANTITY');
  }
  return { product, quantity, unitPriceRsd: product.unitPriceRsd, totalRsd: product.unitPriceRsd * quantity };
}

export function calculateCartTotal(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > Object.keys(PRODUCTS).length) throw new Error('INVALID_ITEMS');
  const seen = new Set();
  const calculatedItems = items.map(({ product: key, quantity }) => {
    if (seen.has(key)) throw new Error('DUPLICATE_PRODUCT');
    seen.add(key);
    const line = calculateOrderTotal(key, quantity);
    return { product: line.product.key, name: line.product.name, quantity: line.quantity, unitPriceRsd: line.unitPriceRsd, lineTotalRsd: line.totalRsd };
  });
  return { items: calculatedItems, totalQuantity: calculatedItems.reduce((sum, item) => sum + item.quantity, 0), subtotalRsd: calculatedItems.reduce((sum, item) => sum + item.lineTotalRsd, 0) };
}
