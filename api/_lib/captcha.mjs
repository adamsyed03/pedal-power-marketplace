export async function verifyCaptcha(token, remoteIp, env = process.env, fetchImpl = fetch) {
  if (!env.TURNSTILE_SECRET_KEY) throw new Error('CAPTCHA_NOT_CONFIGURED');
  if (typeof token !== 'string' || token.length < 10 || token.length > 2048) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  let response;
  try {
    response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  } catch {
    throw new Error('CAPTCHA_SERVICE_UNAVAILABLE');
  }
  if (!response.ok) throw new Error('CAPTCHA_SERVICE_UNAVAILABLE');
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('CAPTCHA_SERVICE_UNAVAILABLE');
  }
  return result.success === true && result.action === 'checkout';
}
