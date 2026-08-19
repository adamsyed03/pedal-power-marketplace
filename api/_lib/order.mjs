import { randomBytes } from 'node:crypto';

export const PAYMENT_STATUSES = Object.freeze([
  'PENDING', '3D_PENDING', 'AUTHORIZING', 'PAID', 'DECLINED',
  'FAILED', 'UNKNOWN', 'CANCELLED', 'REFUNDED',
]);

export function createOrderId(now = new Date()) {
  const year = now.getUTCFullYear();
  return `PGN-${year}-${randomBytes(8).toString('hex').toUpperCase()}`;
}
