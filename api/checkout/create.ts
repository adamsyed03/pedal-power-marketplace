import { verifyCaptcha } from '../_lib/captcha.mjs';
import { calculateCartTotal } from '../_lib/catalog.mjs';
import { applyPromotion, isSingleUsePromotion, singleUsePromotionOrderId } from '../_lib/promotions.mjs';
import { createOrderId } from '../_lib/order.mjs';
import { createLookupToken, hashLookupToken, rateLimit, requestIp } from '../_lib/security.mjs';
import { findOrderByIdempotency, insertOrder, patchOrder } from '../_lib/supabase.mjs';
import { validateCheckout } from '../_lib/validation.mjs';
import { offeredInstallments, resolveDeliveryFee } from '../_lib/delivery.mjs';
import { applyGamePrizeToDelivery, attachGamePrize } from '../_lib/game-prize.mjs';
import { isNestPayConfigured } from '../_lib/nestpay.mjs';

const cardPageUrl = (orderId: string, token: string) =>
  `/payment/card?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`;

export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

  const ip = requestIp(request);
  const limited = rateLimit(`create:${ip}`, { limit: 8, windowMs: 10 * 60_000 });
  if (!limited.allowed) {
    response.setHeader('Retry-After', String(limited.retryAfter));
    return response.status(429).json({ error: 'Previše pokušaja. Pokušajte kasnije.' });
  }

  const idempotencyKey = String(request.headers?.['idempotency-key'] || '');
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) return response.status(400).json({ error: 'Nedostaje bezbedan ključ zahteva.' });

  let requestedPromoCode: string | null = null;
  try {
    // Validate the request before touching infrastructure so a missing CAPTCHA
    // is always reported as a client error rather than an unrelated database
    // availability failure. Existing idempotent orders are still looked up
    // before Siteverify so a one-time token is never consumed twice on retry.
    const input = validateCheckout(request.body);
    if (!offeredInstallments().includes(input.installmentCount)) return response.status(400).json({ error: 'Izabrani broj rata nije dostupan.' });
    const paymentConfigured = isNestPayConfigured();
    const existing = await findOrderByIdempotency(idempotencyKey);
    if (existing) {
      // The lookup token is stored only as a hash, so a retried create issues a
      // fresh token for the same order. Knowledge of the idempotency key proves
      // the caller created this order.
      if (!['PENDING', '3D_PENDING'].includes(existing.payment_status)) {
        return response.status(200).json({ orderId: existing.order_id, paymentReady: false, message: 'Porudžbina je već obrađena.' });
      }
      if (!paymentConfigured) {
        return response.status(200).json({
          orderId: existing.order_id,
          paymentReady: false,
          message: 'Plaćanje karticom trenutno nije dostupno.',
        });
      }
      const reissued = createLookupToken();
      await patchOrder(existing.order_id, { lookup_token_hash: hashLookupToken(reissued) }, ['PENDING', '3D_PENDING']);
      return response.status(200).json({
        orderId: existing.order_id, statusToken: reissued, paymentReady: true,
        redirectUrl: cardPageUrl(existing.order_id, reissued),
      });
    }

    if (!await verifyCaptcha(input.captchaToken, ip)) return response.status(400).json({ error: 'Bezbednosna provera nije uspela.' });
    const cart = applyPromotion(calculateCartTotal(input.items), input.promoCode);
    requestedPromoCode = cart.promoCode;
    const delivery = applyGamePrizeToDelivery(input.gamePrize, input.deliveryMethod, resolveDeliveryFee(input.deliveryMethod));
    const orderItems = attachGamePrize(cart.items, input.gamePrize);
    const lookupToken = createLookupToken();
    const order = await insertOrder({
      order_id: cart.promoCode && isSingleUsePromotion(cart.promoCode)
        ? singleUsePromotionOrderId(cart.promoCode)
        : createOrderId(),
      product: cart.items[0].product, quantity: cart.totalQuantity,
      unit_price_rsd: cart.items[0].unitPriceRsd, order_items: orderItems, subtotal_rsd: cart.subtotalRsd,
      delivery_fee_rsd: delivery.feeRsd,
      total_rsd: delivery.exact ? cart.subtotalRsd + delivery.feeRsd : null,
      customer_name: `${input.firstName} ${input.lastName}`, email: input.email,
      phone: input.phone, street: input.street, city: input.city, postal_code: input.postalCode,
      delivery_method: input.deliveryMethod, installment_count: input.installmentCount,
      payment_status: 'PENDING', idempotency_key: idempotencyKey,
      lookup_token_hash: hashLookupToken(lookupToken),
      terms_accepted_at: new Date().toISOString(), terms_version: '2026-07-30',
    });
    if (!delivery.exact || order.total_rsd == null) {
      return response.status(201).json({
        orderId: order.order_id, statusToken: lookupToken, paymentReady: false,
        message: 'Porudžbina je sačuvana. Trošak dostave mora biti potvrđen pre plaćanja.',
      });
    }
    if (!paymentConfigured) {
      return response.status(201).json({
        orderId: order.order_id,
        statusToken: lookupToken,
        paymentReady: false,
        message: 'Porudžbina je sačuvana. Plaćanje karticom trenutno nije dostupno.',
      });
    }
    return response.status(201).json({
      orderId: order.order_id, statusToken: lookupToken, paymentReady: true,
      redirectUrl: cardPageUrl(order.order_id, lookupToken),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INVALID_CAPTCHA') return response.status(400).json({ error: 'Bezbednosna provera je obavezna.' });
    if (code === 'INVALID_PROMO_CODE') return response.status(400).json({ error: 'Kod za popust nije važeći.' });
    if (code === 'PROMO_NOT_APPLICABLE') return response.status(400).json({ error: 'Kod MILEBANJA važi samo za Pogon Cargo.' });
    if (code === 'ORDER_DATABASE_ERROR_409' && requestedPromoCode === 'MILEBANJA') {
      return response.status(409).json({ error: 'Kod MILEBANJA je već iskorišćen.' });
    }
    if (code === 'INVALID_CHECKOUT' || code.startsWith('INVALID_')) return response.status(400).json({ error: 'Proverite podatke porudžbine.' });
    if (code === 'CAPTCHA_NOT_CONFIGURED' || code === 'CAPTCHA_SERVICE_UNAVAILABLE') {
      return response.status(503).json({ error: 'Bezbednosna provera trenutno nije dostupna.' });
    }
    return response.status(503).json({ error: 'Porudžbinu trenutno nije moguće sačuvati.' });
  }
}
