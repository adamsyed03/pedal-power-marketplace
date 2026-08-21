import {
  create3DFormFields, getNestPayConfig,
  inspect3DResponseHash, isAccepted3DStatus, normalizeNestPayFormParams,
} from './nestpay.mjs';
import { findOrderById, patchOrder } from './supabase.mjs';
import { dispatchConfirmation } from './confirmation.mjs';

// Exact card-data field names plus expiry-bearing names; MaskedPan and similar
// gateway-provided non-sensitive fields must survive.
const SENSITIVE_FIELDS = /^(pan|cardnumber|card_number|cv2|cvv2?|cvc2?)$|expdate|expmonth|expyear|expiry/i;

const CALLBACK_PRESENCE_FIELDS = [
  'clientid', 'clientId', 'ClientId', 'oid', 'ReturnOid', 'Response',
  'ProcReturnCode', 'AuthCode', 'TransId', 'mdStatus', 'md', 'eci', 'xid',
  'cavv', 'rnd', 'hashAlgorithm', 'HASHPARAMS', 'HASHPARAMSVAL', 'HASH', 'EXTRA.TRXDATE',
];

const present = (params, field) => Object.prototype.hasOwnProperty.call(params || {}, field);
const presentCaseInsensitive = (params, field) => Object.keys(params || {})
  .some((candidate) => candidate.toLowerCase() === String(field).toLowerCase());
const safeHashFieldName = (field) => /^[A-Za-z0-9_.-]{1,64}$/.test(String(field))
  ? String(field) : '[INVALID_FIELD_NAME]';

const safeCallbackOrderId = (params) => {
  const normalized = normalizeNestPayFormParams(params);
  if (!normalized.valid) return null;
  const oid = String(normalized.params.oid ?? '');
  const returnOid = String(normalized.params.ReturnOid ?? '');
  const candidate = oid || returnOid;
  if (!/^PGN-\d{4}-[A-F0-9]{16}$/.test(candidate)) return null;
  if (oid && returnOid && oid !== returnOid) return null;
  return candidate;
};

// Staging diagnostics contain only an allowlisted order ID, field-presence
// booleans and validation outcomes. Callback field values never enter this
// object, so it is safe to serialize without exposing payment data or hashes.
export function createCallbackDiagnostics(rawParams) {
  const params = rawParams && typeof rawParams === 'object' ? rawParams : {};
  return {
    order_id: safeCallbackOrderId(params),
    FIELD_PRESENCE: Object.fromEntries(
      CALLBACK_PRESENCE_FIELDS.map((field) => [field, present(params, field)]),
    ),
    HASH_CHECK_ATTEMPTED: false,
    DUPLICATE_FORM_FIELDS: [],
    AMBIGUOUS_FORM_FIELDS: [],
    HASH_ALGORITHM_BRANCH: 'NOT_CHECKED',
    HASHPARAMS_FIELDS: [],
    HASHPARAMS_FIELD_PRESENCE: [],
    HASHED_FIELDS_MISSING: [],
    HASHED_FIELDS_REMOVED_BY_SANITIZER: [],
    HASHPARAMS_FORMAT_VALID: null,
    REQUIRED_HASH_FIELDS_SIGNED: null,
    HASHPARAMSVAL_MATCH: null,
    HASHPARAMSVAL_FORMAT: null,
    RECEIVED_HASH_LENGTH: null,
    CALCULATED_HASH_LENGTH: null,
    RECEIVED_HASH_HAS_PLUS: null,
    RECEIVED_HASH_HAS_SPACE: null,
    HASH_TRANSPORT_NORMALIZATION: null,
    HASH_VALIDATION_STAGE: 'NOT_CHECKED',
    HASH_VALID: null,
    STOREKEY_STATUS: 'NOT_CHECKED',
    STOREKEY_LENGTH: null,
    STOREKEY_HAS_HASH_CHARACTER: null,
    STOREKEY_HAS_LEADING_WHITESPACE: null,
    STOREKEY_HAS_TRAILING_WHITESPACE: null,
    STOREKEY_HAS_NEWLINE: null,
    STOREKEY_HAS_LITERAL_QUOTES: null,
    CLIENT_ID_MATCH: null,
    ORDER_ID_MATCH: null,
    ORDER_FOUND: null,
    AMOUNT_MATCH: null,
  };
}

export function isStagingCallbackDiagnosticsEnabled(env = process.env) {
  try {
    const baseUrl = new URL(String(env.APP_BASE_URL || ''));
    return baseUrl.protocol === 'https:' && baseUrl.hostname === 'test.ridepogon.com';
  } catch {
    return false;
  }
}

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

export function hostedPaymentState(params) {
  if (isAccepted3DStatus(params?.mdStatus)
    && params?.Response === 'Approved' && params?.ProcReturnCode === '00') return 'PAID';
  if (!isAccepted3DStatus(params?.mdStatus)
    || params?.Response === 'Declined' || params?.Response === 'Error') return 'DECLINED';
  return 'UNKNOWN';
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

// Processes the final 3D Pay Hosting response. NestPay hosts card entry and
// performs the payment automatically, so this signed callback already carries
// the final transaction result. Pogon must never send a second API Auth.
export async function processNestPayReturn(
  rawParams, env = process.env, _fetchImpl = fetch, diagnostics = createCallbackDiagnostics(rawParams),
) {
  const normalized = normalizeNestPayFormParams(rawParams);
  diagnostics.DUPLICATE_FORM_FIELDS = normalized.duplicateFields.map(safeHashFieldName);
  diagnostics.AMBIGUOUS_FORM_FIELDS = normalized.ambiguousFields.map(safeHashFieldName);
  if (!normalized.valid) {
    return { outcome: 'REJECTED', reason: 'AMBIGUOUS_FORM_FIELD' };
  }
  // Verify against the normalized raw POST map. Signed card-bearing fields, if
  // NestPay ever includes them, may participate in verification but are
  // stripped immediately afterward and are never logged or persisted.
  const rawNormalizedParams = normalized.params;
  const params = stripSensitiveFields(rawNormalizedParams);
  const storeKey = env.NESTPAY_STORE_KEY;
  diagnostics.STOREKEY_STATUS = typeof storeKey !== 'string'
    ? 'MISSING' : storeKey.length > 0 ? 'SET' : 'INVALID';
  diagnostics.STOREKEY_LENGTH = typeof storeKey === 'string' ? storeKey.length : null;
  diagnostics.STOREKEY_HAS_HASH_CHARACTER = typeof storeKey === 'string' ? storeKey.includes('#') : null;
  diagnostics.STOREKEY_HAS_LEADING_WHITESPACE = typeof storeKey === 'string' ? /^\s/.test(storeKey) : null;
  diagnostics.STOREKEY_HAS_TRAILING_WHITESPACE = typeof storeKey === 'string' ? /\s$/.test(storeKey) : null;
  diagnostics.STOREKEY_HAS_NEWLINE = typeof storeKey === 'string' ? /[\r\n]/.test(storeKey) : null;
  diagnostics.STOREKEY_HAS_LITERAL_QUOTES = typeof storeKey === 'string'
    ? (/^"[\s\S]*"$/.test(storeKey) || /^'[\s\S]*'$/.test(storeKey)) : null;
  const config = getNestPayConfig(env);

  diagnostics.HASH_CHECK_ATTEMPTED = true;
  const hashInspection = inspect3DResponseHash(rawNormalizedParams, env.NESTPAY_STORE_KEY);
  const hashFields = hashInspection.hashParamsFields;
  diagnostics.HASH_ALGORITHM_BRANCH = hashInspection.hashAlgorithmBranch;
  diagnostics.HASHPARAMS_FIELDS = hashFields.map(safeHashFieldName);
  diagnostics.HASHPARAMS_FIELD_PRESENCE = hashFields.map((field) => ({
    field: safeHashFieldName(field), present: presentCaseInsensitive(rawParams, field),
  }));
  diagnostics.HASHED_FIELDS_MISSING = hashFields
    .filter((field) => !presentCaseInsensitive(rawParams, field)).map(safeHashFieldName);
  diagnostics.HASHED_FIELDS_REMOVED_BY_SANITIZER = hashFields
    .filter((field) => presentCaseInsensitive(rawNormalizedParams, field) && !presentCaseInsensitive(params, field))
    .map(safeHashFieldName);
  diagnostics.HASHPARAMS_FORMAT_VALID = hashInspection.hashParamsFormatValid;
  diagnostics.REQUIRED_HASH_FIELDS_SIGNED = hashInspection.requiredHashFieldsSigned;
  diagnostics.HASHPARAMSVAL_MATCH = hashInspection.hashParamsValMatch;
  diagnostics.HASHPARAMSVAL_FORMAT = hashInspection.hashParamsValFormat;
  diagnostics.RECEIVED_HASH_LENGTH = hashInspection.receivedHashLength;
  diagnostics.CALCULATED_HASH_LENGTH = hashInspection.calculatedHashLength;
  diagnostics.RECEIVED_HASH_HAS_PLUS = hashInspection.receivedHashHasPlus;
  diagnostics.RECEIVED_HASH_HAS_SPACE = hashInspection.receivedHashHasSpace;
  diagnostics.HASH_TRANSPORT_NORMALIZATION = hashInspection.hashTransportNormalization;
  diagnostics.HASH_VALIDATION_STAGE = hashInspection.validationStage;
  diagnostics.HASH_VALID = hashInspection.hashValid;
  if (!diagnostics.HASH_VALID) {
    return { outcome: 'REJECTED', reason: 'INVALID_RESPONSE_HASH' };
  }
  diagnostics.CLIENT_ID_MATCH = String(params.clientid || params.ClientId || '') === config.merchantId;
  if (!diagnostics.CLIENT_ID_MATCH) {
    return { outcome: 'REJECTED', reason: 'CLIENTID_MISMATCH' };
  }
  const orderId = String(params.oid || params.ReturnOid || '');
  diagnostics.ORDER_ID_MATCH = Boolean(orderId)
    && !(params.ReturnOid && params.oid && params.ReturnOid !== params.oid);
  if (!diagnostics.ORDER_ID_MATCH) {
    return { outcome: 'REJECTED', reason: 'ORDER_ID_MISMATCH' };
  }
  const order = await findOrderById(orderId, env);
  diagnostics.ORDER_FOUND = Boolean(order);
  if (!diagnostics.ORDER_FOUND) return { outcome: 'REJECTED', reason: 'ORDER_NOT_FOUND' };
  diagnostics.AMOUNT_MATCH = callbackAmountMatchesOrder(params, order);
  if (!diagnostics.AMOUNT_MATCH) {
    return { outcome: 'REJECTED', reason: 'AMOUNT_MISMATCH' };
  }
  if (['PAID', 'DECLINED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(order.payment_status)) {
    return { outcome: 'ALREADY_FINAL', order };
  }

  // Single-writer claim: a concurrent duplicate callback loses this update and
  // must not finalize or email the same hosted payment twice.
  const claimed = await patchOrder(orderId, {
    payment_status: 'AUTHORIZING',
    callback_received_at: new Date().toISOString(),
    md_status: String(params.mdStatus ?? ''),
  }, ['PENDING', '3D_PENDING'], env);
  if (!claimed) return { outcome: 'ALREADY_PROCESSING', order: await findOrderById(orderId, env) };

  const shared = {
    authorization_code: params.AuthCode || null,
    nestpay_transaction_id: params.TransId || null,
    host_reference: params.HostRefNum || null,
    proc_return_code: params.ProcReturnCode || null,
    response: params.Response || null,
    transaction_date: params['EXTRA.TRXDATE'] || params.TRXDATE || null,
  };
  const nextState = hostedPaymentState(params);
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
