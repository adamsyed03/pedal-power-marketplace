import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cardPage = readFileSync(new URL('../app/components/CardPayment.tsx', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../app/components/Checkout.tsx', import.meta.url), 'utf8');
const homepage = readFileSync(new URL('../app/App.tsx', import.meta.url), 'utf8');

test('bank-hosted card page submits only server-prepared transaction fields', () => {
  assert.match(cardPage, /Object\.entries\(prepared\.fields\)/);
  assert.match(cardPage, /Banca Intesa \/ NestPay/);
  assert.match(cardPage, /Podatke kartice unosite isključivo tamo/);
  assert.doesNotMatch(cardPage, /\bpan\b|cv2|ExpDate|expMonth|expYear|cardType|isOfficialTestPan|detectCardType/i);
  assert.doesNotMatch(cardPage, /\.append\(['"](?:pan|cv2|cardType)/i);
});

test('checkout is fail-closed to the one-payment hosted flow', () => {
  assert.match(checkout, /installmentCount:\s*1/);
  assert.match(checkout, /Jednokratno plaćanje/);
  assert.doesNotMatch(checkout, /installmentOptions|setInstallments/);
});

test('homepage does not advertise unavailable installment options', () => {
  assert.doesNotMatch(homepage, /monthlyPrice|perMonth|12 rata|Fleksibilna rata|Flexible installment|Гибкая рассрочка/);
});
