import { createHash } from 'node:crypto';

const PROMOTIONS = Object.freeze({
  MILEBANJA: Object.freeze({
    code: 'MILEBANJA',
    kind: 'fixed_unit_price',
    product: 'cargo',
    unitPriceRsd: 120_000,
    issuedYear: 2026,
    maxUses: 1,
  }),
  NBGD: Object.freeze({
    code: 'NBGD',
    kind: 'fixed_order_discount',
    discountRsd: 5_000,
  }),
  INSTAGRAM: Object.freeze({
    code: 'INSTAGRAM',
    kind: 'fixed_order_discount',
    discountRsd: 5_000,
  }),
});

export function normalizePromoCode(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error('INVALID_PROMO_CODE');
  const code = value.trim().toUpperCase();
  if (!code) return null;
  if (code.length > 40 || !/^[A-Z0-9_-]+$/.test(code)) throw new Error('INVALID_PROMO_CODE');
  return code;
}

export function applyPromotion(cart, value) {
  const promoCode = normalizePromoCode(value);
  if (!promoCode) {
    return { ...cart, originalSubtotalRsd: cart.subtotalRsd, discountRsd: 0, promoCode: null };
  }

  const promotion = Object.hasOwn(PROMOTIONS, promoCode) ? PROMOTIONS[promoCode] : null;
  if (!promotion) throw new Error('INVALID_PROMO_CODE');

  if (promotion.kind === 'fixed_order_discount') {
    const discountRsd = Math.min(promotion.discountRsd, cart.subtotalRsd);
    const items = cart.items.map((item, index) => index === 0 ? {
      ...item,
      lineTotalRsd: item.lineTotalRsd - discountRsd,
      discountRsd,
      promoCode,
    } : item);
    return {
      ...cart,
      items,
      originalSubtotalRsd: cart.subtotalRsd,
      subtotalRsd: cart.subtotalRsd - discountRsd,
      discountRsd,
      promoCode,
    };
  }

  if (promotion.kind === 'fixed_unit_price') {
    if (!cart.items.some((item) => item.product === promotion.product)) {
      throw new Error('PROMO_NOT_APPLICABLE');
    }
    const items = cart.items.map((item) => {
      if (item.product !== promotion.product) return item;
      const discountedUnitPriceRsd = Math.min(item.unitPriceRsd, promotion.unitPriceRsd);
      const discountRsd = (item.unitPriceRsd - discountedUnitPriceRsd) * item.quantity;
      return {
        ...item,
        originalUnitPriceRsd: item.unitPriceRsd,
        unitPriceRsd: discountedUnitPriceRsd,
        lineTotalRsd: discountedUnitPriceRsd * item.quantity,
        discountRsd,
        promoCode,
      };
    });
    const subtotalRsd = items.reduce((sum, item) => sum + item.lineTotalRsd, 0);

    return {
      ...cart,
      items,
      originalSubtotalRsd: cart.subtotalRsd,
      subtotalRsd,
      discountRsd: cart.subtotalRsd - subtotalRsd,
      promoCode,
    };
  }

  throw new Error('INVALID_PROMO_CODE');
}

export function isSingleUsePromotion(value) {
  const promoCode = normalizePromoCode(value);
  if (!promoCode) return false;
  const promotion = Object.hasOwn(PROMOTIONS, promoCode) ? PROMOTIONS[promoCode] : null;
  if (!promotion) throw new Error('INVALID_PROMO_CODE');
  return promotion.maxUses === 1;
}

export function singleUsePromotionOrderId(value, env = process.env) {
  const promoCode = normalizePromoCode(value);
  const promotion = promoCode && Object.hasOwn(PROMOTIONS, promoCode) ? PROMOTIONS[promoCode] : null;
  if (!promotion || !isSingleUsePromotion(promoCode)) throw new Error('INVALID_PROMO_CODE');
  const scope = env.NESTPAY_ENV === 'production' ? 'production' : 'test';
  const suffix = createHash('sha256')
    .update(`pogon-promo:${scope}:${promoCode}`, 'utf8')
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();
  // orders.order_id is already unique. Giving a one-use promotion a stable,
  // server-only order ID makes the database the atomic redemption lock.
  return `PGN-${promotion.issuedYear}-${suffix}`;
}
