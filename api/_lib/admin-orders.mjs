import { dbRequest } from './supabase.mjs';

const ADMIN_EMAIL = 'pogonmobility@gmail.com';
const PAID_ORDER_SELECT = [
  'order_id', 'created_at', 'customer_name', 'email', 'phone', 'street', 'city', 'postal_code',
  'delivery_method', 'installment_count', 'payment_status', 'product', 'quantity', 'unit_price_rsd',
  'subtotal_rsd', 'delivery_fee_rsd', 'total_rsd', 'order_items', 'nestpay_transaction_id', 'transaction_date',
].join(',');

const config = (env = process.env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('ADMIN_ORDER_DATABASE_NOT_CONFIGURED');
  return { url: env.SUPABASE_URL.replace(/\/$/, ''), key: env.SUPABASE_SERVICE_ROLE_KEY };
};

export async function verifyAdminAccessToken(accessToken, env = process.env, fetchImpl = fetch) {
  if (typeof accessToken !== 'string' || accessToken.length < 20 || accessToken.length > 4096) return false;
  const { url, key } = config(env);
  const response = await fetchImpl(`${url}/auth/v1/user`, {
    method: 'GET',
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return false;
  const user = await response.json().catch(() => null);
  return typeof user?.email === 'string' && user.email.toLowerCase() === ADMIN_EMAIL;
}

export async function listPaidOrders(env = process.env, fetchImpl = fetch) {
  return dbRequest(
    `orders?select=${PAID_ORDER_SELECT}&payment_status=eq.PAID&order=created_at.desc&limit=200`,
    {}, env, fetchImpl,
  );
}
