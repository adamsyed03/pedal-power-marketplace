import { rateLimit, requestIp } from '../_lib/security.mjs';
import {
  createCallbackDiagnostics, isStagingCallbackDiagnosticsEnabled, processNestPayReturn,
} from '../_lib/payment-flow.mjs';

const logCallbackDiagnostics = (diagnostics: any, rejectionReason: string | null = null) => {
  if (!isStagingCallbackDiagnosticsEnabled(process.env)) return;
  console.error(JSON.stringify({
    event: 'NESTPAY_CALLBACK_DIAGNOSTIC',
    route: '/api/nestpay/callback',
    ...diagnostics,
    CALLBACK_REJECT_REASON: rejectionReason,
  }));
};

const resultPath = (outcome: string, order: any, token: string) => {
  const status = order?.payment_status;
  const page = status === 'PAID' || status === 'UNKNOWN' ? '/payment/success' : '/payment/failed';
  const query = order && token
    ? `?orderId=${encodeURIComponent(order.order_id)}&token=${encodeURIComponent(token)}`
    : '';
  return `${page}${query}`;
};

// okUrl/failUrl target. NestPay posts the final hosted-payment result here
// through the customer's browser; Pogon verifies the response hash and then
// redirects the customer to its result page. No second API Auth is sent.
export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).send('Method not allowed');
  const diagnostics = createCallbackDiagnostics(request.body || {});
  if (!rateLimit(`callback:${requestIp(request)}`, { limit: 60, windowMs: 10 * 60_000 }).allowed) {
    logCallbackDiagnostics(diagnostics);
    return response.status(429).send('Too many requests');
  }
  const contentType = String(request.headers?.['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/x-www-form-urlencoded') {
    logCallbackDiagnostics(diagnostics);
    return response.status(415).send('Unsupported content type');
  }

  const token = String(request.query?.rt || '');
  try {
    const result = await processNestPayReturn(request.body || {}, process.env, fetch, diagnostics);
    if (result.outcome === 'REJECTED') {
      logCallbackDiagnostics(diagnostics, result.reason);
      return response.status(400).send('Payment response rejected');
    }
    logCallbackDiagnostics(diagnostics);
    response.setHeader('Location', resultPath(result.outcome, result.order, token));
    return response.status(303).send('');
  } catch {
    logCallbackDiagnostics(diagnostics);
    return response.status(503).send('Payment result processing failed');
  }
}
