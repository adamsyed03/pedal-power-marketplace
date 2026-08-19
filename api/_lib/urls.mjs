export function getPublicUrls(env = process.env) {
  if (!env.APP_BASE_URL) throw new Error('APP_BASE_URL_MISSING');
  const base = new URL(env.APP_BASE_URL);
  if (base.protocol !== 'https:' && base.hostname !== 'localhost') throw new Error('APP_BASE_URL_MUST_USE_HTTPS');
  base.pathname = '/';
  base.search = '';
  base.hash = '';
  const origin = base.toString().replace(/\/$/, '');
  return {
    origin,
    callbackUrl: `${origin}/api/nestpay/callback`,
    successUrl: `${origin}/payment/success`,
    failedUrl: `${origin}/payment/failed`,
  };
}
