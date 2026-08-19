import { rateLimit, requestIp, safeEqual } from '../_lib/security.mjs';
import { reconcileOrder } from '../_lib/reconcile.mjs';

// Operator-triggered reconciliation for orders stuck in UNKNOWN. Uses the
// documented Order Status query; it never re-sends a Sale.
export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  if (process.env.NESTPAY_ENV !== 'test') return response.status(503).json({ error: 'TEST mode required.' });
  if (!rateLimit(`reconcile:${requestIp(request)}`, { limit: 20, windowMs: 10 * 60_000 }).allowed) return response.status(429).json({ error: 'Too many requests.' });
  const bearer = String(request.headers?.authorization || '').replace(/^Bearer\s+/i, '');
  if (!process.env.RECONCILIATION_SECRET || !safeEqual(bearer, process.env.RECONCILIATION_SECRET)) return response.status(401).json({ error: 'Unauthorized.' });
  const orderId = String(request.body?.orderId || '');
  if (!/^PGN-\d{4}-[A-F0-9]{16}$/.test(orderId)) return response.status(400).json({ error: 'Invalid orderId.' });
  try {
    const order = await reconcileOrder(orderId);
    if (!order) return response.status(404).json({ error: 'Order not found.' });
    return response.status(200).json({ orderId: order.order_id, status: order.payment_status });
  } catch {
    return response.status(503).json({ error: 'Reconciliation failed; order remains UNKNOWN.' });
  }
}
