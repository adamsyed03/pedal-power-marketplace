// Client-side helpers for the browser card form. Transaction fields, Hash
// Ver2 and StoreKey remain server-side; these helpers only prepare card values
// for the browser's direct POST to the NestPay TEST gateway.

export function detectCardType(pan: string): string {
  const digits = pan.replace(/\D/g, '');
  if (digits.startsWith('4')) return '1';
  if (/^5[1-5]|^2[2-7]/.test(digits)) return '2';
  return '';
}

export function normalizeExpiryMonth(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 2);
  if (!digits) return '';
  const month = Number(digits);
  if (!Number.isInteger(month) || month < 1 || month > 12) return '';
  return String(month).padStart(2, '0');
}

export function normalizeExpiryYear(value: string): string {
  const digits = (value || '').replace(/\D/g, '');
  if (digits.length === 4) return digits;
  if (digits.length === 2) return `20${digits}`;
  return '';
}

const officialTestPanDigests = [
  '0431c3d0fc16492f788836f21fed893d64cd36080a4baa6b47cc695c98f2035c',
  '7f2cebed67fa138b304f660cfaecdc16a3ffff42f5f384ec8da6fedd0198dbd4',
  'bf86428d795944b4ae796683148527ef8c69b7329f35945705e316373d570a7d',
  'aa8ee560e15a1ee887bfd3382b48535e7cf566d0582fe445674b18ddb68be382',
];

// TEST mode accepts only the official workbook cards. Digests keep PAN
// literals out of source control and browser error messages.
export async function isOfficialTestPan(pan: string): Promise<boolean> {
  const digits = pan.replace(/\D/g, '');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(digits));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return officialTestPanDigests.includes(hex);
}
