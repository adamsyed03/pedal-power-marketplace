import { insertUkLead, normalizeUkLeadInput } from '../_lib/uk-leads.mjs';
import { rateLimit, requestIp } from '../_lib/security.mjs';

export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

  const limited = rateLimit(`uk-lead:${requestIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limited.allowed) {
    response.setHeader('Retry-After', String(limited.retryAfter));
    return response.status(429).json({ error: 'Too many enquiries. Please try again later.' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (typeof body?.website === 'string' && body.website.trim()) return response.status(200).json({ ok: true });
    const lead = normalizeUkLeadInput(body);
    const saved = await insertUkLead(lead);
    if (!saved?.id) throw new Error('UK_LEAD_NOT_SAVED');
    return response.status(201).json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INVALID_UK_LEAD' || error instanceof SyntaxError) {
      return response.status(400).json({ error: 'Please check the required fields and try again.' });
    }
    console.error('[uk-lead] Enquiry could not be saved.', { code });
    return response.status(503).json({ error: 'We could not save your enquiry. Please call the UK team or try again.' });
  }
}
