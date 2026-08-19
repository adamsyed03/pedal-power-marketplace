export async function verifyCaptcha(token, remoteIp, env = process.env, fetchImpl = fetch) {
  if (!env.TURNSTILE_SECRET_KEY) throw new Error('CAPTCHA_NOT_CONFIGURED');
  if (typeof token !== 'string' || token.length < 10 || token.length > 2048) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true;
}
