import { hashLookupToken, rateLimit, requestIp } from '../_lib/security.mjs';
import { findOrderByLookup } from '../_lib/supabase.mjs';
import { prepare3DPayment } from '../_lib/payment-flow.mjs';

// Returns the server-authoritative hidden fields (including Hash v2) for the
// browser redirect to the NestPay TEST bank-hosted card page. Card data never
// touches Pogon; the StoreKey never leaves the server.
export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  if (!rateLimit(`prepare:${requestIp(request)}`, { limit: 20, windowMs: 10 * 60_000 }).allowed) {
    return response.status(429).json({ error: 'Previše pokušaja.' });
  }
  const orderId = String(request.body?.orderId || '');
  const token = String(request.body?.token || '');
  if (!/^PGN-\d{4}-[A-F0-9]{16}$/.test(orderId) || token.length < 30) {
    return response.status(404).json({ error: 'Porudžbina nije pronađena.' });
  }
  try {
    const order = await findOrderByLookup(orderId, hashLookupToken(token));
    if (!order) return response.status(404).json({ error: 'Porudžbina nije pronađena.' });
    const prepared = await prepare3DPayment(order, token);
    return response.status(200).json({
      mode: process.env.NESTPAY_ENV,
      orderId: order.order_id,
      totalRsd: order.total_rsd,
      installmentCount: order.installment_count,
      gateUrl: prepared.gateUrl,
      fields: prepared.fields,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'ORDER_NOT_PAYABLE') return response.status(409).json({ error: 'Porudžbina nije u stanju za plaćanje.' });
    return response.status(503).json({ error: 'Priprema plaćanja trenutno nije dostupna.' });
  }
}
