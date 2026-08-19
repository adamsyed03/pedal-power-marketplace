import { hashLookupToken, rateLimit, requestIp } from '../_lib/security.mjs';
import { findOrderByLookup } from '../_lib/supabase.mjs';

export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!rateLimit(`status:${requestIp(request)}`, { limit: 30, windowMs: 10 * 60_000 }).allowed) return response.status(429).json({ error: 'Previše pokušaja.' });
  const orderId = String(request.query?.orderId || '');
  const token = String(request.query?.token || '');
  if (!/^PGN-\d{4}-[A-F0-9]{16}$/.test(orderId) || token.length < 30) return response.status(404).json({ error: 'Porudžbina nije pronađena.' });
  try {
    const order = await findOrderByLookup(orderId, hashLookupToken(token));
    if (!order) return response.status(404).json({ error: 'Porudžbina nije pronađena.' });
    return response.status(200).json({
      orderId: order.order_id, status: order.payment_status, product: order.product, items: order.order_items,
      quantity: order.quantity, unitPriceRsd: order.unit_price_rsd,
      subtotalRsd: order.subtotal_rsd, totalRsd: order.total_rsd,
      installmentCount: order.installment_count,
      deliveryMethod: order.delivery_method, deliveryFeeRsd: order.delivery_fee_rsd,
      ...(order.payment_status === 'PAID' || order.payment_status === 'DECLINED' ? {
        authCode: order.authorization_code, transactionId: order.nestpay_transaction_id,
        response: order.response, procReturnCode: order.proc_return_code,
        mdStatus: order.md_status, transactionDate: order.transaction_date,
      } : {}),
    });
  } catch {
    return response.status(503).json({ error: 'Status trenutno nije dostupan.' });
  }
}
