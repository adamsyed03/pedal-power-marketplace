import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { detectCardType, isOfficialTestPan, normalizeExpiryMonth, normalizeExpiryYear } from './nestpay';

if (!globalThis.crypto?.subtle) {
  (globalThis as { crypto: Crypto }).crypto = webcrypto as Crypto;
}

test('cardType maps only documented brands: Visa=1, MasterCard=2, others omitted', () => {
  assert.equal(detectCardType(`4${'0'.repeat(15)}`), '1');
  assert.equal(detectCardType(`54${'0'.repeat(14)}`), '2');
  assert.equal(detectCardType(`2221${'0'.repeat(11)}9`), '2');
  assert.equal(detectCardType(`37${'0'.repeat(13)}`), '');
  assert.equal(detectCardType(`989${'0'.repeat(13)}`), '');
});

test('expiry month is two digits and expiry year is four digits', () => {
  assert.equal(normalizeExpiryMonth('1'), '01');
  assert.equal(normalizeExpiryMonth('12'), '12');
  assert.equal(normalizeExpiryMonth('13'), '');
  assert.equal(normalizeExpiryYear('26'), '2026');
  assert.equal(normalizeExpiryYear('2030'), '2030');
  assert.equal(normalizeExpiryYear('3'), '');
});

// Official test PANs are never committed; positive matches are exercised at
// runtime by the TC01 harness against the workbook cards.
test('TEST mode rejects non-official cards, so production cards are unusable', async () => {
  assert.equal(await isOfficialTestPan(`4${'1'.repeat(15)}`), false);
  assert.equal(await isOfficialTestPan('42'.repeat(8)), false);
  assert.equal(await isOfficialTestPan(''), false);
});
