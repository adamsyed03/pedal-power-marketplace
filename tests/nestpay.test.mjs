import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotal, calculateOrderTotal } from '../api/_lib/catalog.mjs';
import { createOrderId } from '../api/_lib/order.mjs';
import {
  buildAuthorizationXml, buildOrderStatusXml, create3DFormFields, create3DRequestHash, inspect3DResponseHash,
  generateRnd, getNestPayConfig, isAccepted3DStatus, isApprovedApiResponse,
  isNestPayTestConfigured, normalizeNestPayFormParams, parseApiResponse,
  paymentStateFromApiResponse, verify3DResponseHash,
} from '../api/_lib/nestpay.mjs';
import {
  callbackAmountMatchesOrder, createCallbackDiagnostics, hasComplete3DAuthFields,
  isStagingCallbackDiagnosticsEnabled, processNestPayReturn, stripSensitiveFields,
} from '../api/_lib/payment-flow.mjs';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { verifyCaptcha } from '../api/_lib/captcha.mjs';
import { buildPaymentConfirmation } from '../api/_lib/email.mjs';
import { mapOrderStatus } from '../api/_lib/reconcile.mjs';
import { createLookupToken, hashLookupToken, rateLimit } from '../api/_lib/security.mjs';
import { validateCheckout } from '../api/_lib/validation.mjs';
import { getPublicUrls } from '../api/_lib/urls.mjs';
import { offeredInstallments, resolveDeliveryFee } from '../api/_lib/delivery.mjs';
import { insertOrder } from '../api/_lib/supabase.mjs';

const testEnv = {
  NESTPAY_ENV: 'test', NESTPAY_MERCHANT_ID: '13IN004634', NESTPAY_STORE_KEY: 'STOREKEY',
  NESTPAY_API_USERNAME: 'u', NESTPAY_API_PASSWORD: 'p',
};

test('server calculates authoritative product total and ignores browser price', () => {
  assert.deepEqual(calculateOrderTotal('core', 2).totalRsd, 270_000);
  assert.throws(() => calculateOrderTotal('core', 0), /INVALID_QUANTITY/);
  assert.throws(() => calculateOrderTotal('unknown', 1), /INVALID_PRODUCT/);
});

test('mixed-model totals are authoritative and quantities are not capped at five', () => {
  const cart = calculateCartTotal([{ product: 'glide', quantity: 7 }, { product: 'core', quantity: 2 }]);
  assert.equal(cart.totalQuantity, 9);
  assert.equal(cart.subtotalRsd, 1_425_000);
  assert.throws(() => calculateCartTotal([{ product: 'glide', quantity: 1 }, { product: 'glide', quantity: 2 }]), /DUPLICATE_PRODUCT/);
});

test('order IDs are unique and year-scoped', () => {
  const ids = new Set(Array.from({ length: 100 }, () => createOrderId(new Date('2026-01-01'))));
  assert.equal(ids.size, 100);
  assert.match([...ids][0], /^PGN-2026-[A-F0-9]{16}$/);
});

test('request hash follows the Banca Intesa Hash v2 plaintext with empty instalment slot', () => {
  const fields = { clientid: '1', oid: 'A|B', amount: '100', okUrl: 'https://ok', failUrl: 'https://fail', tranType: 'Auth', instalment: '', rnd: 'r', currency: '941' };
  // clientid|oid|amount|okurl|failurl|transaction type||rnd||||currency|StoreKey
  const plain = '1|A\\|B|100|https://ok|https://fail|Auth||r||||941|key';
  assert.equal(create3DRequestHash(fields, 'key'), createHash('sha512').update(plain, 'latin1').digest('base64'));
});

test('3D form fields use storetype 3d_pay, 20-char rnd, RSD 941, and a matching hash', () => {
  const { gateUrl, fields } = create3DFormFields({
    orderId: 'PGN-2026-AB12', amountRsd: 138_500, installmentCount: 1,
    okUrl: 'https://ridepogon.com/api/nestpay/callback?rt=t', failUrl: 'https://ridepogon.com/api/nestpay/callback?rt=t',
  }, testEnv);
  assert.equal(gateUrl, 'https://testsecurepay.eway2pay.com/fim/est3dgate');
  assert.equal(fields.storetype, '3d_pay');
  assert.equal(fields.trantype, 'Auth');
  assert.equal(fields.currency, '941');
  assert.equal(fields.instalment, '');
  assert.equal(fields.amount, '138500');
  assert.equal(fields.hashAlgorithm, 'ver2');
  assert.equal(fields.lang, 'tr');
  assert.equal(fields.rnd.length, 20);
  assert.deepEqual(Object.keys(fields).sort(), [
    'amount', 'clientid', 'currency', 'failUrl', 'hash', 'hashAlgorithm',
    'instalment', 'lang', 'oid', 'okUrl', 'rnd', 'storetype', 'trantype',
  ]);
  assert.equal(fields.hash, create3DRequestHash({
    clientid: fields.clientid, oid: fields.oid, amount: fields.amount,
    okUrl: fields.okUrl, failUrl: fields.failUrl, tranType: fields.trantype,
    instalment: fields.instalment, rnd: fields.rnd, currency: fields.currency,
  }, testEnv.NESTPAY_STORE_KEY));
});

test('instalment field carries the count only for real instalment sales', () => {
  const base = { orderId: 'o', amountRsd: 200_000, okUrl: 'https://x/cb', failUrl: 'https://x/cb' };
  assert.equal(create3DFormFields({ ...base, installmentCount: 3 }, testEnv).fields.instalment, '3');
  assert.equal(create3DFormFields({ ...base, installmentCount: 1 }, testEnv).fields.instalment, '');
});

test('rnd is always exactly 20 characters', () => {
  for (let i = 0; i < 50; i += 1) assert.equal(generateRnd().length, 20);
});

const createResponseHashFixture = ({ names, values, storeKey, trailingPipe = true }) => {
  const escape = (value) => String(value ?? '').replaceAll('\\', '\\\\').replaceAll('|', '\\|');
  const specialBytes = new Map([
    [0x011e, 0xd0], [0x0130, 0xdd], [0x015e, 0xde],
    [0x011f, 0xf0], [0x0131, 0xfd], [0x015f, 0xfe],
  ]);
  const replacedLatin1 = new Set([0xd0, 0xdd, 0xde, 0xf0, 0xfd, 0xfe]);
  const encodeIso88599 = (text) => Buffer.from(Array.from(String(text), (character) => {
    const codePoint = character.codePointAt(0);
    if (specialBytes.has(codePoint)) return specialBytes.get(codePoint);
    if (codePoint <= 0xff && !replacedLatin1.has(codePoint)) return codePoint;
    return 0x3f;
  }));
  const escapedValues = names.map((name) => escape(values[name]));
  const paramsval = `${escapedValues.join('|')}${trailingPipe ? '|' : ''}`;
  return {
    ...values,
    hashAlgorithm: 'ver2',
    HASHPARAMS: names.join('|'),
    HASHPARAMSVAL: paramsval,
    HASH: createHash('sha512').update(encodeIso88599(`${paramsval}${escape(storeKey)}`)).digest('base64'),
  };
};

test('official Ver2 response sample algorithm is accepted', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', AuthCode: '123456', Response: 'Approved', HostRefNum: 'ref', ProcReturnCode: '00', TransId: 'trx', ErrMsg: '', mdStatus: '1' };
  const names = ['clientid', 'oid', 'AuthCode', 'Response', 'HostRefNum', 'ProcReturnCode', 'TransId', 'ErrMsg', 'mdStatus'];
  const params = createResponseHashFixture({ names, values, storeKey: 'STOREKEY' });
  assert.equal(verify3DResponseHash(params, 'STOREKEY'), true);
});

test('real intermediate Ver2 shape validates without requiring final response fields to be signed', () => {
  const values = {
    clientid: '13IN004634', oid: 'PGN-2026-0000000000000001', rnd: 'r'.repeat(20),
    Response: 'Error', ProcReturnCode: '99', mdStatus: '7',
  };
  const params = createResponseHashFixture({ names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY' });
  const inspection = inspect3DResponseHash(params, 'STOREKEY');
  assert.equal(inspection.requiredHashFieldsSigned, true);
  assert.equal(inspection.hashParamsValMatch, true);
  assert.equal(inspection.hashValid, true);
  assert.equal(inspection.validationStage, 'VALID');
});

test('section 3.3.1 no-trailing-pipe Ver2 response is accepted only with its matching hash', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', rnd: 'r'.repeat(20) };
  const params = createResponseHashFixture({
    names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY', trailingPipe: false,
  });
  const inspection = inspect3DResponseHash(params, 'STOREKEY');
  assert.equal(inspection.hashParamsValFormat, 'NO_TRAILING_PIPE');
  assert.equal(inspection.hashValid, true);
  const trailing = createResponseHashFixture({ names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY' });
  assert.equal(verify3DResponseHash({ ...params, HASH: trailing.HASH }, 'STOREKEY'), false);
});

test('callback form normalization accepts only identical string duplicates without trimming', () => {
  const normalized = normalizeNestPayFormParams({
    oid: [' PGN-1 ', ' PGN-1 '], clientid: ['13IN004634'], rnd: 'r'.repeat(20),
  });
  assert.equal(normalized.valid, true);
  assert.equal(normalized.params.oid, ' PGN-1 ');
  assert.equal(normalized.params.clientid, '13IN004634');
  assert.deepEqual(normalized.duplicateFields, ['oid']);
  assert.deepEqual(normalized.ambiguousFields, []);

  for (const invalid of [
    { oid: ['PGN-1', 'PGN-2'] },
    { oid: { nested: 'PGN-1' } },
    { oid: 123 },
    { clientid: '13IN004634', ClientId: 'different' },
  ]) assert.equal(normalizeNestPayFormParams(invalid).valid, false);
});

test('identical repeated callback values are normalized before Ver2 verification', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-2026-0000000000000001', rnd: 'r'.repeat(20) };
  const fixture = createResponseHashFixture({ names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY' });
  const repeated = Object.fromEntries(Object.entries(fixture).map(([key, value]) => [key, [value, value]]));
  const inspection = inspect3DResponseHash(repeated, 'STOREKEY');
  assert.equal(inspection.hashParamsValMatch, true);
  assert.equal(inspection.hashValid, true);
  assert.equal(inspection.hashParamsValFormat, 'TRAILING_PIPE');
});

test('conflicting repeated callback values are rejected before cryptographic comparison', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-2026-0000000000000001', rnd: 'r'.repeat(20) };
  const params = createResponseHashFixture({ names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY' });
  const inspection = inspect3DResponseHash({ ...params, oid: [values.oid, 'PGN-2026-0000000000000002'] }, 'STOREKEY');
  assert.equal(inspection.hashParamsValMatch, null);
  assert.equal(inspection.hashValid, false);
  assert.equal(inspection.validationStage, 'AMBIGUOUS_FORM_FIELD');
});

test('invalid response HASH is rejected', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', Response: 'Approved' };
  const params = createResponseHashFixture({ names: ['clientid', 'oid', 'Response'], values, storeKey: 'STOREKEY' });
  assert.equal(verify3DResponseHash({ ...params, HASH: `${params.HASH}x` }, 'STOREKEY'), false);
});

test('altered returned field value is rejected', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', Response: 'Approved', mdStatus: '1' };
  const params = createResponseHashFixture({ names: ['clientid', 'oid', 'Response', 'mdStatus'], values, storeKey: 'STOREKEY' });
  assert.equal(verify3DResponseHash({ ...params, mdStatus: '2' }, 'STOREKEY'), false);
});

test('returned HASHPARAMS ordering is respected', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', Response: 'Approved', mdStatus: '1' };
  const original = createResponseHashFixture({ names: ['Response', 'mdStatus', 'oid', 'clientid'], values, storeKey: 'STOREKEY' });
  assert.equal(verify3DResponseHash(original, 'STOREKEY'), true);
  assert.equal(verify3DResponseHash({ ...original, HASHPARAMS: 'clientid|oid|Response|mdStatus' }, 'STOREKEY'), false);
});

test('empty returned parameter still contributes its trailing pipe', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', Response: 'Approved' };
  const names = ['clientid', 'oid', 'AuthCode', 'Response'];
  const params = createResponseHashFixture({ names, values, storeKey: 'STOREKEY' });
  assert.match(params.HASHPARAMSVAL, /\|\|Approved\|$/);
  assert.equal(verify3DResponseHash(params, 'STOREKEY'), true);
});

test('response values and StoreKey are escaped and hashed as ISO-8859-9', () => {
  const values = { clientid: '13IN004634', oid: 'PGN|1', Response: 'Approved', ErrMsg: 'İşlem A\\B|C' };
  const names = ['ErrMsg', 'Response', 'oid', 'clientid'];
  const storeKey = 'SĞ|K\\# value';
  const params = createResponseHashFixture({ names, values, storeKey });
  assert.equal(verify3DResponseHash(params, storeKey), true);
});

test('response hash requires the explicit Ver2 branch', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', Response: 'Approved' };
  const params = createResponseHashFixture({ names: ['clientid', 'oid', 'Response'], values, storeKey: 'STOREKEY' });
  assert.equal(verify3DResponseHash({ ...params, hashAlgorithm: 'ver1' }, 'STOREKEY'), false);
  assert.equal(verify3DResponseHash({ ...params, hashAlgorithm: undefined }, 'STOREKEY'), false);
});

test('response hash inspection reports only safe structural outcomes', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', Response: 'Approved', ErrMsg: 'İşlem' };
  const params = createResponseHashFixture({ names: ['clientid', 'oid', 'Response', 'ErrMsg'], values, storeKey: 'STOREKEY' });
  assert.deepEqual(inspect3DResponseHash(params, 'STOREKEY'), {
    hashAlgorithmBranch: 'VER2',
    hashParamsFields: ['clientid', 'oid', 'Response', 'ErrMsg'],
    hashParamsFormatValid: true,
    requiredHashFieldsSigned: true,
    hashParamsValMatch: true,
    hashParamsValFormat: 'TRAILING_PIPE',
    hashValid: true,
    validationStage: 'VALID',
  });
  assert.equal(inspect3DResponseHash({ ...params, HASHPARAMSVAL: 'altered' }, 'STOREKEY').validationStage, 'HASHPARAMSVAL_MISMATCH');
  assert.equal(inspect3DResponseHash({ ...params, HASH: `${params.HASH}x` }, 'STOREKEY').validationStage, 'HASH_MISMATCH');
  const missingBranch = inspect3DResponseHash({ ...params, hashAlgorithm: undefined }, 'STOREKEY');
  assert.equal(missingBranch.hashAlgorithmBranch, 'MISSING');
  assert.deepEqual(missingBranch.hashParamsFields, ['clientid', 'oid', 'Response', 'ErrMsg']);
  assert.equal(missingBranch.validationStage, 'UNSUPPORTED_HASH_ALGORITHM');
});

test('response hash is rejected when signed merchant/order binding names are missing', () => {
  const values = { AuthCode: '1', rnd: '2' };
  const params = createResponseHashFixture({ names: ['AuthCode', 'rnd'], values, storeKey: 'k' });
  assert.equal(verify3DResponseHash(params, 'k'), false);
});

test('3D accepted statuses are exactly 1 through 4', () => {
  for (const value of ['1', '2', '3', '4']) assert.equal(isAccepted3DStatus(value), true);
  for (const value of ['0', '5', '6', '7', '8', '']) assert.equal(isAccepted3DStatus(value), false);
});

test('authorization XML uses md in Number and includes 3D values and installments', () => {
  const output = buildAuthorizationXml({ username: 'u', password: 'p&', clientId: 'c', ipAddress: '127.0.0.1', email: 'a@b.rs', orderId: 'o', md: 'md', total: '100', installmentCount: 3, eci: 'eci', xid: 'xid', cavv: 'cavv' });
  assert.match(output, /<Number>md<\/Number>/);
  assert.match(output, /<Currency>941<\/Currency>/);
  assert.match(output, /<Instalment>3<\/Instalment>/);
  assert.match(output, /<PayerSecurityLevel>eci<\/PayerSecurityLevel>/);
  assert.match(output, /<PayerTxnId>xid<\/PayerTxnId>/);
  assert.match(output, /<PayerAuthenticationCode>cavv<\/PayerAuthenticationCode>/);
  assert.match(output, /<Password>p&amp;<\/Password>/);
  assert.doesNotMatch(output, /Cvv2Val|Expires/);
});

test('API response parsing distinguishes approved, declined and malformed', () => {
  const approved = parseApiResponse('<CC5Response><OrderId>o</OrderId><Response>Approved</Response><ProcReturnCode>00</ProcReturnCode><AuthCode>a</AuthCode><HostRefNum>h</HostRefNum><TransId>t</TransId><Extra><TRXDATE>20260819 10:00:00</TRXDATE></Extra></CC5Response>');
  assert.equal(isApprovedApiResponse(approved), true);
  assert.equal(approved.transactionDate, '20260819 10:00:00');
  assert.equal(isApprovedApiResponse(parseApiResponse('<CC5Response><Response>Declined</Response><ProcReturnCode>05</ProcReturnCode></CC5Response>')), false);
  assert.throws(() => parseApiResponse('bad'), /MALFORMED/);
});

test('Order Status query is separate from authorization', () => {
  const xml = buildOrderStatusXml({ username: 'u', password: 'p', clientId: 'c', orderId: 'o' });
  assert.match(xml, /<Extra><ORDERSTATUS>QUERY<\/ORDERSTATUS><\/Extra>/);
  assert.doesNotMatch(xml, /<Type>Auth<\/Type>|<Number>/);
});

test('test and production endpoints cannot be mixed', () => {
  const secrets = { NESTPAY_MERCHANT_ID: '13IN004634', NESTPAY_STORE_KEY: 's', NESTPAY_API_USERNAME: 'u', NESTPAY_API_PASSWORD: 'p' };
  assert.equal(getNestPayConfig({ ...secrets, NESTPAY_ENV: 'test' }).mode, 'test');
  assert.throws(() => getNestPayConfig({ ...secrets, NESTPAY_ENV: 'test', NESTPAY_API_URL: 'https://bib.eway2pay.com/fim/api' }), /MISMATCH/);
  assert.throws(() => getNestPayConfig({ ...secrets, NESTPAY_ENV: 'production' }), /TEST_MODE_REQUIRED/);
  assert.throws(() => getNestPayConfig({ ...secrets, NESTPAY_ENV: 'test', NESTPAY_MERCHANT_ID: 'wrong' }), /MERCHANT_ID_MISMATCH/);
  assert.equal(isNestPayTestConfigured({ ...secrets, NESTPAY_ENV: 'test' }), true);
  assert.equal(isNestPayTestConfigured({ ...secrets, NESTPAY_ENV: 'production' }), false);
});

test('API result mapping is fail-closed: only Approved plus 00 becomes PAID', () => {
  assert.equal(paymentStateFromApiResponse({ response: 'Approved', procReturnCode: '00' }), 'PAID');
  assert.equal(paymentStateFromApiResponse({ response: 'Approved', procReturnCode: '05' }), 'UNKNOWN');
  assert.equal(paymentStateFromApiResponse({ response: 'Declined', procReturnCode: '05' }), 'DECLINED');
  assert.equal(paymentStateFromApiResponse({ response: 'Error', procReturnCode: '99' }), 'UNKNOWN');
  assert.equal(paymentStateFromApiResponse(null), 'UNKNOWN');
});

test('captcha is verified server-side', async () => {
  const fakeFetch = async (_url, init) => {
    assert.match(init.body.toString(), /secret=secret/);
    return { ok: true, json: async () => ({ success: true, action: 'checkout' }) };
  };
  assert.equal(await verifyCaptcha('long-enough-token', '127.0.0.1', { TURNSTILE_SECRET_KEY: 'secret' }, fakeFetch), true);
  assert.equal(await verifyCaptcha('short', '', { TURNSTILE_SECRET_KEY: 'secret' }, fakeFetch), false);
  assert.equal(await verifyCaptcha('long-enough-token', '', { TURNSTILE_SECRET_KEY: 'secret' }, async () => ({ ok: true, json: async () => ({ success: false }) })), false);
  assert.equal(await verifyCaptcha('long-enough-token', '', { TURNSTILE_SECRET_KEY: 'secret' }, async () => ({ ok: true, json: async () => ({ success: true }) })), false);
  assert.equal(await verifyCaptcha('long-enough-token', '', { TURNSTILE_SECRET_KEY: 'secret' }, async () => ({ ok: true, json: async () => ({ success: true, action: 'other' }) })), false);
  await assert.rejects(() => verifyCaptcha('long-enough-token', '', { TURNSTILE_SECRET_KEY: 'secret' }, async () => { throw new Error('offline'); }), /CAPTCHA_SERVICE_UNAVAILABLE/);
});

test('confirmation claims charged status only for verified PAID and not-charged only for DECLINED', () => {
  const base = { orderId: 'o', customerName: 'Kupac', email: 'a@b.rs', street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon', unitPriceRsd: 1, quantity: 1, totalRsd: 1 };
  const merchant = { legalName: 'POGON MOBILITY DOO', pib: 'x', address: 'a' };
  assert.match(buildPaymentConfirmation({ ...base, paymentStatus: 'PAID' }, merchant).html, /kartice je zadužen/);
  assert.match(buildPaymentConfirmation({ ...base, paymentStatus: 'DECLINED' }, merchant).html, /nije zadužen/);
  const unknown = buildPaymentConfirmation({ ...base, paymentStatus: 'UNKNOWN' }, merchant).html;
  assert.doesNotMatch(unknown, /kartice je zadužen|kartice nije zadužen/);
});

test('payment confirmation separates VAT-inclusive products from delivery', () => {
  const base = { orderId: 'o', paymentStatus: 'PAID', customerName: 'Kupac', email: 'a@b.rs', street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon', unitPriceRsd: 100, quantity: 1, totalRsd: 100 };
  const merchant = { legalName: 'POGON MOBILITY DOO', pib: 'x', address: 'a' };
  const courier = buildPaymentConfirmation({ ...base, deliveryMethod: 'courier', deliveryFeeRsd: null }, merchant).html;
  assert.match(courier, /Proizvodi sa PDV-om/);
  assert.match(courier, /Obračunava se posebno/);
  const pickup = buildPaymentConfirmation({ ...base, deliveryMethod: 'pickup', deliveryFeeRsd: 0 }, merchant).html;
  assert.match(pickup, /Save Maskovica 3/);
});

test('lookup tokens are opaque and stored only as hashes', () => {
  const token = createLookupToken();
  assert.ok(token.length >= 40);
  assert.match(hashLookupToken(token), /^[a-f0-9]{64}$/);
  assert.notEqual(hashLookupToken(token), token);
});

test('order persistence sends a PENDING order through the server-only database client', async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init };
    return { ok: true, status: 201, json: async () => [JSON.parse(init.body)] };
  };
  const order = await insertOrder({
    order_id: 'PGN-2026-TEST',
    payment_status: 'PENDING',
    total_rsd: 138_500,
    idempotency_key: 'safe-idempotency-key',
  }, { SUPABASE_URL: 'https://database.invalid', SUPABASE_SERVICE_ROLE_KEY: 'server-only' }, fetchImpl);
  assert.equal(order.payment_status, 'PENDING');
  assert.equal(captured.init.method, 'POST');
  assert.match(captured.url, /\/rest\/v1\/orders$/);
});

test('checkout validation rejects unsupported installment and accepts configured values', () => {
  const base = { product: 'glide', quantity: 1, installmentCount: 3, captchaToken: 'a'.repeat(20), termsAccepted: true, deliveryMethod: 'courier', customer: { firstName: 'A', lastName: 'B', email: 'a@b.rs', phone: '12345678', street: 'Ulica 1', city: 'Beograd', postalCode: '11000' } };
  assert.equal(validateCheckout(base).installmentCount, 3);
  assert.throws(() => validateCheckout({ ...base, installmentCount: 2 }), /INVALID_CHECKOUT/);
});

test('rate limiting blocks requests above the configured window limit', () => {
  const key = `test-${Date.now()}`;
  assert.equal(rateLimit(key, { limit: 2, windowMs: 1000 }, 1).allowed, true);
  assert.equal(rateLimit(key, { limit: 2, windowMs: 1000 }, 2).allowed, true);
  assert.equal(rateLimit(key, { limit: 2, windowMs: 1000 }, 3).allowed, false);
  assert.equal(rateLimit(key, { limit: 2, windowMs: 1000 }, 1002).allowed, true);
});

test('Order Status reconciliation maps only final documented SMS states to PAID', () => {
  assert.equal(mapOrderStatus({ transactionStatus: 'C', chargeType: 'S', statusProcReturnCode: '00' }), 'PAID');
  assert.equal(mapOrderStatus({ transactionStatus: 'S', chargeType: 'S', statusProcReturnCode: '00' }), 'PAID');
  assert.equal(mapOrderStatus({ transactionStatus: 'D', chargeType: 'S' }), 'DECLINED');
  assert.equal(mapOrderStatus({ transactionStatus: 'NW', chargeType: 'S' }), 'UNKNOWN');
  assert.equal(mapOrderStatus({ transactionStatus: 'PN', chargeType: 'S' }), 'UNKNOWN');
  assert.equal(mapOrderStatus({ transactionStatus: 'V', chargeType: 'S' }), 'CANCELLED');
});

test('callback and result URLs come only from HTTPS APP_BASE_URL', () => {
  const urls = getPublicUrls({ APP_BASE_URL: 'https://ridepogon.com/' });
  assert.equal(urls.callbackUrl, 'https://ridepogon.com/api/nestpay/callback');
  assert.equal(urls.successUrl, 'https://ridepogon.com/payment/success');
  assert.throws(() => getPublicUrls({ APP_BASE_URL: 'http://ridepogon.com' }), /HTTPS/);
});

test('delivery fee is authoritative and unresolved courier has no payable fee', () => {
  assert.deepEqual(resolveDeliveryFee('pickup', {}), { exact: true, feeRsd: 0, source: 'pickup' });
  assert.deepEqual(resolveDeliveryFee('courier', {}), { exact: true, feeRsd: 3500, source: 'fixed_server_config' });
  assert.deepEqual(resolveDeliveryFee('courier', { COURIER_FIXED_FEE_RSD: '3300' }), { exact: true, feeRsd: 3300, source: 'fixed_server_config' });
  assert.throws(() => resolveDeliveryFee('courier', { COURIER_FIXED_FEE_RSD: '33.5' }), /INVALID/);
});

test('installment choices are server configurable and bounded to 12', () => {
  assert.deepEqual(offeredInstallments({ NESTPAY_INSTALLMENTS: '1,3,6,12,24' }), [1, 3, 6, 12]);
});

test('card data echoed in a gateway response is stripped before processing or storage', () => {
  const clean = stripSensitiveFields({
    oid: 'PGN-1', Response: 'Approved', MaskedPan: '484187***2912',
    pan: '1111', cv2: '999', Ecom_Payment_Card_ExpDate_Year: '2026', Ecom_Payment_Card_ExpDate_Month: '12',
  });
  assert.deepEqual(Object.keys(clean).sort(), ['MaskedPan', 'Response', 'oid']);
});

test('callback amount and required 3D Auth fields are validated before API authorization', () => {
  const order = { total_rsd: 138_500 };
  assert.equal(callbackAmountMatchesOrder({ amount: '138500' }, order), true);
  assert.equal(callbackAmountMatchesOrder({ amount: '1' }, order), false);
  assert.equal(callbackAmountMatchesOrder({}, order), true);
  assert.equal(hasComplete3DAuthFields({ md: 'm', eci: '05', xid: 'x', cavv: 'c' }), true);
  assert.equal(hasComplete3DAuthFields({ md: 'm', eci: '05', xid: 'x' }), false);
});

test('official test PAN literals are isolated from production source', () => {
  const productionSources = [
    '../src/lib/nestpay.ts',
    '../api/_lib/nestpay.mjs',
    '../api/_lib/payment-flow.mjs',
    '../api/checkout/create.ts',
    '../api/nestpay/prepare.ts',
    '../api/nestpay/callback.ts',
    '../src/app/App.tsx',
    '../src/app/components/Checkout.tsx',
    '../src/app/components/CardPayment.tsx',
  ].map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
  assert.doesNotMatch(productionSources, /\b(?:4\d{15}|5\d{15}|3\d{14}|9\d{15})\b/);
});

test('server payment surfaces never receive or persist card data', () => {
  const prepare = readFileSync(new URL('../api/nestpay/prepare.ts', import.meta.url), 'utf8');
  const callback = readFileSync(new URL('../api/nestpay/callback.ts', import.meta.url), 'utf8');
  const flow = readFileSync(new URL('../api/_lib/payment-flow.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(prepare, /\bpan\b|cv2|ExpDate/);
  assert.match(callback, /processNestPayReturn/);
  assert.match(flow, /stripSensitiveFields/);
  assert.doesNotMatch(flow, /console\.log/);
});

test('callback route only redirects after verified processing and rejects invalid hashes', () => {
  const callback = readFileSync(new URL('../api/nestpay/callback.ts', import.meta.url), 'utf8');
  assert.match(callback, /REJECTED/);
  assert.match(callback, /status\(303\)/);
  const flow = readFileSync(new URL('../api/_lib/payment-flow.mjs', import.meta.url), 'utf8');
  assert.match(flow, /inspect3DResponseHash/);
  assert.match(flow, /paymentStateFromApiResponse/);
  assert.match(flow, /UNKNOWN/);
});

test('staging callback diagnostics expose presence and outcomes without sensitive values', () => {
  const diagnostics = createCallbackDiagnostics({
    oid: 'PGN-2026-80BDD83DF09AB903', clientid: 'merchant-value', md: 'sensitive-md',
    cavv: 'sensitive-cavv', xid: 'sensitive-xid', HASH: 'sensitive-hash',
    HASHPARAMSVAL: 'sensitive-hash-plaintext', pan: 'sensitive-pan', cvv: 'sensitive-cvv',
  });
  assert.equal(diagnostics.order_id, 'PGN-2026-80BDD83DF09AB903');
  assert.equal(diagnostics.FIELD_PRESENCE.clientid, true);
  assert.equal(diagnostics.FIELD_PRESENCE.md, true);
  assert.equal(diagnostics.FIELD_PRESENCE.HASH, true);
  assert.equal(diagnostics.FIELD_PRESENCE.hashAlgorithm, false);
  assert.equal(diagnostics.FIELD_PRESENCE.Response, false);
  assert.deepEqual(diagnostics.HASHPARAMS_FIELDS, []);
  assert.equal(diagnostics.HASHPARAMSVAL_MATCH, null);
  assert.deepEqual(diagnostics.DUPLICATE_FORM_FIELDS, []);
  assert.deepEqual(diagnostics.AMBIGUOUS_FORM_FIELDS, []);
  const serialized = JSON.stringify(diagnostics);
  for (const forbidden of [
    'merchant-value', 'sensitive-md', 'sensitive-cavv', 'sensitive-xid',
    'sensitive-hash', 'sensitive-hash-plaintext', 'sensitive-pan', 'sensitive-cvv',
  ]) assert.doesNotMatch(serialized, new RegExp(forbidden));
});

test('callback hash diagnostics expose field names and comparison stages but never values', async () => {
  const expiryField = 'Ecom_Payment_Card_ExpDate_Year';
  const raw = {
    clientid: '13IN004634', oid: 'PGN-2026-0000000000000001', Response: 'Error',
    hashAlgorithm: 'ver2', [expiryField]: 'sensitive-expiry',
    HASHPARAMS: `clientid|oid|Response|${expiryField}`,
    HASHPARAMSVAL: 'sensitive-paramsval', HASH: 'sensitive-hash',
  };
  const diagnostics = createCallbackDiagnostics(raw);
  const result = await processNestPayReturn(raw, testEnv, async () => {
    throw new Error('API authorization must not run for an invalid callback hash');
  }, diagnostics);
  assert.equal(result.reason, 'INVALID_RESPONSE_HASH');
  assert.equal(diagnostics.HASH_ALGORITHM_BRANCH, 'VER2');
  assert.deepEqual(diagnostics.HASHPARAMS_FIELDS, ['clientid', 'oid', 'Response', expiryField]);
  assert.deepEqual(diagnostics.HASHPARAMS_FIELD_PRESENCE, [
    { field: 'clientid', present: true }, { field: 'oid', present: true },
    { field: 'Response', present: true }, { field: expiryField, present: true },
  ]);
  assert.deepEqual(diagnostics.HASHED_FIELDS_MISSING, []);
  assert.deepEqual(diagnostics.HASHED_FIELDS_REMOVED_BY_SANITIZER, [expiryField]);
  assert.equal(diagnostics.HASHPARAMSVAL_MATCH, false);
  assert.equal(diagnostics.HASHPARAMSVAL_FORMAT, null);
  assert.equal(diagnostics.HASH_VALIDATION_STAGE, 'HASHPARAMSVAL_MISMATCH');
  assert.equal(diagnostics.HASH_VALID, false);
  const serialized = JSON.stringify(diagnostics);
  for (const forbidden of ['sensitive-expiry', 'sensitive-paramsval', 'sensitive-hash']) {
    assert.doesNotMatch(serialized, new RegExp(forbidden));
  }
});

test('callback diagnostics are enabled only for the HTTPS staging origin', () => {
  assert.equal(isStagingCallbackDiagnosticsEnabled({ APP_BASE_URL: 'https://test.ridepogon.com' }), true);
  assert.equal(isStagingCallbackDiagnosticsEnabled({ APP_BASE_URL: 'https://ridepogon.com' }), false);
  assert.equal(isStagingCallbackDiagnosticsEnabled({ APP_BASE_URL: 'http://test.ridepogon.com' }), false);
  assert.equal(isStagingCallbackDiagnosticsEnabled({ APP_BASE_URL: 'not-a-url' }), false);
});

test('checkout rejects missing terms acceptance and missing captcha before order creation', () => {
  const valid = { items: [{ product: 'glide', quantity: 1 }], installmentCount: 1, captchaToken: 'a'.repeat(20), termsAccepted: true, deliveryMethod: 'courier', customer: { firstName: 'A', lastName: 'B', email: 'a@b.rs', phone: '12345678', street: 'Ulica 1', city: 'Beograd', postalCode: '11000' } };
  assert.throws(() => validateCheckout({ ...valid, termsAccepted: false }), /INVALID_CHECKOUT/);
  assert.throws(() => validateCheckout({ ...valid, captchaToken: '' }), /INVALID_CAPTCHA/);
  const createRoute = readFileSync(new URL('../api/checkout/create.ts', import.meta.url), 'utf8');
  assert.ok(createRoute.indexOf('validateCheckout(request.body)') < createRoute.indexOf('findOrderByIdempotency(idempotencyKey)'));
  assert.match(createRoute, /INVALID_CAPTCHA[^]*status\(400\)/);
  assert.match(createRoute, /CAPTCHA_SERVICE_UNAVAILABLE[^]*status\(503\)/);
});

test('captcha fails closed without a server secret and expires client tokens', async () => {
  await assert.rejects(() => verifyCaptcha('a'.repeat(20), '', {}, async () => { throw new Error('must not fetch'); }), /CAPTCHA_NOT_CONFIGURED/);
  const turnstile = readFileSync(new URL('../src/app/components/Turnstile.tsx', import.meta.url), 'utf8');
  assert.match(turnstile, /expired-callback[^]*onTokenRef\.current\(''\)/);
  assert.match(turnstile, /error-callback[^]*fail/);
  assert.match(turnstile, /script\.addEventListener\('load', render/);
  assert.match(turnstile, /if \(window\.turnstile\) render\(\)/);
  assert.match(turnstile, /action: 'checkout'/);
  assert.match(turnstile, /VITE_TURNSTILE_SITE_KEY/);
  assert.doesNotMatch(turnstile, /TURNSTILE_SECRET_KEY/);
});

test('EPM payment branding uses the bank and four card-network artwork assets', () => {
  for (const asset of [
    'banca-intesa.png', 'visa.png', 'mastercard.png',
    'visa-secure.png', 'mastercard-identity-check.svg',
  ]) assert.equal(existsSync(new URL(`../public/payment-brands/${asset}`, import.meta.url)), true);
  const branding = readFileSync(new URL('../src/app/components/PaymentBranding.tsx', import.meta.url), 'utf8');
  assert.match(branding, /https:\/\/www\.bancaintesa\.rs/);
  assert.match(branding, /Prihvaćene kartice/);
  assert.match(branding, /Programi sigurnosti/);
  assert.doesNotMatch(branding, /MissingAsset|zvanični asset nedostaje/);
  for (const asset of ['visa.png', 'mastercard.png', 'visa-secure.png', 'mastercard-identity-check.svg']) {
    assert.match(branding, new RegExp(`/payment-brands/${asset.replace('.', '\\.')}\\b`));
  }
  assert.match(branding, /h-\[56px\] w-\[90px\]/);
  assert.match(branding, /h-14 w-\[120px\]/);
  assert.match(branding, /rs\.visa\.com\/pay-with-visa\/security-and-assistance\/protected-everywhere\.html/);
  assert.match(branding, /mastercard\.rs\/sr-rs\/korisnici\/pronadite-karticu\.html/);
  for (const path of ['../src/app/App.tsx', '../src/app/components/Checkout.tsx', '../src/app/components/CardPayment.tsx', '../src/app/components/CustomerPolicy.tsx']) {
    assert.match(readFileSync(new URL(path, import.meta.url), 'utf8'), /PaymentBranding/);
  }
});

test('checkout visibly declares canonical RSD and VAT terms before payment', () => {
  const checkout = readFileSync(new URL('../src/app/components/Checkout.tsx', import.meta.url), 'utf8');
  assert.match(checkout, /Sve cene su sa uračunatim PDV-om i nema dodatnih ili skrivenih troškova\./);
  assert.match(checkout, /naplaćuje isključivo u RSD/);
  assert.match(checkout, /Pročitao\/la sam i prihvatam/);
  assert.match(checkout, /disabled=\{!accepted \|\| !captchaToken/);
});

test('customer-facing EPM routes and card-network information links are wired', () => {
  const routes = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  for (const route of ['/kontakt', '/dostava', '/reklamacije', '/povracaj-sredstava', '/privatnost', '/bezbednost-placanja']) assert.match(routes, new RegExp(route));
  const policies = readFileSync(new URL('../src/app/components/CustomerPolicy.tsx', import.meta.url), 'utf8');
  assert.match(policies, /rs\.visa\.com\/pay-with-visa\/security-and-assistance\/protected-everywhere\.html/);
  assert.match(policies, /mastercard\.rs\/sr-rs\/korisnici\/pronadite-karticu\.html/);
  const customerSources = ['../src/app/App.tsx', '../src/app/components/Checkout.tsx', '../src/app/components/PurchaseTerms.tsx', '../src/app/components/BusinessInfo.tsx', '../src/app/components/CustomerPolicy.tsx']
    .map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
  assert.doesNotMatch(customerSources, /href=["']#["']/);
});

test('browser source and production bundle contain no NestPay server credential names', () => {
  const browserSources = ['../src/main.tsx', '../src/app/components/Checkout.tsx', '../src/app/components/CardPayment.tsx', '../src/lib/nestpay.ts']
    .map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
  assert.doesNotMatch(browserSources, /NESTPAY_STORE_KEY|NESTPAY_API_USERNAME|NESTPAY_API_PASSWORD|VITE_NESTPAY_STORE_KEY/);
});

test('success confirmation contains the mandatory customer, order, merchant and transaction categories', () => {
  const order = {
    orderId: 'PGN-2026-TEST', paymentStatus: 'PAID', customerName: 'Kupac Test', email: 'kupac@example.rs',
    street: 'Ulica 1', postalCode: '11000', city: 'Beograd', deliveryMethod: 'courier', deliveryFeeRsd: 3500,
    items: [{ product: 'glide', name: 'Pogon Glide', unitPriceRsd: 165000, quantity: 1, lineTotalRsd: 165000 }],
    subtotalRsd: 165000, totalRsd: 168500, authorizationCode: 'AVAILABLE', nestpayTransactionId: 'AVAILABLE',
    response: 'Approved', procReturnCode: '00', mdStatus: '1', transactionDate: '2026-08-20T12:00:00Z', attemptedAt: '2026-08-20T12:00:00Z',
  };
  const html = buildPaymentConfirmation(order, { legalName: 'Pogon Mobility d.o.o.', pib: '115472260', address: 'Temišvarska 25B, Beograd' }).html;
  for (const expected of ['kartice je zadužen', 'Kupac Test', 'kupac@example.rs', 'Ulica 1', 'Pogon Glide', 'Jedinična cena', 'Količina', 'Proizvodi sa PDV-om', 'PGN-2026-TEST', 'Pogon Mobility d.o.o.', '115472260', 'Autorizacioni kod', 'Broj transakcije', 'ProcReturnCode', 'mdStatus', 'EXTRA.TRXDATE']) assert.match(html, new RegExp(expected));
});

test('definite failure confirmation includes available data, marks absent transaction values, and excludes injected card fields', () => {
  const marker = 'DO_NOT_RENDER_SENSITIVE_VALUE';
  const order = {
    orderId: 'PGN-2026-DECLINED', paymentStatus: 'DECLINED', customerName: 'Kupac Test', email: 'kupac@example.rs',
    street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon Core', unitPriceRsd: 135000,
    quantity: 1, subtotalRsd: 135000, totalRsd: 138500, deliveryMethod: 'courier', deliveryFeeRsd: 3500,
    response: 'Declined', procReturnCode: '05', secretCardField: marker, securityCodeField: marker,
  };
  const html = buildPaymentConfirmation(order, { legalName: 'Pogon Mobility d.o.o.', pib: '115472260', address: 'Temišvarska 25B, Beograd' }).html;
  assert.match(html, /Plaćanje neuspešno/);
  assert.match(html, /Declined/);
  assert.match(html, /Nije dostupno/);
  assert.doesNotMatch(html, new RegExp(marker));
});

test('payment result is backend-driven and renders mandatory non-sensitive confirmation groups', () => {
  const result = readFileSync(new URL('../src/app/components/PaymentResult.tsx', import.meta.url), 'utf8');
  assert.match(result, /\/api\/orders\/status/);
  for (const expected of ['Podaci o porudžbini', 'Podaci o kupcu', 'Podaci o transakciji', 'Podaci o trgovcu', 'EXTRA.TRXDATE', 'ProcReturnCode', 'mdStatus']) assert.match(result, new RegExp(expected));
  assert.match(result, /Ne možemo još pouzdano da potvrdimo/);
});

test('order persistence schema contains required non-sensitive evidence and no card-data columns', () => {
  const schema = `${readFileSync(new URL('../supabase/orders.sql', import.meta.url), 'utf8')}\n${readFileSync(new URL('../supabase/orders_lifecycle.sql', import.meta.url), 'utf8')}`;
  for (const field of ['order_id', 'authorization_code', 'nestpay_transaction_id', 'response', 'proc_return_code', 'md_status', 'transaction_date', 'updated_at']) assert.match(schema, new RegExp(field));
  assert.doesNotMatch(schema, /\b(card_number|security_code|card_expiry)\b/i);
});

test('NestPay amount is sent in major RSD units without an undocumented para conversion', () => {
  const { fields } = create3DFormFields({
    orderId: 'PGN-2026-MAJORUNIT', amountRsd: 168_500, installmentCount: 1,
    okUrl: 'https://ridepogon.com/api/nestpay/callback', failUrl: 'https://ridepogon.com/api/nestpay/callback',
  }, testEnv);
  assert.equal(fields.amount, '168500');
  const xml = buildAuthorizationXml({ username: 'u', password: 'p', clientId: 'c', orderId: 'o', md: 'm', total: 168_500, installmentCount: 1 });
  assert.match(xml, /<Total>168500<\/Total>/);
  assert.doesNotMatch(xml, /16850000/);
});

test('declined customer confirmations never expose an explicit processor reason', () => {
  const marker = 'SYNTHETIC_PROCESSOR_REASON_SHOULD_NOT_RENDER';
  const html = buildPaymentConfirmation({
    orderId: 'PGN-2026-DECLINE', paymentStatus: 'DECLINED', customerName: 'Kupac Test', email: 'kupac@example.rs',
    street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon Core', unitPriceRsd: 135000,
    quantity: 1, subtotalRsd: 135000, totalRsd: 138500, deliveryMethod: 'courier', deliveryFeeRsd: 3500,
    response: 'Declined', procReturnCode: '05', errorMessage: marker, ErrMsg: marker,
  }, { legalName: 'Pogon Mobility d.o.o.', pib: '115472260', address: 'Temišvarska 25B, Beograd' }).html;
  assert.match(html, /Plaćanje neuspešno/);
  assert.doesNotMatch(html, new RegExp(marker));

  const statusApi = readFileSync(new URL('../api/orders/status.ts', import.meta.url), 'utf8');
  const resultPage = readFileSync(new URL('../src/app/components/PaymentResult.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(statusApi, /ErrMsg|errorMessage/);
  assert.doesNotMatch(resultPage, /ErrMsg|errorMessage|processor.*reason|decline.*reason/i);
});

test('RSD-only policies disclose possible issuer conversion for foreign-currency card accounts', () => {
  const terms = readFileSync(new URL('../src/app/components/PurchaseTerms.tsx', import.meta.url), 'utf8');
  const security = readFileSync(new URL('../src/app/components/CustomerPolicy.tsx', import.meta.url), 'utf8');
  for (const source of [terms, security]) {
    assert.match(source, /Sva plaćanja izvršavaju se.*RSD/s);
    assert.match(source, /kartica vezana za račun u drugoj valuti/);
    assert.match(source, /kursu, koji Pogonu nije\s+poznat/);
  }
});
