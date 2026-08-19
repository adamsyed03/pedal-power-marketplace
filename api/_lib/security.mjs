import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const createLookupToken = () => randomBytes(32).toString('base64url');
export const hashLookupToken = (token) => createHash('sha256').update(String(token)).digest('hex');

export function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && timingSafeEqual(a, b);
}

const buckets = new Map();
export function rateLimit(key, { limit, windowMs }, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

export const requestIp = (request) => {
  const value = request.headers?.['x-forwarded-for'];
  return (Array.isArray(value) ? value[0] : value || request.socket?.remoteAddress || 'unknown').split(',')[0].trim();
};
