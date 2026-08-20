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

const ISO_8859_9_SPECIAL_BYTES = new Map([
  [0x011e, 0xd0], [0x0130, 0xdd], [0x015e, 0xde],
  [0x011f, 0xf0], [0x0131, 0xfd], [0x015f, 0xfe],
]);
const ISO_8859_9_REPLACED_LATIN1 = new Set([0xd0, 0xdd, 0xde, 0xf0, 0xfd, 0xfe]);

// Equivalent to .NET Encoding.GetEncoding("ISO-8859-9").GetBytes for the
// Ver2 response sample. Unrepresentable characters use the default "?"
// replacement fallback; the six Turkish letters occupy the ISO-8859-9 slots
// that differ from ISO-8859-1.
const encodeIso88599 = (text) => Buffer.from(Array.from(String(text), (character) => {
  const codePoint = character.codePointAt(0);
  if (ISO_8859_9_SPECIAL_BYTES.has(codePoint)) return ISO_8859_9_SPECIAL_BYTES.get(codePoint);
  if (codePoint <= 0xff && !ISO_8859_9_REPLACED_LATIN1.has(codePoint)) return codePoint;
  return 0x3f;
}));

const sha512Base64Iso88599 = (text) => createHash('sha512').update(encodeIso88599(text)).digest('base64');

const SHA512_BASE64 = /^[A-Za-z0-9+/]{86}==$/;
const SHA512_BASE64_FORM_VALUE = /^[A-Za-z0-9+/ ]{86}==$/;

// Some application/x-www-form-urlencoded decoders turn an unescaped Base64
// "+" into an ASCII space. Recover only that single transport ambiguity and
// only for an otherwise canonical 64-byte SHA-512 Base64 value. No other
// whitespace, URL-safe alphabet, trimming or permissive Base64 decoding is
// accepted, and the complete cryptographic comparison remains mandatory.
const normalizeReceivedSha512Base64 = (value) => {
  if (typeof value !== 'string') return { valid: false, value: '', mode: null };
  const exact = SHA512_BASE64.test(value);
  const formEncodedPlus = !exact && value.includes(' ') && SHA512_BASE64_FORM_VALUE.test(value);
  const normalized = exact ? value : formEncodedPlus ? value.replaceAll(' ', '+') : '';
  if (!normalized || !SHA512_BASE64.test(normalized)) {
    return { valid: false, value: '', mode: null };
  }
  const decoded = Buffer.from(normalized, 'base64');
  if (decoded.length !== 64 || decoded.toString('base64') !== normalized) {
    return { valid: false, value: '', mode: null };
  }
  return {
    valid: true,
    value: normalized,
    mode: exact ? 'EXACT' : 'FORM_PLUS_AS_SPACE',
  };
};

const normalizeFormScalar = (value) => {
  if (value == null) return { valid: true, value: '', duplicate: false };
  if (typeof value === 'string') return { valid: true, value, duplicate: false };
  if (!Array.isArray(value) || value.length === 0) {
    return { valid: false, value: '', duplicate: false };
  }
  if (!value.every((entry) => typeof entry === 'string')) {
    return { valid: false, value: '', duplicate: value.length > 1 };
  }
  const [first] = value;
  return {
    valid: value.every((entry) => entry === first),
    value: first,
    duplicate: value.length > 1,
  };
};

// Vercel's URL-encoded body parser may represent repeated form fields as
// arrays. NestPay signs scalar values, so byte-for-byte identical repeats are
// safely canonicalized to that scalar. Conflicting or non-string values remain
// ambiguous and must be rejected before any payment processing.
export function normalizeNestPayFormParams(input) {
  const params = Object.create(null);
  const duplicateFields = [];
  const ambiguousFields = [];
  const caseInsensitive = new Map();
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { params, duplicateFields, ambiguousFields: ['[ROOT]'], valid: false };
  }

  for (const [key, rawValue] of Object.entries(input)) {
    const normalized = normalizeFormScalar(rawValue);
    if (normalized.duplicate) duplicateFields.push(key);
    if (!normalized.valid) {
      ambiguousFields.push(key);
      continue;
    }

    const folded = key.toLowerCase();
    const existing = caseInsensitive.get(folded);
    if (existing && existing.value !== normalized.value) {
      ambiguousFields.push(existing.key, key);
      continue;
    }
    if (!existing) caseInsensitive.set(folded, { key, value: normalized.value });
    params[key] = normalized.value;
  }

  return {
    params,
    duplicateFields: [...new Set(duplicateFields)],
    ambiguousFields: [...new Set(ambiguousFields)],
    valid: ambiguousFields.length === 0,
  };
}

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

// Exact server-prepared field set for the browser POST to est3dgate. Banca
// Intesa requires storetype=3d_pay_hosting for this merchant, while instalment
// and CallbackURL must be absent. Browser-only card fields are added separately
// by CardPayment; storetype is not part of the Hash v2 input.
export function create3DFormFields({ orderId, amountRsd, installmentCount, okUrl, failUrl }, env = process.env) {
  const config = getNestPayConfig(env);
  const amount = String(amountRsd);
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error('INVALID_AMOUNT');
  if (Number(installmentCount) !== 1) throw new Error('HOSTED_INSTALLMENTS_UNSUPPORTED');
  // The merchant-specific POST omits instalment, while Marina's supplied
  // Hash Ver2 formula still contains its empty positional slot after Auth.
  const instalment = '';
  const rnd = generateRnd();
  const hash = create3DRequestHash(
    { clientid: config.merchantId, oid: orderId, amount, okUrl, failUrl, tranType: 'Auth', instalment, rnd, currency: '941' },
    env.NESTPAY_STORE_KEY,
  );
  return {
    gateUrl: config.url3d,
    fields: {
      clientid: config.merchantId, storetype: '3d_pay_hosting', trantype: 'Auth',
      amount, currency: '941', oid: orderId,
      okUrl, failUrl, lang: 'tr', rnd, hashAlgorithm: 'ver2', hash,
    },
  };
}

const paramValue = (params, name) => {
  if (params[name] != null) return params[name];
  const key = Object.keys(params).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key ? params[key] : '';
};

// Hash Ver2 response check (3D manual response sample, pp. 30–31): parse the
// pipe-delimited names in returned HASHPARAMS order. Escape each matching POST
// value and append "|" (including after the final value), compare that exact
// paramsval with HASHPARAMSVAL, then append the escaped StoreKey with no extra
// separator and calculate SHA-512/Base64 over ISO-8859-9 bytes.
export function inspect3DResponseHash(params, storeKey) {
  const normalized = normalizeNestPayFormParams(params);
  const form = normalized.params;
  const hashParams = String(form.HASHPARAMS || '');
  const suppliedValues = form.HASHPARAMSVAL;
  const suppliedHash = form.HASH;
  const algorithm = String(paramValue(form, 'hashAlgorithm') ?? '');
  const hashParamsFields = hashParams ? hashParams.split('|') : [];
  const result = {
    hashAlgorithmBranch: !algorithm ? 'MISSING' : algorithm.toLowerCase() === 'ver2' ? 'VER2' : 'OTHER',
    hashParamsFields,
    hashParamsFormatValid: Boolean(hashParams)
      && hashParamsFields.length > 0 && hashParamsFields.every((name) => Boolean(name)),
    requiredHashFieldsSigned: false,
    hashParamsValMatch: null,
    hashParamsValFormat: null,
    receivedHashLength: typeof suppliedHash === 'string' ? suppliedHash.length : null,
    calculatedHashLength: null,
    receivedHashHasPlus: typeof suppliedHash === 'string' ? suppliedHash.includes('+') : null,
    receivedHashHasSpace: typeof suppliedHash === 'string' ? suppliedHash.includes(' ') : null,
    hashTransportNormalization: null,
    hashValid: false,
    validationStage: 'MISSING_HASH_INPUTS',
  };
  if (!normalized.valid) {
    result.validationStage = 'AMBIGUOUS_FORM_FIELD';
    return result;
  }
  if (!hashParams || suppliedValues == null || !suppliedHash || typeof storeKey !== 'string' || !storeKey) return result;
  if (result.hashAlgorithmBranch !== 'VER2') {
    result.validationStage = 'UNSUPPORTED_HASH_ALGORITHM';
    return result;
  }

  const names = result.hashParamsFields;
  if (!result.hashParamsFormatValid) {
    result.validationStage = 'INVALID_HASHPARAMS_FORMAT';
    return result;
  }

  const lowered = names.map((name) => name.toLowerCase());
  // Bind the signed callback to this merchant and order. Response is a final
  // payment-result field and NestPay's intermediate 3D callback does not list
  // it in HASHPARAMS (the observed Ver2 shape is clientid|oid|rnd).
  if (!['clientid', 'oid'].every((required) =>
    lowered.includes(required) || (required === 'oid' && lowered.includes('returnoid')))) {
    result.validationStage = 'REQUIRED_FIELDS_NOT_SIGNED';
    return result;
  }
  result.requiredHashFieldsSigned = true;

  const escapedValues = names.map((name) => escapeHashValue(paramValue(form, name)));
  // The supplied Ver2 manual is internally inconsistent: section 3.3.1's
  // concrete HASHPARAMSVAL example has no final pipe, while the pp. 30-31
  // response sample appends one after every value. Accept only the exact
  // documented serialization returned by NestPay, then hash that exact text.
  const joinedValues = escapedValues.join('|');
  const candidates = [
    {
      format: 'TRAILING_PIPE',
      paramsval: `${joinedValues}|`,
      hashPrefix: `${joinedValues}|`,
    },
    {
      format: 'NO_TRAILING_PIPE',
      paramsval: joinedValues,
      // Section 3.3.1 returns HASHPARAMSVAL without the final delimiter, but
      // its published HASH sample verifies only when StoreKey remains the
      // final pipe-separated value. The delimiter belongs to the hash
      // plaintext, not to the returned HASHPARAMSVAL representation.
      hashPrefix: `${joinedValues}|`,
    },
  ];
  const matched = candidates.find(({ paramsval }) => paramsval === String(suppliedValues));
  result.hashParamsValMatch = Boolean(matched);
  if (!result.hashParamsValMatch) {
    result.validationStage = 'HASHPARAMSVAL_MISMATCH';
    return result;
  }
  result.hashParamsValFormat = matched.format;

  const calculatedHash = sha512Base64Iso88599(`${matched.hashPrefix}${escapeHashValue(storeKey)}`);
  result.calculatedHashLength = calculatedHash.length;
  const normalizedHash = normalizeReceivedSha512Base64(String(suppliedHash));
  result.hashTransportNormalization = normalizedHash.mode;
  if (!normalizedHash.valid) {
    result.validationStage = 'INVALID_HASH_ENCODING';
    return result;
  }
  const left = Buffer.from(calculatedHash);
  const right = Buffer.from(normalizedHash.value);
  result.hashValid = left.length === right.length && timingSafeEqual(left, right);
  result.validationStage = result.hashValid ? 'VALID' : 'HASH_MISMATCH';
  return result;
}

export function verify3DResponseHash(params, storeKey) {
  return inspect3DResponseHash(params, storeKey).hashValid;
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
