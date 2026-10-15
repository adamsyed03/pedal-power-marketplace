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

export async function submitUkLead(input: UkLeadInput) {
  const params = new URLSearchParams(window.location.search);
  const response = await fetch('/api/uk/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      model: input.model ?? 'any',
      consent: true,
      source: 'uk-landing',
      page: input.page?.startsWith('/uk') ? input.page : '/uk',
      displayed_price_gbp: input.displayedPriceGbp ?? null,
      purchase_timeframe: input.purchaseTimeframe ?? null,
      price_interest: input.priceInterest ?? false,
      marketing_consent: input.marketingConsent ?? false,
      lead_type: input.leadType ?? 'interest',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'We could not save your enquiry. Please try again.');
}
