import { randomUUID } from 'node:crypto';

function config(env = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('ORDER_DATABASE_NOT_CONFIGURED');
  return { url: env.SUPABASE_URL.replace(/\/$/, ''), key: env.SUPABASE_SERVICE_ROLE_KEY };
}

export async function dbRequest(path, init = {}, env = process.env, fetchImpl = fetch) {
  const { url, key } = config(env);
  const response = await fetchImpl(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) throw new Error(`ORDER_DATABASE_ERROR_${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

export async function insertOrder(order, env, fetchImpl = fetch) {
  const rows = await dbRequest('orders', {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(order),
  }, env, fetchImpl);
  return rows[0];
}

export async function findOrderById(orderId, env) {
  const rows = await dbRequest(`orders?order_id=eq.${encodeURIComponent(orderId)}&limit=1`, {}, env);
  return rows[0] || null;
}

export async function findOrderByIdempotency(idempotencyKey, env) {
  const rows = await dbRequest(`orders?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&limit=1`, {}, env);
  return rows[0] || null;
}

export async function findOrderByLookup(orderId, lookupTokenHash, env) {
  const rows = await dbRequest(`orders?order_id=eq.${encodeURIComponent(orderId)}&lookup_token_hash=eq.${encodeURIComponent(lookupTokenHash)}&limit=1`, {}, env);
  return rows[0] || null;
}

export async function patchOrder(orderId, changes, expectedStatuses, env) {
  const statusFilter = expectedStatuses?.length ? `&payment_status=in.(${expectedStatuses.join(',')})` : '';
  const rows = await dbRequest(`orders?order_id=eq.${encodeURIComponent(orderId)}${statusFilter}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...changes, updated_at: new Date().toISOString() }),
  }, env);
  return rows[0] || null;
}

// Atomically claims one final-state confirmation. The database predicate means
// replayed or concurrent callbacks cannot both obtain a send claim.
export async function claimConfirmationEmail(order, env) {
  const claimToken = randomUUID();
  const rows = await dbRequest(
    `orders?order_id=eq.${encodeURIComponent(order.order_id)}`
      + `&payment_status=eq.${encodeURIComponent(order.payment_status)}`
      + '&confirmation_email_sent_at=is.null&confirmation_email_claim_token=is.null',
    {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        confirmation_email_claim_token: claimToken,
        confirmation_email_claimed_at: new Date().toISOString(),
        confirmation_email_attempts: Number(order.confirmation_email_attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      }),
    }, env,
  );
  return rows[0] ? { order: rows[0], claimToken } : null;
}

export async function completeConfirmationEmail(orderId, claimToken, env) {
  const rows = await dbRequest(
    `orders?order_id=eq.${encodeURIComponent(orderId)}`
      + `&confirmation_email_claim_token=eq.${encodeURIComponent(claimToken)}`
      + '&confirmation_email_sent_at=is.null',
    {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        confirmation_email_sent_at: new Date().toISOString(),
        confirmation_email_claim_token: null,
        confirmation_email_claimed_at: null,
        updated_at: new Date().toISOString(),
      }),
    }, env,
  );
  return rows[0] || null;
}

export async function releaseConfirmationEmail(orderId, claimToken, env) {
  const rows = await dbRequest(
    `orders?order_id=eq.${encodeURIComponent(orderId)}`
      + `&confirmation_email_claim_token=eq.${encodeURIComponent(claimToken)}`
      + '&confirmation_email_sent_at=is.null',
    {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        confirmation_email_claim_token: null,
        confirmation_email_claimed_at: null,
        updated_at: new Date().toISOString(),
      }),
    }, env,
  );
  return rows[0] || null;
}
