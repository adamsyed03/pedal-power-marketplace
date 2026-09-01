import { listPaidOrders, verifyAdminAccessToken } from '../_lib/admin-orders.mjs';
import { rateLimit, requestIp } from '../_lib/security.mjs';

const bearerToken = (request: any) => {
  const authorization = String(request.headers?.authorization || '');
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
};

export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.setHeader('Vary', 'Authorization');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!rateLimit(`admin-orders:${requestIp(request)}`, { limit: 60, windowMs: 10 * 60_000 }).allowed) {
    return response.status(429).json({ error: 'Previše zahteva.' });
  }

  try {
    const token = bearerToken(request);
    if (!await verifyAdminAccessToken(token)) return response.status(401).json({ error: 'Admin prijava je potrebna.' });
    const orders = await listPaidOrders();
    return response.status(200).json({ orders: orders.map((order: any) => ({
      orderId: order.order_id,
      createdAt: order.created_at,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      street: order.street,
      city: order.city,
      postalCode: order.postal_code,
      deliveryMethod: order.delivery_method,
      installmentCount: order.installment_count,
      status: order.payment_status,
      product: order.product,
      quantity: order.quantity,
      unitPriceRsd: order.unit_price_rsd,
      subtotalRsd: order.subtotal_rsd,
      deliveryFeeRsd: order.delivery_fee_rsd,
      totalRsd: order.total_rsd,
      items: Array.isArray(order.order_items) ? order.order_items : [],
      transactionId: order.nestpay_transaction_id || null,
      transactionDate: order.transaction_date || null,
    })) });
  } catch {
    return response.status(503).json({ error: 'Plaćene porudžbine trenutno nisu dostupne.' });
  }
}
