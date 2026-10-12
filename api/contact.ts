import { buildContactEmail, normalizeContactInput } from './_lib/contact.mjs';
import { sendTransactionalEmail } from './_lib/email.mjs';
import { rateLimit, requestIp } from './_lib/security.mjs';

export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

  const limited = rateLimit(`contact:${requestIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limited.allowed) {
    response.setHeader('Retry-After', String(limited.retryAfter));
    return response.status(429).json({ error: 'Previše poruka. Pokušajte ponovo kasnije.' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (typeof body?.website === 'string' && body.website.trim()) return response.status(200).json({ ok: true });
    const input = normalizeContactInput(body);
    await sendTransactionalEmail(buildContactEmail(input));
    return response.status(200).json({ ok: true, message: 'Poruka je poslata. Javićemo vam se uskoro.' });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INVALID_CONTACT' || error instanceof SyntaxError) {
      return response.status(400).json({ error: 'Proverite obavezna polja i pokušajte ponovo.' });
    }
    return response.status(503).json({ error: 'Poruku trenutno nije moguće poslati. Pokušajte ponovo ili nam pišite direktno.' });
  }
}
