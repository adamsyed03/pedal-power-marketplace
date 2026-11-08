import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const key = (env) => {
  const raw = env.GMAIL_TOKEN_ENCRYPTION_KEY || '';
  const value = /^[a-f0-9]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (value.length !== 32) throw new Error('GMAIL_TOKEN_ENCRYPTION_KEY must encode exactly 32 bytes.');
  return value;
};

export function encryptSecret(value, env = process.env) {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', key(env), iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptSecret(value, env = process.env) {
  const [iv, tag, ciphertext] = String(value).split('.');
  const decipher = createDecipheriv('aes-256-gcm', key(env), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
}

export function oauthState(env = process.env, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ exp: now + 10 * 60_000, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  const signature = createHmac('sha256', env.GMAIL_OAUTH_STATE_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyOauthState(value, env = process.env, now = Date.now()) {
  const [payload, provided] = String(value || '').split('.');
  const expected = createHmac('sha256', env.GMAIL_OAUTH_STATE_SECRET).update(payload || '').digest();
  const actual = Buffer.from(provided || '', 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  return Number(parsed.exp) > now;
}
