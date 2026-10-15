import { submitLead, type Lead } from '../lib/supabase';

export type UkLeadInput = {
  name?: string;
  phone?: string;
  email?: string;
  postcode?: string;
  model?: 'any' | 'glide' | 'core' | 'cargo' | 'fold';
  message?: string;
  source: string;
  page?: string;
  displayedPriceGbp?: number;
  purchaseTimeframe?: 'as-soon-as-available' | '0-3-months' | '3-6-months' | '6-12-months' | 'researching';
  priceInterest?: boolean;
  marketingConsent?: boolean;
  leadType?: 'interest' | 'fold-notify';
};

type NewLead = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'todo' | 'medium' | 'stage' | 'outcome'>;

const normalizeUkPhone = (value = '') => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('44')) return `+${digits}`;
  if (digits.startsWith('0')) return `+44${digits.slice(1)}`;
  return `+44${digits}`;
};

export function buildUkLead(input: UkLeadInput): NewLead {
  const params = new URLSearchParams(window.location.search);
  const page = input.page?.startsWith('/uk') ? input.page : window.location.pathname.startsWith('/uk') ? window.location.pathname : '/uk';
  const model = input.model ?? 'any';
  const email = input.email?.trim().toLowerCase() || '';
  const postcode = input.postcode?.trim().toUpperCase() || '';
  const phone = normalizeUkPhone(input.phone);
  const details = [
    'UK landing page enquiry',
    `Model: ${model}`,
    email ? `Email: ${email}` : '',
    postcode ? `Postcode: ${postcode}` : '',
    input.purchaseTimeframe ? `Buying timeframe: ${input.purchaseTimeframe}` : '',
    input.displayedPriceGbp ? `Displayed price: £${input.displayedPriceGbp} VAT included` : '',
    input.leadType ? `Lead type: ${input.leadType}` : '',
    input.message?.trim() ? `Message: ${input.message.trim()}` : '',
    `Page: ${page}`,
    params.get('utm_source') ? `UTM source: ${params.get('utm_source')}` : '',
    params.get('utm_medium') ? `UTM medium: ${params.get('utm_medium')}` : '',
    params.get('utm_campaign') ? `UTM campaign: ${params.get('utm_campaign')}` : '',
  ].filter(Boolean);

  return {
    name: input.name?.trim() || email || 'UK website enquiry',
    phone,
    source: `UK landing page | ${input.source || 'enquiry'}`,
    language: 'en',
    city: postcode || null,
    country: 'UK',
    date_contacted: null,
    comment: details.join('\n'),
  };
}

export async function submitUkLead(input: UkLeadInput) {
  await submitLead(buildUkLead(input));
}
