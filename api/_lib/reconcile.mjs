import {
  buildOrderStatusXml, getNestPayApiCredentials, getNestPayConfig, parseApiResponse,
} from './nestpay.mjs';
import { findOrderById, patchOrder } from './supabase.mjs';
import { dispatchConfirmation } from './confirmation.mjs';

export function mapOrderStatus(result) {
  const status = result.transactionStatus;
  const type = result.chargeType;
  if ((status === 'C' || status === 'S') && type === 'S' && result.statusProcReturnCode === '00') return 'PAID';
  if (status === 'D') return 'DECLINED';
  if (status === 'V' || status === 'CNCL') return 'CANCELLED';
  if ((status === 'C' || status === 'S') && type === 'C') return 'REFUNDED';
  if (['PN', 'NW', 'R'].includes(status)) return 'UNKNOWN';
  return 'UNKNOWN';
}

export async function reconcileOrder(orderId, env = process.env, fetchImpl = fetch) {
  const order = await findOrderById(orderId, env);
  if (!order || order.payment_status !== 'UNKNOWN') return order;
  const config = getNestPayConfig(env);
  if (config.mode !== 'test') throw new Error('TEST_MODE_REQUIRED');
  const apiCredentials = getNestPayApiCredentials(env);
  const xml = buildOrderStatusXml({
    username: apiCredentials.username, password: apiCredentials.password,
    clientId: env.NESTPAY_MERCHANT_ID, orderId,
  });
  let result;
  try {
    const response = await fetchImpl(config.apiUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ DATA: xml }),
    });
    if (!response.ok) throw new Error('NESTPAY_STATUS_HTTP_ERROR');
    result = parseApiResponse(await response.text());
  } catch (error) {
    await patchOrder(orderId, {
      last_reconciliation_at: new Date().toISOString(),
      reconciliation_attempts: Number(order.reconciliation_attempts || 0) + 1,
    }, ['UNKNOWN'], env);
    throw error;
  }
  if (result.orderId && result.orderId !== orderId) throw new Error('NESTPAY_ORDER_ID_MISMATCH');
  const next = mapOrderStatus(result);
  const updated = await patchOrder(orderId, {
    payment_status: next, last_reconciliation_at: new Date().toISOString(),
    reconciliation_attempts: Number(order.reconciliation_attempts || 0) + 1,
    nestpay_transaction_id: result.statusTransactionId || result.transactionId || null,
    authorization_code: result.statusAuthCode || result.authCode || null,
    host_reference: result.statusHostReference || result.hostReference || null,
    proc_return_code: result.statusProcReturnCode || result.procReturnCode || null,
    md_status: result.statusMdStatus || null, response: result.response || null,
    transaction_date: result.transactionDate || null,
  }, ['UNKNOWN'], env);
  if (updated && ['PAID', 'DECLINED'].includes(updated.payment_status)) {
    try { await dispatchConfirmation(updated, env); } catch { /* status remains authoritative; email can be retried */ }
  }
  return updated;
}
