import {
  buildAuthorizationXml, create3DFormFields, getNestPayConfig,
  isAccepted3DStatus, parseApiResponse, paymentStateFromApiResponse, verify3DResponseHash,
} from './nestpay.mjs';
import { findOrderById, patchOrder } from './supabase.mjs';
import { dispatchConfirmation } from './confirmation.mjs';

// Exact card-data field names plus expiry-bearing names; MaskedPan and similar
// gateway-provided non-sensitive fields must survive.
const SENSITIVE_FIELDS = /^(pan|cardnumber|card_number|cv2|cvv2?|cvc2?)$|expdate|expmonth|expyear|expiry/i;

// The 3D return may echo merchant-submitted fields. Card data must never be
// persisted or logged, so it is stripped before any further processing.
export function stripSensitiveFields(params) {
  const clean = {};
  for (const [key, value] of Object.entries(params || {})) {
    if (!SENSITIVE_FIELDS.test(key.replaceAll('-', ''))) clean[key] = value;
  }
  return clean;
}

export function callbackAmountMatchesOrder(params, order) {
  const returnedAmount = String(params?.amount ?? params?.Amount ?? '');
  return !returnedAmount || returnedAmount === String(order?.total_rsd ?? '');
}

export function hasComplete3DAuthFields(params) {
  return [params?.md, params?.eci, params?.xid, params?.cavv]
    .every((value) => String(value ?? '').length > 0);
}

// Builds the exact hidden-field set for the browser POST to est3dgate for one
// order, and moves the order to 3D_PENDING. The returned fields must be POSTed
// verbatim — the Hash v2 covers them and nothing may be regenerated afterwards.
export async function prepare3DPayment(order, lookupToken, env = process.env) {
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (!['PENDING', '3D_PENDING'].includes(order.payment_status)) throw new Error('ORDER_NOT_PAYABLE');
  if (!Number.isSafeInteger(order.total_rsd) || order.total_rsd <= 0) throw new Error('ORDER_TOTAL_NOT_FINAL');
  if (!env.APP_BASE_URL) throw new Error('APP_BASE_URL_MISSING');
  const returnUrl = `${String(env.APP_BASE_URL).replace(/\/$/, '')}/api/nestpay/callback?rt=${encodeURIComponent(lookupToken)}`;
  const prepared = create3DFormFields({
    orderId: order.order_id,
    amountRsd: order.total_rsd,
    installmentCount: order.installment_count,
    okUrl: returnUrl,
    failUrl: returnUrl,
  }, env);
  await patchOrder(order.order_id, { payment_status: '3D_PENDING' }, ['PENDING', '3D_PENDING'], env);
  return prepared;
}

const finalize = async (orderId, changes, env) => {
  const updated = await patchOrder(orderId, changes, ['AUTHORIZING'], env);
  if (updated && ['PAID', 'DECLINED'].includes(updated.payment_status)) {
    try { await dispatchConfirmation(updated, env); } catch { /* status stays authoritative; email is retryable */ }
  }
  return updated;
};

// Processes the NestPay 3D response POST: validates the response hash, claims
// the order, and for accepted mdStatus values sends the API Auth request with
// md/eci/xid/cavv (BIB guide §5.4). Only Approved + ProcReturnCode 00 marks
// the order PAID. Ambiguous API outcomes leave the order UNKNOWN for the
// Order Status reconciliation to settle — a Sale is never retried blindly.
export async function processNestPayReturn(rawParams, env = process.env, fetchImpl = fetch) {
  const params = stripSensitiveFields(rawParams);
  const config = getNestPayConfig(env);

  if (!verify3DResponseHash(params, env.NESTPAY_STORE_KEY)) {
    return { outcome: 'REJECTED', reason: 'INVALID_RESPONSE_HASH' };
  }
  if (String(params.clientid || params.ClientId || '') !== config.merchantId) {
    return { outcome: 'REJECTED', reason: 'CLIENTID_MISMATCH' };
  }
  const orderId = String(params.oid || params.ReturnOid || '');
  if (!orderId || (params.ReturnOid && params.oid && params.ReturnOid !== params.oid)) {
    return { outcome: 'REJECTED', reason: 'ORDER_ID_MISMATCH' };
  }
  const order = await findOrderById(orderId, env);
  if (!order) return { outcome: 'REJECTED', reason: 'ORDER_NOT_FOUND' };
  if (!callbackAmountMatchesOrder(params, order)) {
    return { outcome: 'REJECTED', reason: 'AMOUNT_MISMATCH' };
  }
  if (['PAID', 'DECLINED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(order.payment_status)) {
    return { outcome: 'ALREADY_FINAL', order };
  }

  // Single-writer claim: a concurrent duplicate callback loses this update and
  // must not trigger a second API Auth for the same order.
  const claimed = await patchOrder(orderId, {
    payment_status: 'AUTHORIZING',
    callback_received_at: new Date().toISOString(),
    md_status: String(params.mdStatus ?? ''),
  }, ['PENDING', '3D_PENDING'], env);
  if (!claimed) return { outcome: 'ALREADY_PROCESSING', order: await findOrderById(orderId, env) };

  if (!isAccepted3DStatus(params.mdStatus)) {
    const updated = await finalize(orderId, {
      payment_status: 'DECLINED', response: 'Declined',
      proc_return_code: null,
    }, env);
    return { outcome: 'DECLINED_3D', order: updated };
  }

  if (!hasComplete3DAuthFields(params)) {
    const updated = await finalize(orderId, { payment_status: 'UNKNOWN' }, env);
    return { outcome: 'UNKNOWN', order: updated, reason: 'MISSING_3D_AUTH_FIELDS' };
  }

  const xml = buildAuthorizationXml({
    username: env.NESTPAY_API_USERNAME, password: env.NESTPAY_API_PASSWORD,
    clientId: config.merchantId, ipAddress: params.ClientIp || '', email: order.email || '',
    orderId, total: String(order.total_rsd), installmentCount: order.installment_count,
    md: params.md, eci: params.eci, xid: params.xid, cavv: params.cavv,
  });

  let result;
  try {
    const response = await fetchImpl(config.apiUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ DATA: xml }),
    });
    if (!response.ok) throw new Error(`NESTPAY_API_HTTP_${response.status}`);
    result = parseApiResponse(await response.text());
  } catch {
    // The charge may or may not have happened. Stay UNKNOWN; reconciliation
    // resolves it via Order Status query. Never retry the Sale.
    const updated = await finalize(orderId, { payment_status: 'UNKNOWN' }, env);
    return { outcome: 'UNKNOWN', order: updated };
  }

  const shared = {
    authorization_code: result.authCode || null,
    nestpay_transaction_id: result.transactionId || null,
    host_reference: result.hostReference || null,
    proc_return_code: result.procReturnCode || null,
    response: result.response || null,
    transaction_date: result.transactionDate || null,
  };
  if (result.orderId && result.orderId !== orderId) {
    const updated = await finalize(orderId, { payment_status: 'UNKNOWN' }, env);
    return { outcome: 'UNKNOWN', order: updated, reason: 'API_ORDER_ID_MISMATCH' };
  }
  const nextState = paymentStateFromApiResponse(result);
  if (nextState === 'PAID') {
    const updated = await finalize(orderId, { payment_status: 'PAID', ...shared }, env);
    return { outcome: 'PAID', order: updated };
  }
  if (nextState === 'DECLINED') {
    const updated = await finalize(orderId, { payment_status: 'DECLINED', ...shared }, env);
    return { outcome: 'DECLINED', order: updated };
  }
  const updated = await finalize(orderId, { payment_status: 'UNKNOWN', ...shared }, env);
  return { outcome: 'UNKNOWN', order: updated };
}
