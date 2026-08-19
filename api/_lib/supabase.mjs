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
