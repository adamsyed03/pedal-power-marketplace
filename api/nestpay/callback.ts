import { rateLimit, requestIp } from '../_lib/security.mjs';
import { processNestPayReturn } from '../_lib/payment-flow.mjs';

const resultPath = (outcome: string, order: any, token: string) => {
  const status = order?.payment_status;
  const page = status === 'PAID' || status === 'UNKNOWN' ? '/payment/success' : '/payment/failed';
  const query = order && token
    ? `?orderId=${encodeURIComponent(order.order_id)}&token=${encodeURIComponent(token)}`
    : '';
  return `${page}${query}`;
};

// okUrl/failUrl target. NestPay posts the 3D result here through the
// customer's browser; the response hash is verified, the API Auth is sent
// server-side, and the customer is redirected to the result page.
export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).send('Method not allowed');
  if (!rateLimit(`callback:${requestIp(request)}`, { limit: 60, windowMs: 10 * 60_000 }).allowed) {
    return response.status(429).send('Too many requests');
  }
  const contentType = String(request.headers?.['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/x-www-form-urlencoded') return response.status(415).send('Unsupported content type');

  const token = String(request.query?.rt || '');
  try {
    const result = await processNestPayReturn(request.body || {});
    if (result.outcome === 'REJECTED') return response.status(400).send('Payment response rejected');
    response.setHeader('Location', resultPath(result.outcome, result.order, token));
    return response.status(303).send('');
  } catch {
    return response.status(503).send('Payment result processing failed');
  }
}
