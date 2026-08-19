import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const TEST_3D = 'https://testsecurepay.eway2pay.com/fim/est3dgate';
const TEST_API = 'https://testsecurepay.eway2pay.com/fim/api';
const TEST_MERCHANT_ID = '13IN004634';

export function getNestPayConfig(env = process.env) {
  const mode = env.NESTPAY_ENV;
  if (mode !== 'test') throw new Error('NESTPAY_TEST_MODE_REQUIRED');
  const url3d = env.NESTPAY_3D_URL || TEST_3D;
  const apiUrl = env.NESTPAY_API_URL || TEST_API;
  if (url3d !== TEST_3D || apiUrl !== TEST_API) throw new Error('NESTPAY_ENDPOINT_ENV_MISMATCH');
  for (const key of ['NESTPAY_MERCHANT_ID', 'NESTPAY_STORE_KEY', 'NESTPAY_API_USERNAME', 'NESTPAY_API_PASSWORD']) {
    if (!env[key]) throw new Error(`MISSING_${key}`);
  }
  if (env.NESTPAY_MERCHANT_ID !== TEST_MERCHANT_ID) throw new Error('NESTPAY_MERCHANT_ID_MISMATCH');
  return { mode, url3d, apiUrl, merchantId: env.NESTPAY_MERCHANT_ID };
}

export function isNestPayTestConfigured(env = process.env) {
  try {
    getNestPayConfig(env);
    return true;
  } catch {
    return false;
  }
}

export const escapeHashValue = (value) => String(value ?? '').replaceAll('\\', '\\\\').replaceAll('|', '\\|');
const sha512Base64 = (text) => createHash('sha512').update(text, 'latin1').digest('base64');

// NestPay Merchant Integration 3D, pp. 9 and 15–17 (Hash Version 2).
export function create3DRequestHash(fields, storeKey) {
  const values = [
    fields.clientid, fields.oid, fields.amount, fields.okUrl, fields.failUrl,
    fields.tranType, fields.instalment ?? '', fields.rnd,
  ].map(escapeHashValue);
  const currency = escapeHashValue(fields.currency);
  return sha512Base64(`${values.join('|')}||||${currency}|${escapeHashValue(storeKey)}`);
}

// 20-character random value; generated once per transaction and reused
// verbatim in both the hash plaintext and the POSTed rnd field.
export function generateRnd() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(randomBytes(20), (byte) => alphabet[byte % alphabet.length]).join('');
}

// Exact non-card hidden-field set for the browser POST to est3dgate. The
// merchant-specific setup and supplied implementation examples use 3d_pay;
// storetype is not part of the Hash v2 input.
export function create3DFormFields({ orderId, amountRsd, installmentCount, okUrl, failUrl }, env = process.env) {
  const config = getNestPayConfig(env);
  const amount = String(amountRsd);
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error('INVALID_AMOUNT');
  const instalment = Number(installmentCount) > 1 ? String(installmentCount) : '';
  const rnd = generateRnd();
  const hash = create3DRequestHash(
    { clientid: config.merchantId, oid: orderId, amount, okUrl, failUrl, tranType: 'Auth', instalment, rnd, currency: '941' },
    env.NESTPAY_STORE_KEY,
  );
  return {
    gateUrl: config.url3d,
    fields: {
      clientid: config.merchantId, storetype: '3d_pay', trantype: 'Auth',
      amount, currency: '941', instalment, oid: orderId,
      okUrl, failUrl, lang: 'tr', rnd, hashAlgorithm: 'ver2', hash,
    },
  };
}

const paramValue = (params, name) => {
  if (params[name] != null) return params[name];
  const key = Object.keys(params).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key ? params[key] : '';
};

// Hash v2 response check (3D manual §3.3.1): escaped values joined with "|",
// store key appended, SHA-512, Base64. HASHPARAMS must include the mandatory
// clientid/oid/Response names (§3.3.2).
export function verify3DResponseHash(params, storeKey) {
  const hashParams = String(params.HASHPARAMS || '');
  const suppliedValues = params.HASHPARAMSVAL;
  const suppliedHash = params.HASH;
  if (!hashParams || suppliedValues == null || !suppliedHash) return false;
  const names = hashParams.split('|').filter(Boolean);
  const lowered = names.map((name) => name.toLowerCase());
  if (!['clientid', 'oid', 'response'].every((required) =>
    lowered.includes(required) || (required === 'oid' && lowered.includes('returnoid')))) return false;
  const joinedValues = names.map((name) => escapeHashValue(paramValue(params, name))).join('|');
  const suppliedJoined = String(suppliedValues).replace(/\|$/, '');
  if (joinedValues !== suppliedJoined) return false;
  const calculatedHash = sha512Base64(`${joinedValues}|${escapeHashValue(storeKey)}`);
  const left = Buffer.from(calculatedHash);
  const right = Buffer.from(String(suppliedHash));
  return left.length === right.length && timingSafeEqual(left, right);
}

export const isAccepted3DStatus = (mdStatus) => ['1', '2', '3', '4'].includes(String(mdStatus));

const xml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

// CC5AS XML fields from the API manual, pp. 9–18.
export function buildAuthorizationXml(input) {
  const instalment = Number(input.installmentCount) > 1
    ? `<Instalment>${xml(input.installmentCount)}</Instalment>` : '';
  return `<CC5Request><Name>${xml(input.username)}</Name><Password>${xml(input.password)}</Password><ClientId>${xml(input.clientId)}</ClientId><IPAddress>${xml(input.ipAddress)}</IPAddress><Email>${xml(input.email)}</Email><OrderId>${xml(input.orderId)}</OrderId><Type>Auth</Type><Number>${xml(input.md)}</Number><Total>${xml(input.total)}</Total><Currency>941</Currency>${instalment}<PayerSecurityLevel>${xml(input.eci)}</PayerSecurityLevel><PayerTxnId>${xml(input.xid)}</PayerTxnId><PayerAuthenticationCode>${xml(input.cavv)}</PayerAuthenticationCode></CC5Request>`;
}

export function buildOrderStatusXml(input) {
  return `<CC5Request><Name>${xml(input.username)}</Name><Password>${xml(input.password)}</Password><ClientId>${xml(input.clientId)}</ClientId><OrderId>${xml(input.orderId)}</OrderId><Extra><ORDERSTATUS>QUERY</ORDERSTATUS></Extra></CC5Request>`;
}

const decodeXml = (value) => value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&');
export function parseApiResponse(body) {
  if (typeof body !== 'string' || !body.includes('<CC5Response>')) throw new Error('MALFORMED_NESTPAY_RESPONSE');
  const get = (tag) => {
    const match = body.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return match ? decodeXml(match[1].trim()) : '';
  };
  return {
    response: get('Response'), procReturnCode: get('ProcReturnCode'),
    authCode: get('AuthCode'), hostReference: get('HostRefNum'),
    transactionId: get('TransId'), orderId: get('OrderId'), errorMessage: get('ErrMsg'),
    transactionStatus: get('TRANS_STAT'), chargeType: get('CHARGE_TYPE_CD'),
    statusAuthCode: get('AUTH_CODE'), statusHostReference: get('HOST_REF_NUM'),
    statusTransactionId: get('TRANS_ID'), statusProcReturnCode: get('PROC_RET_CD'),
    statusMdStatus: get('MDSTATUS'),
    transactionDate: get('TRXDATE') || get('AUTH_DTTM') || get('CAPTURE_DTTM'),
  };
}

export const isApprovedApiResponse = (result) =>
  result?.response === 'Approved' && result?.procReturnCode === '00';

export function paymentStateFromApiResponse(result) {
  if (isApprovedApiResponse(result)) return 'PAID';
  if (result?.response === 'Declined') return 'DECLINED';
  return 'UNKNOWN';
}
