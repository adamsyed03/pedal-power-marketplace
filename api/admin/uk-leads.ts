import { verifyAdminAccessToken } from '../_lib/admin-orders.mjs';
import { listUkLeads } from '../_lib/uk-leads.mjs';
import { rateLimit, requestIp } from '../_lib/security.mjs';

const bearerToken = (request: any) => {
  const authorization = String(request.headers?.authorization || '');
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
};

export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.setHeader('Vary', 'Authorization');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!rateLimit(`admin-uk-leads:${requestIp(request)}`, { limit: 60, windowMs: 10 * 60_000 }).allowed) {
    return response.status(429).json({ error: 'Too many requests.' });
  }

  try {
    const token = bearerToken(request);
    if (!await verifyAdminAccessToken(token)) return response.status(401).json({ error: 'Admin login required.' });
    return response.status(200).json({ leads: await listUkLeads() });
  } catch {
    return response.status(503).json({ error: 'UK landing page enquiries are currently unavailable.' });
  }
}
