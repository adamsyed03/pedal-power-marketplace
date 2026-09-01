import { normalizeGamePrize } from './game-prize.mjs';

const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;

export function validateCheckout(input) {
  const customer = input?.customer || {};
  const items = Array.isArray(input?.items)
    ? input.items.map((item) => ({ product: text(item?.product, 20), quantity: Number(item?.quantity) }))
    : [{ product: text(input?.product, 20), quantity: Number(input?.quantity) }];
  const installmentCount = Number(input?.installmentCount);
  const result = {
    items,
    firstName: text(customer.firstName, 80), lastName: text(customer.lastName, 80),
    email: text(customer.email, 254), phone: text(customer.phone, 40),
    street: text(customer.street, 160), city: text(customer.city, 100),
    postalCode: text(customer.postalCode, 20), deliveryMethod: text(input?.deliveryMethod, 20),
    installmentCount, captchaToken: text(input?.captchaToken, 2048),
    promoCode: input?.promoCode === undefined || input?.promoCode === null || input?.promoCode === ''
      ? null
      : text(input.promoCode, 40),
    gamePrize: normalizeGamePrize(input?.gamePrize),
    termsAccepted: input?.termsAccepted === true,
  };
  if (!result.captchaToken) throw new Error('INVALID_CAPTCHA');
  if (!items.length || items.length > 3 || items.some((item) => !item.product || !Number.isSafeInteger(item.quantity) || item.quantity < 1) ||
      new Set(items.map((item) => item.product)).size !== items.length || !result.firstName || !result.lastName ||
      !result.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email) || !result.phone ||
      !result.street || !result.city || !result.postalCode || !['courier', 'pickup'].includes(result.deliveryMethod) ||
      installmentCount !== 1 || (input?.promoCode && !result.promoCode) || !result.termsAccepted) throw new Error('INVALID_CHECKOUT');
  return result;
}
