import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotal, calculateOrderTotal } from '../api/_lib/catalog.mjs';
import { applyPromotion, isSingleUsePromotion, normalizePromoCode, singleUsePromotionOrderId } from '../api/_lib/promotions.mjs';
import { createOrderId } from '../api/_lib/order.mjs';
import {
  buildOrderStatusXml, create3DFormFields, create3DRequestHash, inspect3DResponseHash,
  generateRnd, getNestPayApiCredentials, getNestPayConfig, isAccepted3DStatus, isNestPayConfigured,
  normalizeNestPayFormParams, parseApiResponse, verify3DResponseHash,
} from '../api/_lib/nestpay.mjs';
import {
  callbackAmountMatchesOrder, createCallbackDiagnostics, hostedPaymentState,
  hostedInstallmentCount, isStagingCallbackDiagnosticsEnabled, processNestPayReturn,
  stripSensitiveFields,
} from '../api/_lib/payment-flow.mjs';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { verifyCaptcha } from '../api/_lib/captcha.mjs';
import { buildPaymentConfirmation, sendTransactionalEmail, smtpTransportOptions } from '../api/_lib/email.mjs';
import { dispatchConfirmation } from '../api/_lib/confirmation.mjs';
import { mapOrderStatus } from '../api/_lib/reconcile.mjs';
import { createLookupToken, hashLookupToken, rateLimit } from '../api/_lib/security.mjs';
import { validateCheckout } from '../api/_lib/validation.mjs';
import { getPublicUrls } from '../api/_lib/urls.mjs';
import { offeredInstallments, resolveDeliveryFee } from '../api/_lib/delivery.mjs';
import { applyGamePrizeToDelivery, attachGamePrize, normalizeGamePrize } from '../api/_lib/game-prize.mjs';
import { availableMoves, chooseBotMove, createBotStyle, FRIENDLY_GAME_RATE, gameResult } from '../src/lib/ticTacToe.mjs';
import { insertOrder } from '../api/_lib/supabase.mjs';
import { listPaidOrders, verifyAdminAccessToken } from '../api/_lib/admin-orders.mjs';

const testEnv = {
  NESTPAY_ENV: 'test', NESTPAY_MERCHANT_ID: '13IN004634', NESTPAY_STORE_KEY: 'STOREKEY',
  APP_BASE_URL: 'https://test.ridepogon.com', VERCEL_ENV: 'preview',
};

const productionEnv = {
  NESTPAY_ENV: 'production', NESTPAY_MERCHANT_ID: '13IN004634', NESTPAY_STORE_KEY: 'STOREKEY',
  APP_BASE_URL: 'https://ridepogon.com', VERCEL_ENV: 'production',
};

test('server calculates authoritative product total and ignores browser price', () => {
  assert.deepEqual(calculateOrderTotal('core', 2).totalRsd, 260_000);
  assert.throws(() => calculateOrderTotal('core', 0), /INVALID_QUANTITY/);
  assert.throws(() => calculateOrderTotal('unknown', 1), /INVALID_PRODUCT/);
});

test('mixed-model totals are authoritative and quantities are not capped at five', () => {
  const cart = calculateCartTotal([{ product: 'glide', quantity: 7 }, { product: 'core', quantity: 2 }]);
  assert.equal(cart.totalQuantity, 9);
  assert.equal(cart.subtotalRsd, 1_415_000);
  assert.throws(() => calculateCartTotal([{ product: 'glide', quantity: 1 }, { product: 'glide', quantity: 2 }]), /DUPLICATE_PRODUCT/);
});

test('MILEBANJA sets each Cargo bike to 120,000 RSD without discounting other models', () => {
  const cart = calculateCartTotal([
    { product: 'cargo', quantity: 2 },
    { product: 'core', quantity: 1 },
  ]);
  const discounted = applyPromotion(cart, '  milebanja  ');
  assert.equal(discounted.promoCode, 'MILEBANJA');
  assert.equal(discounted.originalSubtotalRsd, 390_000);
  assert.equal(discounted.discountRsd, 20_000);
  assert.equal(discounted.subtotalRsd, 370_000);
  assert.deepEqual(discounted.items.find((item) => item.product === 'cargo'), {
    product: 'cargo', name: 'Pogon Cargo', quantity: 2,
    originalUnitPriceRsd: 130_000, unitPriceRsd: 120_000,
    lineTotalRsd: 240_000, discountRsd: 20_000, promoCode: 'MILEBANJA',
  });
  assert.equal(discounted.items.find((item) => item.product === 'core').unitPriceRsd, 130_000);
});

test('NBGD subtracts 5,000 RSD once from any order', () => {
  const cart = calculateCartTotal([
    { product: 'glide', quantity: 2 },
    { product: 'core', quantity: 1 },
  ]);
  const discounted = applyPromotion(cart, ' nbgd ');
  assert.equal(discounted.promoCode, 'NBGD');
  assert.equal(discounted.originalSubtotalRsd, 460_000);
  assert.equal(discounted.discountRsd, 5_000);
  assert.equal(discounted.subtotalRsd, 455_000);
  assert.equal(discounted.items.reduce((sum, item) => sum + item.lineTotalRsd, 0), 455_000);
  assert.equal(discounted.items[0].discountRsd, 5_000);
  assert.equal(discounted.items[0].promoCode, 'NBGD');
});

test('INSTAGRAM subtracts 5,000 RSD once from any order', () => {
  const cart = calculateCartTotal([
    { product: 'glide', quantity: 1 },
    { product: 'cargo', quantity: 1 },
  ]);
  const discounted = applyPromotion(cart, ' instagram ');
  assert.equal(discounted.promoCode, 'INSTAGRAM');
  assert.equal(discounted.originalSubtotalRsd, 295_000);
  assert.equal(discounted.discountRsd, 5_000);
  assert.equal(discounted.subtotalRsd, 290_000);
  assert.equal(discounted.items.reduce((sum, item) => sum + item.lineTotalRsd, 0), 290_000);
  assert.equal(discounted.items[0].discountRsd, 5_000);
  assert.equal(discounted.items[0].promoCode, 'INSTAGRAM');
});

test('promo codes are server-normalized and fail closed when invalid or inapplicable', () => {
  assert.equal(normalizePromoCode(' milebanja '), 'MILEBANJA');
  assert.equal(normalizePromoCode(' nbgd '), 'NBGD');
  assert.equal(normalizePromoCode(' instagram '), 'INSTAGRAM');
  assert.equal(normalizePromoCode(''), null);
  assert.throws(() => applyPromotion(calculateCartTotal([{ product: 'cargo', quantity: 1 }]), 'NOTREAL'), /INVALID_PROMO_CODE/);
  assert.throws(() => applyPromotion(calculateCartTotal([{ product: 'core', quantity: 1 }]), 'MILEBANJA'), /PROMO_NOT_APPLICABLE/);
  const regular = applyPromotion(calculateCartTotal([{ product: 'cargo', quantity: 1 }]), null);
  assert.equal(regular.subtotalRsd, 130_000);
  assert.equal(regular.discountRsd, 0);
});

test('single-use promo reservation IDs are stable per environment and isolated from production', () => {
  const first = singleUsePromotionOrderId('MILEBANJA', { NESTPAY_ENV: 'test' });
  const repeated = singleUsePromotionOrderId(' milebanja ', { NESTPAY_ENV: 'test' });
  const production = singleUsePromotionOrderId('MILEBANJA', { NESTPAY_ENV: 'production' });
  assert.match(first, /^PGN-2026-[A-F0-9]{16}$/);
  assert.equal(first, repeated);
  assert.notEqual(first, production);
  assert.equal(isSingleUsePromotion('MILEBANJA'), true);
  assert.equal(isSingleUsePromotion('NBGD'), false);
  assert.equal(isSingleUsePromotion('INSTAGRAM'), false);
  assert.throws(() => singleUsePromotionOrderId('NBGD', { NESTPAY_ENV: 'test' }), /INVALID_PROMO_CODE/);
  assert.throws(() => singleUsePromotionOrderId('NOTREAL', { NESTPAY_ENV: 'test' }), /INVALID_PROMO_CODE/);
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

test('hosted 3D form uses the exact merchant-specific field set and a matching hash', () => {
  const { gateUrl, fields } = create3DFormFields({
    orderId: 'PGN-2026-AB12', amountRsd: 138_500, installmentCount: 1,
    okUrl: 'https://test.ridepogon.com/api/nestpay/callback?rt=t', failUrl: 'https://test.ridepogon.com/api/nestpay/callback?rt=t',
  }, testEnv);
  assert.equal(gateUrl, 'https://bib.eway2pay.com/fim/est3Dgate');
  assert.equal(fields.storetype, '3d_pay_hosting');
  assert.equal(fields.trantype, 'Auth');
  assert.equal(fields.currency, '941');
  assert.equal(Object.hasOwn(fields, 'instalment'), false);
  assert.equal(Object.keys(fields).some((name) => name.toLowerCase() === 'callbackurl'), false);
  assert.equal(fields.amount, '138500.00');
  assert.equal(fields.hashAlgorithm, 'ver2');
  assert.equal(fields.lang, 'sr');
  assert.equal(fields.encoding, 'utf-8');
  assert.equal(fields.shopurl, 'https://test.ridepogon.com/checkout');
  assert.equal(fields.rnd.length, 20);
  assert.deepEqual(Object.keys(fields).sort(), [
    'amount', 'clientid', 'currency', 'encoding', 'failUrl', 'hash',
    'hashAlgorithm', 'lang', 'oid', 'okUrl', 'rnd', 'shopurl', 'storetype',
    'trantype',
  ]);
  assert.equal(fields.hash, create3DRequestHash({
    clientid: fields.clientid, oid: fields.oid, amount: fields.amount,
    okUrl: fields.okUrl, failUrl: fields.failUrl, tranType: fields.trantype,
    instalment: '', rnd: fields.rnd, currency: fields.currency,
  }, testEnv.NESTPAY_STORE_KEY));
});

test('hosted flow omits instalment and fails closed for unsupported multi-instalment orders', () => {
  const base = { orderId: 'o', amountRsd: 200_000, okUrl: 'https://test.ridepogon.com/api/nestpay/callback', failUrl: 'https://test.ridepogon.com/api/nestpay/callback' };
  assert.equal(Object.hasOwn(create3DFormFields({ ...base, installmentCount: 1 }, testEnv).fields, 'instalment'), false);
  assert.throws(() => create3DFormFields({ ...base, installmentCount: 3 }, testEnv), /HOSTED_INSTALLMENTS_UNSUPPORTED/);
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
  const joinedValues = escapedValues.join('|');
  const paramsval = `${joinedValues}${trailingPipe ? '|' : ''}`;
  const hashPrefix = `${joinedValues}|`;
  return {
    ...values,
    hashAlgorithm: 'ver2',
    HASHPARAMS: names.join('|'),
    HASHPARAMSVAL: paramsval,
    HASH: createHash('sha512').update(encodeIso88599(`${hashPrefix}${escape(storeKey)}`)).digest('base64'),
  };
};

test('official Ver2 response sample algorithm is accepted', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', AuthCode: '123456', Response: 'Approved', HostRefNum: 'ref', ProcReturnCode: '00', TransId: 'trx', ErrMsg: '', mdStatus: '1' };
  const names = ['clientid', 'oid', 'AuthCode', 'Response', 'HostRefNum', 'ProcReturnCode', 'TransId', 'ErrMsg', 'mdStatus'];
  const params = createResponseHashFixture({ names, values, storeKey: 'STOREKEY' });
  assert.equal(verify3DResponseHash(params, 'STOREKEY'), true);
});

test('hosted page installment selection is normalized only from valid callback values', () => {
  assert.equal(hostedInstallmentCount({ Instalment: '12' }), 12);
  assert.equal(hostedInstallmentCount({ installment: '3' }), 3);
  assert.equal(hostedInstallmentCount({ instalment: '' }), 1);
  assert.equal(hostedInstallmentCount({ instalment: '-' }), 1);
  assert.equal(hostedInstallmentCount({ instalment: '12', Installment: '12' }), 12);
  assert.equal(hostedInstallmentCount({ instalment: '12', Installment: '3' }), null);
  assert.equal(hostedInstallmentCount({ instalment: '0' }), null);
  assert.equal(hostedInstallmentCount({ instalment: '13' }), null);
  assert.equal(hostedInstallmentCount({ instalment: ' 3' }), null);
  assert.equal(hostedInstallmentCount({}), null);
});

test('callback amount binding accepts only the exact RSD integer or required two-decimal representation', () => {
  const order = { total_rsd: 138500 };
  assert.equal(callbackAmountMatchesOrder({ amount: '138500' }, order), true);
  assert.equal(callbackAmountMatchesOrder({ amount: '138500.00' }, order), true);
  assert.equal(callbackAmountMatchesOrder({ amount: '138500.0' }, order), false);
  assert.equal(callbackAmountMatchesOrder({ amount: '138500.01' }, order), false);
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

test('section 3.3.1 no-trailing HASHPARAMSVAL keeps one separator before StoreKey in hash plaintext', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', rnd: 'r'.repeat(20) };
  const storeKey = 'STOREKEY';
  const params = createResponseHashFixture({
    names: ['clientid', 'oid', 'rnd'], values, storeKey, trailingPipe: false,
  });
  const inspection = inspect3DResponseHash(params, storeKey);
  assert.equal(inspection.hashParamsValFormat, 'NO_TRAILING_PIPE');
  assert.equal(inspection.hashValid, true);
  const directAppendHash = createHash('sha512')
    .update(Buffer.from(`${params.HASHPARAMSVAL}${storeKey}`, 'latin1')).digest('base64');
  assert.equal(verify3DResponseHash({ ...params, HASH: directAppendHash }, storeKey), false);
});

test('Ver2 response accepts only strict form-decoder recovery of Base64 plus characters', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', rnd: 'r0' };
  const params = createResponseHashFixture({
    names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY',
  });
  assert.match(params.HASH, /\+/);

  const exact = inspect3DResponseHash(params, 'STOREKEY');
  assert.equal(exact.hashValid, true);
  assert.equal(exact.hashTransportNormalization, 'EXACT');
  assert.equal(exact.receivedHashHasPlus, true);
  assert.equal(exact.receivedHashHasSpace, false);

  const allSpaces = inspect3DResponseHash({ ...params, HASH: params.HASH.replaceAll('+', ' ') }, 'STOREKEY');
  assert.equal(allSpaces.hashValid, true);
  assert.equal(allSpaces.validationStage, 'VALID');
  assert.equal(allSpaces.hashTransportNormalization, 'FORM_PLUS_AS_SPACE');
  assert.equal(allSpaces.receivedHashHasPlus, false);
  assert.equal(allSpaces.receivedHashHasSpace, true);

  const mixed = inspect3DResponseHash({ ...params, HASH: params.HASH.replace('+', ' ') }, 'STOREKEY');
  assert.equal(mixed.hashValid, true);
  assert.equal(mixed.hashTransportNormalization, 'FORM_PLUS_AS_SPACE');
  assert.equal(mixed.receivedHashHasPlus, true);
  assert.equal(mixed.receivedHashHasSpace, true);
});

test('Ver2 response rejects malformed or non-canonical Base64 transport values', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', rnd: 'r0' };
  const params = createResponseHashFixture({
    names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY',
  });
  const firstNonPlus = [...params.HASH].findIndex((character, index) => index < 86 && character !== '+');
  const wrongSpace = `${params.HASH.slice(0, firstNonPlus)} ${params.HASH.slice(firstNonPlus + 1)}`;
  const canonicalTamper = `${params.HASH[0] === 'A' ? 'B' : 'A'}${params.HASH.slice(1)}`;
  assert.equal(inspect3DResponseHash({ ...params, HASH: wrongSpace }, 'STOREKEY').validationStage, 'HASH_MISMATCH');
  assert.equal(inspect3DResponseHash({ ...params, HASH: canonicalTamper }, 'STOREKEY').validationStage, 'HASH_MISMATCH');

  const malformed = [
    params.HASH.slice(1), `${params.HASH}A`, `${params.HASH.slice(0, -2)}=A`,
    `_${params.HASH.slice(1)}`, `-${params.HASH.slice(1)}`, `%${params.HASH.slice(1)}`,
    ` ${params.HASH}`, `${params.HASH} `, params.HASH.replace('+', '\t'),
    params.HASH.replace('+', '\r'), params.HASH.replace('+', '\n'),
    params.HASH.replace('+', '\u00a0'),
  ];
  for (const received of malformed) {
    const inspection = inspect3DResponseHash({ ...params, HASH: received }, 'STOREKEY');
    assert.equal(inspection.hashValid, false);
    assert.equal(inspection.validationStage, 'INVALID_HASH_ENCODING');
    assert.equal(inspection.hashTransportNormalization, null);
  }
});

test('Ver2 transport recovery never normalizes HASHPARAMSVAL or ambiguous HASH fields', () => {
  const values = { clientid: '13IN004634', oid: 'PGN-1', rnd: 'A+B' };
  const params = createResponseHashFixture({
    names: ['clientid', 'oid', 'rnd'], values, storeKey: 'STOREKEY',
  });
  const changedParamsval = inspect3DResponseHash({
    ...params, HASHPARAMSVAL: params.HASHPARAMSVAL.replace('+', ' '),
  }, 'STOREKEY');
  assert.equal(changedParamsval.hashValid, false);
  assert.equal(changedParamsval.validationStage, 'HASHPARAMSVAL_MISMATCH');

  const repeated = inspect3DResponseHash({ ...params, HASH: [params.HASH, params.HASH] }, 'STOREKEY');
  assert.equal(repeated.hashValid, true);
  const conflicting = inspect3DResponseHash({
    ...params, HASH: [params.HASH, `${params.HASH[0] === 'A' ? 'B' : 'A'}${params.HASH.slice(1)}`],
  }, 'STOREKEY');
  assert.equal(conflicting.hashValid, false);
  assert.equal(conflicting.validationStage, 'AMBIGUOUS_FORM_FIELD');
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
    receivedHashLength: params.HASH.length,
    calculatedHashLength: params.HASH.length,
    receivedHashHasPlus: params.HASH.includes('+'),
    receivedHashHasSpace: false,
    hashTransportNormalization: 'EXACT',
    hashValid: true,
    validationStage: 'VALID',
  });
  assert.equal(inspect3DResponseHash({ ...params, HASHPARAMSVAL: 'altered' }, 'STOREKEY').validationStage, 'HASHPARAMSVAL_MISMATCH');
  assert.equal(inspect3DResponseHash({ ...params, HASH: `${params.HASH}x` }, 'STOREKEY').validationStage, 'INVALID_HASH_ENCODING');
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

test('Order Status response parsing extracts safe result fields and rejects malformed XML', () => {
  const approved = parseApiResponse('<CC5Response><OrderId>o</OrderId><Response>Approved</Response><ProcReturnCode>00</ProcReturnCode><AuthCode>a</AuthCode><HostRefNum>h</HostRefNum><TransId>t</TransId><Extra><TRXDATE>20260819 10:00:00</TRXDATE></Extra></CC5Response>');
  assert.equal(approved.response, 'Approved');
  assert.equal(approved.procReturnCode, '00');
  assert.equal(approved.transactionDate, '20260819 10:00:00');
  assert.throws(() => parseApiResponse('bad'), /MALFORMED/);
});

test('Order Status query is separate from authorization', () => {
  const xml = buildOrderStatusXml({ username: 'u', password: 'p', clientId: 'c', orderId: 'o' });
  assert.match(xml, /<Extra><ORDERSTATUS>QUERY<\/ORDERSTATUS><\/Extra>/);
  assert.doesNotMatch(xml, /<Type>Auth<\/Type>|<Number>/);
});

test('test and production configurations select only their pinned endpoints', () => {
  const testConfig = getNestPayConfig(testEnv);
  const productionConfig = getNestPayConfig(productionEnv);
  assert.equal(testConfig.mode, 'test');
  assert.equal(testConfig.url3d, 'https://bib.eway2pay.com/fim/est3Dgate');
  assert.equal(testConfig.apiUrl, 'https://bib.eway2pay.com/fim/api');
  assert.equal(testConfig.appOrigin, 'https://test.ridepogon.com');
  assert.equal(productionConfig.mode, 'production');
  assert.equal(productionConfig.url3d, 'https://bib.eway2pay.com/fim/est3Dgate');
  assert.equal(productionConfig.apiUrl, 'https://bib.eway2pay.com/fim/api');
  assert.equal(productionConfig.appOrigin, 'https://ridepogon.com');
  assert.equal(isNestPayConfigured(testEnv), true);
  assert.equal(isNestPayConfigured(productionEnv), true);
});

test('test and production endpoint, domain and Vercel scopes cannot cross-contaminate', () => {
  assert.throws(() => getNestPayConfig({ ...productionEnv, NESTPAY_3D_URL: 'https://testsecurepay.eway2pay.com/fim/est3Dgate' }), /ENDPOINT_ENV_MISMATCH/);
  assert.throws(() => getNestPayConfig({ ...productionEnv, NESTPAY_API_URL: 'https://testsecurepay.eway2pay.com/fim/api' }), /ENDPOINT_ENV_MISMATCH/);
  assert.throws(() => getNestPayConfig({ ...testEnv, APP_BASE_URL: 'https://ridepogon.com' }), /APP_BASE_URL_MISMATCH/);
  assert.throws(() => getNestPayConfig({ ...productionEnv, APP_BASE_URL: 'https://test.ridepogon.com' }), /APP_BASE_URL_MISMATCH/);
  assert.throws(() => getNestPayConfig({ ...testEnv, VERCEL_ENV: 'production' }), /VERCEL_ENV_MISMATCH/);
  assert.throws(() => getNestPayConfig({ ...productionEnv, VERCEL_ENV: 'preview' }), /VERCEL_ENV_MISMATCH/);
  assert.throws(() => getNestPayConfig({ ...productionEnv, NESTPAY_ENV: 'prod' }), /NESTPAY_ENV_INVALID/);
  assert.equal(isNestPayConfigured({ ...productionEnv, NESTPAY_3D_URL: 'https://testsecurepay.eway2pay.com/fim/est3Dgate' }), false);
  const payment = { orderId: 'PGN-2026-ISOLATION', amountRsd: 100, installmentCount: 1 };
  assert.throws(() => create3DFormFields({
    ...payment,
    okUrl: 'https://test.ridepogon.com/api/nestpay/callback',
    failUrl: 'https://test.ridepogon.com/api/nestpay/callback',
  }, productionEnv), /RETURN_URL_MISMATCH/);
  assert.throws(() => create3DFormFields({
    ...payment,
    okUrl: 'https://ridepogon.com/api/nestpay/callback',
    failUrl: 'https://ridepogon.com/api/nestpay/callback',
  }, testEnv), /RETURN_URL_MISMATCH/);
});

test('production Hosted Sale requires merchant and StoreKey but not API credentials', () => {
  assert.throws(() => getNestPayConfig({ ...productionEnv, NESTPAY_MERCHANT_ID: '' }), /MISSING_NESTPAY_MERCHANT_ID/);
  assert.throws(() => getNestPayConfig({ ...productionEnv, NESTPAY_STORE_KEY: '' }), /MISSING_NESTPAY_STORE_KEY/);
  const { gateUrl, fields } = create3DFormFields({
    orderId: 'PGN-2026-PRODUCTION', amountRsd: 138_500, installmentCount: 1,
    okUrl: 'https://ridepogon.com/api/nestpay/callback?rt=opaque',
    failUrl: 'https://ridepogon.com/api/nestpay/callback?rt=opaque',
  }, productionEnv);
  assert.equal(gateUrl, 'https://bib.eway2pay.com/fim/est3Dgate');
  assert.equal(fields.okUrl, 'https://ridepogon.com/api/nestpay/callback?rt=opaque');
  assert.equal(fields.failUrl, 'https://ridepogon.com/api/nestpay/callback?rt=opaque');
  assert.equal(fields.storetype, '3d_pay_hosting');
  assert.equal(fields.trantype, 'Auth');
  assert.equal(Object.hasOwn(fields, 'instalment'), false);
  assert.doesNotThrow(() => getNestPayConfig(productionEnv));
  assert.throws(() => getNestPayApiCredentials(productionEnv), /API_CREDENTIALS_REQUIRED/);
});

test('API credentials are isolated to secondary Order Status configuration', () => {
  assert.deepEqual(
    getNestPayApiCredentials({ NESTPAY_API_USERNAME: 'secondary-user', NESTPAY_API_PASSWORD: 'secondary-password' }),
    { username: 'secondary-user', password: 'secondary-password' },
  );
  assert.throws(() => getNestPayApiCredentials({ NESTPAY_API_USERNAME: 'secondary-user' }), /API_CREDENTIALS_REQUIRED/);
  const cardPage = readFileSync(new URL('../src/app/components/CardPayment.tsx', import.meta.url), 'utf8');
  const paymentFlow = readFileSync(new URL('../api/_lib/payment-flow.mjs', import.meta.url), 'utf8');
  const prepareStart = paymentFlow.indexOf('export async function prepare3DPayment');
  const prepareEnd = paymentFlow.indexOf('const finalize', prepareStart);
  const prepareSource = paymentFlow.slice(prepareStart, prepareEnd);
  assert.match(cardPage, /gateForm\.action = prepared\.gateUrl/);
  assert.doesNotMatch(cardPage, /NESTPAY_API|\/fim\/api|API_USERNAME|API_PASSWORD/);
  assert.doesNotMatch(prepareSource, /fetch\(|fetchImpl|config\.apiUrl|NESTPAY_API_USERNAME|NESTPAY_API_PASSWORD/);
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

test('confirmation claims charged status only for verified PAID and not-charged only for final failures', () => {
  const base = { orderId: 'o', customerName: 'Kupac', email: 'a@b.rs', street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon', unitPriceRsd: 1, quantity: 1, totalRsd: 1 };
  const merchant = { legalName: 'POGON MOBILITY DOO', pib: 'x', address: 'a' };
  assert.match(buildPaymentConfirmation({ ...base, paymentStatus: 'PAID' }, merchant).html, /kartice je zadužen/);
  assert.match(buildPaymentConfirmation({ ...base, paymentStatus: 'DECLINED' }, merchant).html, /nije zadužen/);
  assert.match(buildPaymentConfirmation({ ...base, paymentStatus: 'FAILED' }, merchant).html, /nije zadužen/);
  assert.throws(() => buildPaymentConfirmation({ ...base, paymentStatus: 'UNKNOWN' }, merchant), /EMAIL_REQUIRES_FINAL_PAYMENT_STATUS/);
});

test('payment confirmation separates VAT-inclusive products from delivery', () => {
  const base = { orderId: 'o', paymentStatus: 'PAID', customerName: 'Kupac', email: 'a@b.rs', street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon', unitPriceRsd: 100, quantity: 1, totalRsd: 100 };
  const merchant = { legalName: 'POGON MOBILITY DOO', pib: 'x', address: 'a' };
  const courier = buildPaymentConfirmation({ ...base, deliveryMethod: 'courier', deliveryFeeRsd: null }, merchant).html;
  assert.match(courier, /Ukupan iznos proizvoda sa PDV-om/);
  assert.match(courier, /Adresa isporuke/);
  const pickup = buildPaymentConfirmation({ ...base, deliveryMethod: 'pickup', deliveryFeeRsd: 0 }, merchant).html;
  assert.match(pickup, /Save Maskovica 3/);
});

test('Gmail SMTP transport uses only server configuration and sends text plus HTML', async () => {
  const env = {
    SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '465', SMTP_SECURE: 'true',
    SMTP_USER: 'sender@example.test', SMTP_PASS: 'app-password',
    EMAIL_FROM: 'Pogon <sender@example.test>',
  };
  assert.deepEqual(smtpTransportOptions(env), {
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: 'sender@example.test', pass: 'app-password' },
  });
  let sent;
  let closed = false;
  const nodemailerImpl = { createTransport: () => ({
    sendMail: async (message) => { sent = message; return { accepted: [message.to] }; },
    close: () => { closed = true; },
  }) };
  await sendTransactionalEmail({ to: 'customer@example.test', subject: 'Subject', text: 'Text', html: '<p>HTML</p>' }, env, nodemailerImpl);
  assert.deepEqual(sent, {
    from: env.EMAIL_FROM, to: 'customer@example.test', subject: 'Subject', text: 'Text', html: '<p>HTML</p>',
  });
  assert.equal(closed, true);
  const source = readFileSync(new URL('../api/_lib/email.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /RESEND|api\.resend\.com/i);
  assert.doesNotMatch(source, /console\.(?:log|error)/);
});

test('payment confirmation dispatch is atomically idempotent across concurrent replays', async () => {
  const order = {
    order_id: 'PGN-2026-IDEMPOTENT', payment_status: 'PAID', customer_name: 'Kupac', email: 'customer@example.test',
    street: 'Ulica 1', postal_code: '11000', city: 'Beograd', delivery_method: 'courier', product: 'core',
    unit_price_rsd: 135000, quantity: 1, subtotal_rsd: 135000, delivery_fee_rsd: 3500, total_rsd: 138500,
    order_items: [{ name: 'Pogon Core', unitPriceRsd: 135000, quantity: 1, lineTotalRsd: 135000 }],
    response: 'Approved', proc_return_code: '00', md_status: '1', transaction_date: '2026-08-20T12:00:00Z',
  };
  let available = true;
  let sends = 0;
  let completes = 0;
  const dependencies = {
    claim: async () => {
      if (!available) return null;
      available = false;
      return { order: { ...order, confirmation_email_attempts: 1 }, claimToken: 'claim-token' };
    },
    send: async () => { sends += 1; },
    complete: async () => { completes += 1; return { ...order, confirmation_email_sent_at: new Date().toISOString() }; },
    release: async () => { throw new Error('release must not run after delivery'); },
  };
  const results = await Promise.all([
    dispatchConfirmation(order, {}, dependencies),
    dispatchConfirmation(order, {}, dependencies),
  ]);
  assert.deepEqual(results.sort(), [false, true]);
  assert.equal(sends, 1);
  assert.equal(completes, 1);
});

test('SMTP failure releases only the email claim and never changes payment status', async () => {
  const order = {
    order_id: 'PGN-2026-EMAILFAIL', payment_status: 'DECLINED', customer_name: 'Kupac', email: 'customer@example.test',
    street: 'Ulica 1', postal_code: '11000', city: 'Beograd', delivery_method: 'courier', product: 'core',
    unit_price_rsd: 135000, quantity: 1, subtotal_rsd: 135000, delivery_fee_rsd: 3500, total_rsd: 138500,
    response: 'Declined', proc_return_code: '05', md_status: '1',
  };
  let released = false;
  const dependencies = {
    claim: async () => ({ order, claimToken: 'claim-token' }),
    send: async () => { throw new Error('synthetic SMTP failure'); },
    complete: async () => { throw new Error('complete must not run'); },
    release: async (orderId, claimToken) => {
      assert.equal(orderId, order.order_id);
      assert.equal(claimToken, 'claim-token');
      released = true;
      return order;
    },
  };
  await assert.rejects(() => dispatchConfirmation(order, {}, dependencies), /PAYMENT_CONFIRMATION_EMAIL_FAILED/);
  assert.equal(released, true);
  assert.equal(order.payment_status, 'DECLINED');
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

test('completed-order admin access verifies the existing admin and returns only PAID fulfillment fields', async () => {
  const env = { SUPABASE_URL: 'https://database.invalid', SUPABASE_SERVICE_ROLE_KEY: 'server-only' };
  let authRequest;
  assert.equal(await verifyAdminAccessToken('a'.repeat(40), env, async (url, init) => {
    authRequest = { url, init };
    return { ok: true, json: async () => ({ email: 'PogonMobility@gmail.com' }) };
  }), true);
  assert.match(authRequest.url, /\/auth\/v1\/user$/);
  assert.equal(authRequest.init.headers.Authorization, `Bearer ${'a'.repeat(40)}`);
  assert.equal(await verifyAdminAccessToken('b'.repeat(40), env, async () => ({ ok: true, json: async () => ({ email: 'visitor@example.com' }) })), false);

  let ordersRequest;
  const rows = await listPaidOrders(env, async (url, init) => {
    ordersRequest = { url, init };
    return { ok: true, status: 200, json: async () => [{ order_id: 'PGN-2026-PAID', payment_status: 'PAID', order_items: [{ gamePrizeLabel: 'Kaciga' }] }] };
  });
  assert.equal(rows[0].order_items[0].gamePrizeLabel, 'Kaciga');
  assert.match(ordersRequest.url, /payment_status=eq\.PAID/);
  assert.match(ordersRequest.url, /order_items/);
  assert.match(ordersRequest.url, /limit=200/);
  assert.doesNotMatch(ordersRequest.url, /lookup_token_hash|idempotency_key|confirmation_email_claim/);
});

test('hosted checkout validation accepts only an ordinary one-payment order', () => {
  const base = { product: 'glide', quantity: 1, installmentCount: 1, captchaToken: 'a'.repeat(20), termsAccepted: true, deliveryMethod: 'courier', customer: { firstName: 'A', lastName: 'B', email: 'a@b.rs', phone: '12345678', street: 'Ulica 1', city: 'Beograd', postalCode: '11000' } };
  assert.equal(validateCheckout(base).installmentCount, 1);
  assert.equal(validateCheckout({ ...base, promoCode: ' MILEBANJA ' }).promoCode, 'MILEBANJA');
  assert.throws(() => validateCheckout({ ...base, installmentCount: 3 }), /INVALID_CHECKOUT/);
  assert.throws(() => validateCheckout({ ...base, installmentCount: 2 }), /INVALID_CHECKOUT/);
  assert.throws(() => validateCheckout({ ...base, promoCode: 'x'.repeat(41) }), /INVALID_CHECKOUT/);
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
  assert.equal(getPublicUrls({ APP_BASE_URL: 'https://test.ridepogon.com/' }).callbackUrl, 'https://test.ridepogon.com/api/nestpay/callback');
  assert.throws(() => getPublicUrls({ APP_BASE_URL: 'http://ridepogon.com' }), /HTTPS/);
});

test('delivery fee is authoritative and unresolved courier has no payable fee', () => {
  assert.deepEqual(resolveDeliveryFee('pickup', {}), { exact: true, feeRsd: 0, source: 'pickup' });
  assert.deepEqual(resolveDeliveryFee('courier', {}), { exact: true, feeRsd: 3900, source: 'fixed_server_config' });
  assert.deepEqual(resolveDeliveryFee('courier', { COURIER_FIXED_FEE_RSD: '3300' }), { exact: true, feeRsd: 3300, source: 'fixed_server_config' });
  assert.throws(() => resolveDeliveryFee('courier', { COURIER_FIXED_FEE_RSD: '33.5' }), /INVALID/);
});

test('hosted checkout offers only ordinary one-payment orders', () => {
  assert.deepEqual(offeredInstallments({ NESTPAY_INSTALLMENTS: '1,3,6,12' }), [1]);
});

test('card data echoed in a gateway response is stripped before processing or storage', () => {
  const clean = stripSensitiveFields({
    oid: 'PGN-1', Response: 'Approved', MaskedPan: '484187***2912',
    pan: '1111', cv2: '999', Ecom_Payment_Card_ExpDate_Year: '2026', Ecom_Payment_Card_ExpDate_Month: '12',
  });
  assert.deepEqual(Object.keys(clean).sort(), ['MaskedPan', 'Response', 'oid']);
});

test('hosted callback amount is validated before final payment processing', () => {
  const order = { total_rsd: 138_500 };
  assert.equal(callbackAmountMatchesOrder({ amount: '138500' }, order), true);
  assert.equal(callbackAmountMatchesOrder({ amount: '1' }, order), false);
  assert.equal(callbackAmountMatchesOrder({}, order), true);
});

test('official test PAN literals are isolated from production source', () => {
  const productionSources = [
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

test('hosted payment redirects with transaction fields while card data stays exclusively on the bank page', () => {
  const prepare = readFileSync(new URL('../api/nestpay/prepare.ts', import.meta.url), 'utf8');
  const callback = readFileSync(new URL('../api/nestpay/callback.ts', import.meta.url), 'utf8');
  const flow = readFileSync(new URL('../api/_lib/payment-flow.mjs', import.meta.url), 'utf8');
  const cardPage = readFileSync(new URL('../src/app/components/CardPayment.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(prepare, /\bpan\b|cv2|ExpDate/);
  assert.match(cardPage, /Object\.entries\(prepared\.fields\)/);
  assert.match(cardPage, /gateForm\.action = prepared\.gateUrl/);
  for (const field of ['pan', 'cv2', 'Ecom_Payment_Card_ExpDate_Month', 'Ecom_Payment_Card_ExpDate_Year', 'cardType']) {
    assert.doesNotMatch(cardPage, new RegExp(`['\"]${field}['\"]`));
  }
  assert.doesNotMatch(cardPage, /cc-number|cc-csc|Broj kartice|CVC\/CVV/);
  assert.match(cardPage, /Podatke platne kartice unosite isključivo na stranici banke/);
  assert.match(cardPage, /JSON\.stringify\(\{ orderId, token \}\)/);
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
  assert.match(flow, /params\?\.Response === 'Approved'.*params\?\.ProcReturnCode === '00'/s);
  assert.match(flow, /params\?\.Response === 'Declined'.*params\?\.Response === 'Error'/s);
  assert.doesNotMatch(flow, /buildAuthorizationXml|PayerAuthenticationCode|NESTPAY_API_HTTP/);
  assert.match(flow, /UNKNOWN/);
});

test('hosted callback is final and fail-closed without a second API Auth', () => {
  assert.equal(hostedPaymentState({ mdStatus: '1', Response: 'Approved', ProcReturnCode: '00' }), 'PAID');
  assert.equal(hostedPaymentState({ mdStatus: '7', Response: 'Approved', ProcReturnCode: '00' }), 'DECLINED');
  assert.equal(hostedPaymentState({ mdStatus: '1', Response: 'Declined', ProcReturnCode: '05' }), 'DECLINED');
  assert.equal(hostedPaymentState({ mdStatus: '1', Response: 'Error', ProcReturnCode: '99' }), 'DECLINED');
  assert.equal(hostedPaymentState({ mdStatus: '1', Response: 'Approved', ProcReturnCode: '99' }), 'UNKNOWN');
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
  assert.equal(diagnostics.FIELD_PRESENCE.instalment, false);
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
  const diagnosticEnv = { ...testEnv, NESTPAY_STORE_KEY: ' "secret#value"\n' };
  const result = await processNestPayReturn(raw, diagnosticEnv, async () => {
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
  assert.equal(diagnostics.RECEIVED_HASH_LENGTH, raw.HASH.length);
  assert.equal(diagnostics.CALCULATED_HASH_LENGTH, null);
  assert.equal(diagnostics.RECEIVED_HASH_HAS_PLUS, false);
  assert.equal(diagnostics.RECEIVED_HASH_HAS_SPACE, false);
  assert.equal(diagnostics.HASH_TRANSPORT_NORMALIZATION, null);
  assert.equal(diagnostics.STOREKEY_STATUS, 'SET');
  assert.equal(diagnostics.STOREKEY_LENGTH, diagnosticEnv.NESTPAY_STORE_KEY.length);
  assert.equal(diagnostics.STOREKEY_HAS_HASH_CHARACTER, true);
  assert.equal(diagnostics.STOREKEY_HAS_LEADING_WHITESPACE, true);
  assert.equal(diagnostics.STOREKEY_HAS_TRAILING_WHITESPACE, true);
  assert.equal(diagnostics.STOREKEY_HAS_NEWLINE, true);
  assert.equal(diagnostics.STOREKEY_HAS_LITERAL_QUOTES, false);
  const serialized = JSON.stringify(diagnostics);
  for (const forbidden of ['sensitive-expiry', 'sensitive-paramsval', 'sensitive-hash', 'secret#value']) {
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

test('EPM payment branding uses the complete official Banca Intesa artwork set', () => {
  for (const asset of [
    'bib-banca-intesa.png', 'bib-maestro.png', 'bib-mastercard.png',
    'bib-dinacard.png', 'bib-visa.png', 'bib-amex.png',
    'bib-mastercard-id-check.png', 'bib-visa-secure.png',
    'bib-amex-safekey.png', 'bib-dinacard-secure.png',
  ]) assert.equal(existsSync(new URL(`../public/payment-brands/${asset}`, import.meta.url)), true);
  const branding = readFileSync(new URL('../src/app/components/PaymentBranding.tsx', import.meta.url), 'utf8');
  assert.match(branding, /https:\/\/www\.bancaintesa\.rs/);
  assert.match(branding, /Prihvaćene kartice/);
  assert.match(branding, /Programi sigurnosti/);
  assert.doesNotMatch(branding, /MissingAsset|zvanični asset nedostaje/);
  for (const asset of [
    'bib-mastercard.png', 'bib-maestro.png', 'bib-visa.png', 'bib-amex.png', 'bib-dinacard.png',
    'bib-visa-secure.png', 'bib-mastercard-id-check.png', 'bib-amex-safekey.png', 'bib-dinacard-secure.png',
  ]) {
    assert.match(branding, new RegExp(`/payment-brands/${asset.replace('.', '\\.')}\\b`));
  }
  assert.match(branding, /h-\[42px\] w-\[66px\]/);
  assert.match(branding, /h-\[52px\] w-\[110px\]/);
  assert.match(branding, /h-\[32px\] w-\[50px\]/);
  assert.match(branding, /h-\[40px\] w-\[60px\]/);
  assert.match(branding, /gap-8/);
  assert.match(branding, /gap-2/);
  assert.doesNotMatch(branding, /xl:flex-row|flex-wrap/);
  assert.doesNotMatch(branding, /rounded-lg border border-black\/10 bg-white p-2 shadow-sm/);
  assert.match(branding, /rs\.visa\.com\/pay-with-visa\/security-and-assistance\/protected-everywhere\.html/);
  assert.match(branding, /mastercard\.rs\/sr-rs\/korisnici\/pronadite-karticu\.html/);
  for (const path of ['../src/app/App.tsx', '../src/app/components/Checkout.tsx', '../src/app/components/CustomerPolicy.tsx']) {
    assert.match(readFileSync(new URL(path, import.meta.url), 'utf8'), /PaymentBranding/);
  }
});

test('initial HTML keeps SEO content without flashing unstyled fallback copy', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const root = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<noscript>/)?.[1] ?? '';
  assert.match(html, /<html lang="sr-Latn">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/ridepogon\.com\/"/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(root, /class="app-shell"/);
  assert.doesNotMatch(root, /<h1>|Pogon električni bicikli/);
  assert.match(html, /<noscript>[\s\S]*<h1>Pogon električni bicikli<\/h1>/);
});

test('customer-facing model order is Cargo, Core, Glide', () => {
  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /modelDisplayPosition[\s\S]*cargo:\s*0,[\s\S]*core:\s*1,[\s\S]*glide:\s*2/);

  const products = readFileSync(new URL('../src/lib/products.ts', import.meta.url), 'utf8');
  assert.ok(products.indexOf('Pogon Cargo') < products.indexOf('Pogon Core'));
  assert.ok(products.indexOf('Pogon Core') < products.indexOf('Pogon Glide'));

  for (const path of ['../public/elektricni-bicikli/index.html', '../index.html']) {
    const html = readFileSync(new URL(path, import.meta.url), 'utf8');
    const source = html.slice(html.indexOf('itemListElement'));
    const cargo = source.indexOf('Pogon Cargo');
    const core = source.indexOf('Pogon Core');
    const glide = source.indexOf('Pogon Glide');
    assert.ok(cargo >= 0 && cargo < core && core < glide, `${path} must order Cargo, Core, Glide`);
  }
});

test('contact widget reopens reliably and landing specifications stay current', () => {
  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const overlay = readFileSync(new URL('../src/app/components/Overlay.tsx', import.meta.url), 'utf8');

  assert.match(app, /openContactWidget = useCallback\(\(\) => setIsContactWidgetOpen\(true\)/);
  assert.match(app, /closeContactWidget = useCallback\(\(\) => setIsContactWidgetOpen\(false\)/);
  assert.match(app, /onClick=\{openContactWidget\}/);
  assert.doesNotMatch(app, /setIsContactWidgetOpen\(\(current\) => !current\)/);
  for (const capacity of ['Nosivost 120 kg', '120 kg load capacity', 'Грузоподъёмность 120 кг']) {
    assert.match(app, new RegExp(capacity));
  }
  assert.match(app, />140<span[^>]*>km<\/span>/);
  assert.match(overlay, /\['140km', copy\.range\]/);
});

test('checkout visibly declares canonical RSD and VAT terms before payment', () => {
  const checkout = readFileSync(new URL('../src/app/components/Checkout.tsx', import.meta.url), 'utf8');
  assert.match(checkout, /Sve cene su sa uračunatim PDV-om i nema dodatnih ili skrivenih troškova\./);
  assert.match(checkout, /naplaćuje isključivo u RSD/);
  assert.match(checkout, /Pročitao\/la sam i prihvatam/);
  assert.match(checkout, /disabled=\{!accepted \|\| !captchaToken/);
  assert.doesNotMatch(checkout, /Jednokratno plaćanje/);
  assert.match(checkout, /Plaćanje do 12 rata/);
  assert.match(checkout, /Izbor broja rata prikazuje se na stranici banke nakon unosa kartice/);
  assert.match(checkout, /samo karticama koje je izdala Banca Intesa/);
  assert.match(checkout, /Konačan iznos za plaćanje na rate može biti približno 10% viši/);
  assert.match(checkout, /formatRsd\(3900\)/);
  const money = readFileSync(new URL('../src/lib/products.ts', import.meta.url), 'utf8');
  assert.match(money, /minimumFractionDigits:\s*2/);
  assert.match(money, /maximumFractionDigits:\s*2/);
});

test('checkout order summary uses the light bank-branding surface', () => {
  const checkout = readFileSync(new URL('../src/app/components/Checkout.tsx', import.meta.url), 'utf8');
  assert.match(checkout, /<aside className="[^"]*bg-white text-\[#171713\]/);
  assert.match(checkout, /<PaymentBranding compact \/>/);
  assert.doesNotMatch(checkout, /<PaymentBranding dark compact \/>/);
});

test('purchase terms contain Marina inspection items 2.1.1, 2.1.4 and the supplied 2.1.8 statement', () => {
  const terms = readFileSync(new URL('../src/app/components/PurchaseTerms.tsx', import.meta.url), 'utf8');
  for (const expected of [
    'POGON MOBILITY DOO', 'Temišvarska 25B, Beograd', 'Nespecijalizovana trgovina na veliko (4690)',
    '22162721', '115472260', 'ridepogon.com', '+381 69 69 2345', 'pogonmobility@gmail.com',
    'Kontakt podaci — korisnički servis', 'Zaštita poverljivih podataka o transakciji',
    'poverljive informacija se prenose putem javne mreže u zaštićenoj (kriptovanoj) formi',
    'kompletni proces naplate obavlja na stranicama banke',
    'Niti jednog trenutka podaci o platnoj kartici nisu dostupni našem sistemu',
  ]) assert.match(terms, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(terms, /Konačan iznos za\s+plaćanje na rate može biti približno 10% viši/);
  assert.match(terms, /3\.900,00 RSD/);
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
  const browserSources = ['../src/main.tsx', '../src/app/components/Checkout.tsx', '../src/app/components/CardPayment.tsx']
    .map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
  assert.doesNotMatch(browserSources, /NESTPAY_STORE_KEY|NESTPAY_API_USERNAME|NESTPAY_API_PASSWORD|VITE_NESTPAY_STORE_KEY|SMTP_PASS/);
});

test('success confirmation contains the mandatory customer, order, merchant and transaction categories', () => {
  const order = {
    orderId: 'PGN-2026-TEST', paymentStatus: 'PAID', customerName: 'Kupac Test', email: 'kupac@example.rs',
    street: 'Ulica 1', postalCode: '11000', city: 'Beograd', deliveryMethod: 'courier', deliveryFeeRsd: 3500,
    items: [{ product: 'glide', name: 'Pogon Glide', unitPriceRsd: 165000, quantity: 1, lineTotalRsd: 165000 }],
    subtotalRsd: 165000, totalRsd: 168500, authorizationCode: 'AVAILABLE', nestpayTransactionId: 'AVAILABLE',
    response: 'Approved', procReturnCode: '00', mdStatus: '1', installmentCount: 12,
    transactionDate: '2026-08-20T12:00:00Z', attemptedAt: '2026-08-20T12:00:00Z',
  };
  const html = buildPaymentConfirmation(order, { legalName: 'POGON MOBILITY DOO', pib: '115472260', address: 'Temišvarska 25B, Beograd' }).html;
  for (const expected of ['kartice je zadužen', 'Kupac Test', 'kupac@example.rs', 'Ulica 1', 'Pogon Glide', 'Jedinična cena', 'Količina', 'Ukupan iznos proizvoda sa PDV-om', 'Broj rata', '12', '168\.500,00 RSD', 'PGN-2026-TEST', 'POGON MOBILITY DOO', '115472260', 'Temišvarska 25B', 'Autorizacioni kod', 'Broj transakcije', 'ProcReturnCode', 'mdStatus', 'EXTRA.TRXDATE', 'Datum i vreme transakcije']) assert.match(html, new RegExp(expected));
});

test('definite failure confirmation includes available data, marks absent transaction values, and excludes injected card fields', () => {
  const marker = 'DO_NOT_RENDER_SENSITIVE_VALUE';
  const order = {
    orderId: 'PGN-2026-DECLINED', paymentStatus: 'DECLINED', customerName: 'Kupac Test', email: 'kupac@example.rs',
    street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon Core', unitPriceRsd: 135000,
    quantity: 1, subtotalRsd: 135000, totalRsd: 138500, deliveryMethod: 'courier', deliveryFeeRsd: 3500,
    response: 'Declined', procReturnCode: '05', secretCardField: marker, securityCodeField: marker,
  };
  const html = buildPaymentConfirmation(order, { legalName: 'POGON MOBILITY DOO', pib: '115472260', address: 'Temišvarska 25B, Beograd' }).html;
  assert.match(html, /Plaćanje neuspešno/);
  assert.match(html, /Declined/);
  assert.match(html, />-</);
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
  for (const field of ['order_id', 'authorization_code', 'nestpay_transaction_id', 'response', 'proc_return_code', 'md_status', 'transaction_date', 'updated_at', 'confirmation_email_claim_token', 'confirmation_email_claimed_at', 'confirmation_email_attempts']) assert.match(schema, new RegExp(field));
  assert.doesNotMatch(schema, /\b(card_number|security_code|card_expiry)\b/i);
});

test('NestPay amount is sent in major RSD units without an undocumented para conversion', () => {
  const { fields } = create3DFormFields({
    orderId: 'PGN-2026-MAJORUNIT', amountRsd: 168_500, installmentCount: 1,
    okUrl: 'https://test.ridepogon.com/api/nestpay/callback', failUrl: 'https://test.ridepogon.com/api/nestpay/callback',
  }, testEnv);
  assert.equal(fields.amount, '168500.00');
  assert.notEqual(fields.amount, '16850000');
});

test('declined customer confirmations never expose an explicit processor reason', () => {
  const marker = 'SYNTHETIC_PROCESSOR_REASON_SHOULD_NOT_RENDER';
  const html = buildPaymentConfirmation({
    orderId: 'PGN-2026-DECLINE', paymentStatus: 'DECLINED', customerName: 'Kupac Test', email: 'kupac@example.rs',
    street: 'Ulica 1', postalCode: '11000', city: 'Beograd', productName: 'Pogon Core', unitPriceRsd: 135000,
    quantity: 1, subtotalRsd: 135000, totalRsd: 138500, deliveryMethod: 'courier', deliveryFeeRsd: 3500,
    response: 'Declined', procReturnCode: '05', errorMessage: marker, ErrMsg: marker,
  }, { legalName: 'POGON MOBILITY DOO', pib: '115472260', address: 'Temišvarska 25B, Beograd' }).html;
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

test('floating model shortcut appears during long-page scrolling and targets the model cards', () => {
  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /showModelsShortcut/);
  assert.match(app, /models_shortcut_click/);
  assert.match(app, /document\.getElementById\('modeli'\)/);
  assert.match(app, /sr: 'Vidi modele', en: 'View models'/);
  assert.match(app, /window\.scrollTo\(\{ top: targetTop, behavior: 'smooth' \}\)/);
  assert.match(app, /isGameLauncherCompact/);
  assert.match(app, /window\.scrollY > 96/);
  assert.match(app, /Osvoji poklon/);
  assert.match(app, /bg-\[#7fff00\] text-black/);
});

test('initial page load defers analytics packages and heavy hero frame preloading', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const analytics = readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8');
  const scrolly = readFileSync(new URL('../src/app/components/ScrollyCanvas.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(analytics, /^import posthog from 'posthog-js'/m);
  assert.match(analytics, /await import\('posthog-js'\)/);
  assert.match(html, /window\.addEventListener\('load'[\s\S]*googletagmanager\.com\/gtag\/js/);
  assert.match(html, /window\.addEventListener\('load'[\s\S]*connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(scrolly, /constrainedConnection/);
  assert.match(scrolly, /3500/);
  assert.doesNotMatch(scrolly, /fallbackSrc = publicAsset\('Excellent4\.optimized\.jpg'\)/);
  assert.match(app, /<ScrollyCanvas frameCount=\{20\}>/);
});

test('Serbian landing hero uses the current city campaign line', () => {
  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const overlay = readFileSync(new URL('../src/app/components/Overlay.tsx', import.meta.url), 'utf8');
  for (const source of [app, overlay]) assert.match(source, /Auto je za more, Pogon je za grad/);
});

test('landing rating and Core sale badge remain clearly visible', () => {
  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  assert.match(app, />5\.0<\/span>/);
  assert.match(app, /badgeKey: 'sale'[\s\S]*badgeClass: 'bg-black text-white/);
});

test('admin CRM includes an authenticated PAID-orders panel with game prizes', () => {
  const route = readFileSync(new URL('../api/admin/orders.ts', import.meta.url), 'utf8');
  const admin = readFileSync(new URL('../src/app/components/AdminLeads.tsx', import.meta.url), 'utf8');
  const panel = readFileSync(new URL('../src/app/components/AdminOrdersPanel.tsx', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8');
  assert.match(route, /verifyAdminAccessToken/);
  assert.match(route, /Cache-Control', 'private, no-store/);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(client, /Authorization: `Bearer \$\{accessToken\}`/);
  assert.match(client, /ADMIN_ORDERS_API_NOT_RUNNING/);
  assert.match(admin, /fetchPaidOrders/);
  assert.match(admin, /npm run dev:fullstack/);
  assert.match(admin, /<AdminOrdersPanel/);
  assert.match(panel, /Completed orders/);
  assert.match(panel, /gamePrizeLabel/);
  assert.match(panel, /Export orders CSV/);
  const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
  assert.match(viteConfig, /adminOrdersDevApi/);
  assert.match(viteConfig, /use\('\/api\/admin\/orders'/);
  assert.doesNotMatch(viteConfig, /api\/checkout|api\/nestpay/);
});

test('Core sale is displayed consistently and the server charges 130,000 RSD', () => {
  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const products = readFileSync(new URL('../src/lib/products.ts', import.meta.url), 'utf8');
  const checkout = readFileSync(new URL('../src/app/components/Checkout.tsx', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const corePage = readFileSync(new URL('../public/elektricni-bicikli/core/index.html', import.meta.url), 'utf8');

  assert.equal(calculateOrderTotal('core', 1).unitPriceRsd, 130_000);
  assert.match(app, /badgeKey: 'sale'/);
  assert.match(app, /originalPrice: '135\.000,00 RSD'[\s\S]*price: '130\.000,00 RSD'/);
  assert.match(products, /priceRsd: 130_000, listPriceRsd: 135_000/);
  assert.match(checkout, /entry\.listPriceRsd/);
  for (const html of [home, corePage]) assert.match(html, /"price"\s*:\s*"130000"/);
});

test('tic-tac-toe gives about half of first attempts a win and assists the second attempt', () => {
  assert.equal(FRIENDLY_GAME_RATE, 0.445);
  assert.equal(createBotStyle(() => 0.444, 1), 'friendly');
  assert.equal(createBotStyle(() => 0.446, 1), 'competitive');
  assert.equal(createBotStyle(() => 0.999, 2), 'assisted');
  assert.equal(createBotStyle(() => 0.999, 8), 'assisted');
  assert.equal(gameResult(['X', 'X', 'X', null, 'O', null, 'O', null, null]).winner, 'X');
  assert.equal(chooseBotMove(['O', 'O', null, 'X', 'X', null, null, null, null], 'friendly', () => 0.99), 2, 'bot must always take its own win');
  assert.notEqual(chooseBotMove(['O', 'O', null, 'X', 'X', null, null, null, null], 'assisted', () => 0), 2, 'assisted bot must leave the player winning move open');

  let seed = 20260901;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const winningMove = (board, mark) => availableMoves(board).find((index) => {
    const next = [...board];
    next[index] = mark;
    return gameResult(next)?.winner === mark;
  });
  const practicalPlayerMove = (board) => {
    const finish = winningMove(board, 'X');
    if (finish !== undefined) return finish;
    const block = winningMove(board, 'O');
    if (block !== undefined) return block;
    if (board[4] === null) return 4;
    const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
    if (corners.length) return corners[Math.floor(random() * corners.length)];
    const moves = availableMoves(board);
    return moves[Math.floor(random() * moves.length)];
  };

  const simulate = (attemptNumber, games) => {
    let wins = 0;
    for (let game = 0; game < games; game += 1) {
      const board = Array(9).fill(null);
      const style = createBotStyle(random, attemptNumber);
      while (!gameResult(board)) {
        board[practicalPlayerMove(board)] = 'X';
        if (gameResult(board)) break;
        const botMove = chooseBotMove(board, style, random);
        if (botMove !== undefined) board[botMove] = 'O';
      }
      if (gameResult(board)?.winner === 'X') wins += 1;
    }
    return wins / games;
  };

  const firstAttemptWinRate = simulate(1, 5000);
  assert.ok(firstAttemptWinRate >= 0.47 && firstAttemptWinRate <= 0.53, `expected a roughly 50% first-attempt win rate, received ${firstAttemptWinRate}`);
  assert.equal(simulate(2, 1000), 1, 'the assisted second attempt should give a practical player the win');
});

test('mobile tic-tac-toe win state replaces the board with compact prize choices', () => {
  const game = readFileSync(new URL('../src/app/components/TicTacToeGame.tsx', import.meta.url), 'utf8');
  assert.match(game, /phase === 'won' \? 'hidden sm:block' : ''/);
  assert.match(game, /phase === 'won' \? 'hidden sm:grid' : 'grid'/);
  assert.match(game, /phase === 'won' \? 'hidden sm:flex' : 'flex'/);
  assert.match(game, /aria-labelledby=\{phase === 'won' \? 'tic-tac-toe-result-title' : 'tic-tac-toe-title'\}/);
  assert.match(game, /id="tic-tac-toe-result-title"/);
  assert.match(game, /h-\[58dvh\] min-h-\[25rem\] max-h-\[29rem\]/);
  assert.match(game, /flex h-full flex-col justify-center/);
  assert.match(game, /mt-4 grid grid-cols-3 gap-2\.5/);
  assert.match(game, /min-h-28 flex-col/);
  assert.match(game, /phase === 'won' && claimedPrize \? 'grid-cols-2'/);
});

test('game prizes are validated, selectable, and attached to orders without changing delivery', () => {
  assert.equal(normalizeGamePrize('lock'), 'lock');
  assert.equal(normalizeGamePrize('gloves'), 'gloves');
  assert.equal(normalizeGamePrize('helmet'), 'helmet');
  assert.throws(() => normalizeGamePrize('free-delivery'), /INVALID_GAME_PRIZE/);
  assert.throws(() => normalizeGamePrize('made-up-prize'), /INVALID_GAME_PRIZE/);
  assert.deepEqual(applyGamePrizeToDelivery('helmet', 'courier', { exact: true, feeRsd: 3900, source: 'fixed_server_config' }), { exact: true, feeRsd: 3900, source: 'fixed_server_config' });
  assert.deepEqual(attachGamePrize([{ product: 'core' }], 'gloves')[0], { product: 'core', gamePrize: 'gloves', gamePrizeLabel: 'Rukavice za vožnju' });
  const validCheckout = { product: 'core', quantity: 1, installmentCount: 1, captchaToken: 'a'.repeat(20), termsAccepted: true, deliveryMethod: 'courier', gamePrize: 'lock', customer: { firstName: 'A', lastName: 'B', email: 'a@b.rs', phone: '12345678', street: 'Ulica 1', city: 'Beograd', postalCode: '11000' } };
  assert.equal(validateCheckout(validCheckout).gamePrize, 'lock');
  assert.throws(() => validateCheckout({ ...validCheckout, gamePrize: 'fake-prize' }), /INVALID_GAME_PRIZE/);
  const confirmation = buildPaymentConfirmation({ orderId: 'PGN-GAME', paymentStatus: 'PAID', customerName: 'Kupac', email: 'a@b.rs', street: 'Ulica 1', postalCode: '11000', city: 'Beograd', deliveryMethod: 'courier', deliveryFeeRsd: 3900, items: [{ product: 'core', name: 'Pogon Core', quantity: 1, unitPriceRsd: 130000, lineTotalRsd: 130000, gamePrizeLabel: 'Rukavice za vožnju' }], subtotalRsd: 130000, totalRsd: 133900 }, { legalName: 'POGON MOBILITY DOO' });
  assert.match(confirmation.html, /Osvojena nagrada 1/);
  assert.match(confirmation.html, /Rukavice za vožnju/);

  const app = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const game = readFileSync(new URL('../src/app/components/TicTacToeGame.tsx', import.meta.url), 'utf8');
  const gamePrizes = readFileSync(new URL('../src/lib/gamePrize.ts', import.meta.url), 'utf8');
  const checkout = readFileSync(new URL('../src/app/components/Checkout.tsx', import.meta.url), 'utf8');
  assert.match(app, /lazy\(\(\) => import\('\.\/components\/TicTacToeGame'\)/);
  for (const prize of ['Besplatan lanac', 'Rukavice za vožnju', 'Kaciga']) assert.match(gamePrizes, new RegExp(prize));
  assert.match(game, /claimPrize/);
  assert.match(game, /storeGamePrize\(prize\)/);
  assert.match(game, /Igraj ponovo/);
  assert.match(game, /confettiPieces/);
  assert.match(game, /poklon koji dobijaš uz kupovinu Pogon bicikla/);
  assert.match(game, /bravo: 'Bravo!'/);
  assert.doesNotMatch(game, /Bravo — pobeda|Pobeda!/);
  assert.match(app, /const gameLauncherCopy = tr\(/);
  assert.match(app, /compact: 'Play and win'/);
  assert.match(app, /compact: 'Играй и выиграй'/);
  assert.match(app, /language=\{lang\}/);
  assert.match(game, /const gameCopy =/);
  assert.match(game, /\{copy\.badge\}/);
  assert.match(game, /Free bike lock/);
  assert.match(game, /Бесплатный велозамок/);
  assert.doesNotMatch(checkout, /gamePrize === 'free-delivery'/);
  assert.match(checkout, /gamePrize,/);
});
