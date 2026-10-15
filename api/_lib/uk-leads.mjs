import { dbRequest } from './supabase.mjs';

const clean = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,30}$/;
const allowedModels = new Set(['any', 'glide', 'core', 'cargo', 'fold']);
const allowedTimeframes = new Set(['as-soon-as-available', '0-3-months', '3-6-months', '6-12-months', 'researching']);
const ukPrices = { cargo: 1299, core: 1700, glide: 1699, fold: 1099 };

function normalizeUkPhone(value) {
  const raw = clean(value, 30);
  if (!raw || !phonePattern.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('44')) return `+${digits}`;
  return `+44${digits.replace(/^0+/, '')}`;
}

export function normalizeUkLeadInput(input) {
  const name = clean(input?.name, 100);
  const email = clean(input?.email, 254).toLowerCase();
  const phone = normalizeUkPhone(input?.phone);
  const postcode = clean(input?.postcode, 12).toUpperCase();
  const model = clean(input?.model, 20).toLowerCase();
  const message = clean(input?.message, 1000);
  const pagePath = clean(input?.page, 120) || '/uk';
  const leadType = clean(input?.lead_type, 30) || 'interest';
  const purchaseTimeframe = clean(input?.purchase_timeframe, 40) || null;
  const isFoldNotification = leadType === 'fold-notify' && model === 'fold';

  const invalidIdentity = isFoldNotification
    ? !emailPattern.test(email)
    : name.length < 2 || !phonePattern.test(phone);
  if (
    invalidIdentity
    || (email && !emailPattern.test(email))
    || !allowedModels.has(model)
    || (purchaseTimeframe && !allowedTimeframes.has(purchaseTimeframe))
    || !['interest', 'fold-notify'].includes(leadType)
    || !pagePath.startsWith('/uk')
    || input?.consent !== true
  ) {
    throw new Error('INVALID_UK_LEAD');
  }

  return {
    name: name || null,
    email: email || null,
    phone: phone || null,
    postcode: postcode || null,
    model_interest: model,
    message: message || null,
    source: 'uk-landing',
    market: 'UK',
    page_path: pagePath,
    displayed_price_gbp: ukPrices[model] || null,
    purchase_timeframe: purchaseTimeframe,
    price_interest: input?.price_interest === true,
    marketing_consent: input?.marketing_consent === true,
    lead_type: leadType,
    utm_source: clean(input?.utm_source, 100) || null,
    utm_medium: clean(input?.utm_medium, 100) || null,
    utm_campaign: clean(input?.utm_campaign, 150) || null,
    consent: true,
  };
}

export async function insertUkLead(input, env = process.env, fetchImpl = fetch) {
  const rows = await dbRequest('uk_leads', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(input),
  }, env, fetchImpl);
  return rows?.[0] || null;
}

const UK_LEAD_SELECT = [
  'id', 'name', 'email', 'phone', 'postcode', 'model_interest', 'message', 'source', 'market', 'page_path',
  'displayed_price_gbp', 'purchase_timeframe', 'price_interest', 'marketing_consent', 'lead_type',
  'utm_source', 'utm_medium', 'utm_campaign', 'consent', 'created_at',
].join(',');

export async function listUkLeads(env = process.env, fetchImpl = fetch) {
  return dbRequest(`uk_leads?select=${UK_LEAD_SELECT}&order=created_at.desc&limit=500`, {}, env, fetchImpl);
}
