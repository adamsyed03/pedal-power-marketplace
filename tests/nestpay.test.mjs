import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotal, calculateOrderTotal } from '../api/_lib/catalog.mjs';
import { createOrderId } from '../api/_lib/order.mjs';
import {
  buildAuthorizationXml, buildOrderStatusXml, create3DFormFields, create3DRequestHash,
  escapeHashValue, generateRnd, getNestPayConfig, isAccepted3DStatus, isApprovedApiResponse,
  isNestPayTestConfigured, parseApiResponse, paymentStateFromApiResponse, verify3DResponseHash,
} from '../api/_lib/nestpay.mjs';
import {
  callbackAmountMatchesOrder, hasComplete3DAuthFields, stripSensitiveFields,
} from '../api/_lib/payment-flow.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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

test('ver2 response hash: escaped pipe-joined values plus store key accepted, tampering rejected', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', AuthCode: '123456', ProcReturnCode: '00', Response: 'Approved', mdStatus: '1', cavv: 'c', eci: '05', md: 'm|d', rnd: 'r'.repeat(20) };
  const names = ['clientid', 'oid', 'AuthCode', 'ProcReturnCode', 'Response', 'mdStatus', 'cavv', 'eci', 'md', 'rnd'];
  const joined = names.map((name) => escapeHashValue(values[name])).join('|');
  const hash = createHash('sha512').update(`${joined}|STOREKEY`, 'latin1').digest('base64');
  const params = { ...values, HASHPARAMS: names.join('|'), HASHPARAMSVAL: joined, HASH: hash };
  assert.equal(verify3DResponseHash(params, 'STOREKEY'), true);
  assert.equal(verify3DResponseHash({ ...params, HASHPARAMSVAL: `${joined}|` }, 'STOREKEY'), true);
  assert.equal(verify3DResponseHash({ ...params, oid: 'PGN-2' }, 'STOREKEY'), false);
  assert.equal(verify3DResponseHash({ ...params, HASH: `${hash}x` }, 'STOREKEY'), false);
});

test('response hash is rejected when mandatory clientid/oid/Response names are missing', () => {
  const joined = '1|2';
  const hash = createHash('sha512').update(`${joined}|k`, 'latin1').digest('base64');
  assert.equal(verify3DResponseHash({ HASHPARAMS: 'AuthCode|rnd', HASHPARAMSVAL: joined, HASH: hash, AuthCode: '1', rnd: '2' }, 'k'), false);
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
    return { ok: true, json: async () => ({ success: true }) };
  };
  assert.equal(await verifyCaptcha('long-enough-token', '127.0.0.1', { TURNSTILE_SECRET_KEY: 'secret' }, fakeFetch), true);
  assert.equal(await verifyCaptcha('short', '', { TURNSTILE_SECRET_KEY: 'secret' }, fakeFetch), false);
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
  assert.match(flow, /verify3DResponseHash/);
  assert.match(flow, /paymentStateFromApiResponse/);
  assert.match(flow, /UNKNOWN/);
});
