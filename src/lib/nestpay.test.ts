import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
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

test('TEST mode rejects non-official cards, so production cards are unusable', async () => {
  assert.equal(await isOfficialTestPan(`4${'1'.repeat(15)}`), false);
  assert.equal(await isOfficialTestPan('42'.repeat(8)), false);
  assert.equal(await isOfficialTestPan(''), false);
});

test('browser form posts card fields directly while checkout remains one payment', () => {
  const cardPage = readFileSync(new URL('../app/components/CardPayment.tsx', import.meta.url), 'utf8');
  const checkout = readFileSync(new URL('../app/components/Checkout.tsx', import.meta.url), 'utf8');
  const homepage = readFileSync(new URL('../app/App.tsx', import.meta.url), 'utf8');
  for (const field of ['pan', 'cv2', 'Ecom_Payment_Card_ExpDate_Month', 'Ecom_Payment_Card_ExpDate_Year', 'cardType']) {
    assert.match(cardPage, new RegExp(`append\\('${field}'`));
  }
  assert.match(cardPage, /Object\.entries\(prepared\.fields\)/);
  assert.match(checkout, /installmentCount:\s*1/);
  assert.doesNotMatch(homepage, /monthlyPrice|perMonth|12 rata|Fleksibilna rata|Flexible installment|Гибкая рассрочка/);
});
