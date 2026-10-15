import { FormEvent, useState } from 'react';
import { CheckCircle2, LoaderCircle, MessageCircle } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { submitUkLead } from './ukLeads';
import { UK_PRODUCT_COPY, UK_PRODUCT_PRICES, UK_WHATSAPP_HREF, type UkProductKey } from './ukMarket';

type FormState = {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  timeframe: '' | 'as-soon-as-available' | '0-3-months' | '3-6-months' | '6-12-months' | 'researching';
};

const EMPTY_FORM: FormState = {
  name: '', email: '', phone: '', postcode: '', timeframe: '',
};

export function UkInterestForm({ model, notifyOnly = false }: { model: UkProductKey; notifyOnly?: boolean }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const copy = UK_PRODUCT_COPY[model];
  const price = UK_PRODUCT_PRICES[model];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    try {
      await submitUkLead({
        name: notifyOnly ? undefined : form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        postcode: notifyOnly ? undefined : form.postcode.trim(),
        model,
        source: notifyOnly ? 'fold-notify' : `product-${model}`,
        page: window.location.pathname,
        displayedPriceGbp: price.amount,
        purchaseTimeframe: notifyOnly ? undefined : form.timeframe || undefined,
        priceInterest: !notifyOnly,
        marketingConsent: false,
        leadType: notifyOnly ? 'fold-notify' : 'interest',
        message: notifyOnly ? 'Notify when Pogon Fold becomes available in the UK.' : `UK ${copy.name} product enquiry`,
      });
      trackEvent(notifyOnly ? 'uk_fold_notify_submit' : 'uk_product_lead_submit', { market: 'UK', model, displayed_price_gbp: price.amount });
      setForm(EMPTY_FORM);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-emerald-950" role="status">
        <CheckCircle2 className="size-9" />
        <h3 className="mt-4 text-2xl font-black">{notifyOnly ? 'You’re on the list.' : 'Thank you. The UK team will be in touch.'}</h3>
        <p className="mt-2 text-sm text-emerald-900/75">Your details have been saved in Pogon’s lead system with a clear UK landing page label. The UK team will contact you on WhatsApp.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-black/10 bg-white p-5 shadow-xl sm:p-7">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-black/45">{notifyOnly ? 'Availability update' : 'UK expression of interest'}</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">{notifyOnly ? 'Notify me about Fold' : `Register interest in ${copy.name}`}</h3>
      <p className="mt-2 text-sm leading-6 text-black/55">{notifyOnly ? 'Leave your email and WhatsApp number and we’ll let you know when more are coming.' : `No payment is taken. The displayed price is ${price.current}, VAT included.`}</p>

      <div className={`mt-6 grid gap-4 ${notifyOnly ? '' : 'sm:grid-cols-2'}`}>
        {!notifyOnly ? <label className="text-xs font-bold uppercase tracking-wider text-black/55">Name<input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-black/15 px-4 text-base font-normal normal-case tracking-normal outline-none focus:border-black" /></label> : null}
        <label className="text-xs font-bold uppercase tracking-wider text-black/55">Email<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-black/15 px-4 text-base font-normal normal-case tracking-normal outline-none focus:border-black" /></label>
        <label className="text-xs font-bold uppercase tracking-wider text-black/55">WhatsApp number<input required type="tel" maxLength={30} autoComplete="tel" placeholder="+44…" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-black/15 px-4 text-base font-normal normal-case tracking-normal outline-none focus:border-black" /></label>
        {!notifyOnly ? <label className="text-xs font-bold uppercase tracking-wider text-black/55">UK postcode<input required maxLength={12} autoComplete="postal-code" value={form.postcode} onChange={(event) => setForm({ ...form, postcode: event.target.value.toUpperCase() })} className="mt-2 h-12 w-full rounded-xl border border-black/15 px-4 text-base font-normal normal-case tracking-normal outline-none focus:border-black" /></label> : null}
        {!notifyOnly ? <label className="text-xs font-bold uppercase tracking-wider text-black/55 sm:col-span-2">When are you considering buying?<select required value={form.timeframe} onChange={(event) => setForm({ ...form, timeframe: event.target.value as FormState['timeframe'] })} className="mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base font-normal normal-case tracking-normal outline-none focus:border-black"><option value="">Select one</option><option value="as-soon-as-available">As soon as available</option><option value="0-3-months">Within 3 months</option><option value="3-6-months">3–6 months</option><option value="6-12-months">6–12 months</option><option value="researching">I’m researching</option></select></label> : null}
      </div>

      <p className="mt-5 text-xs leading-5 text-black/45">By submitting, you agree that Pogon may use these details to respond to your UK enquiry. Your details will not be added to marketing updates.</p>

      {status === 'error' ? <p className="mt-4 text-sm font-semibold text-red-700" role="alert">We couldn’t save your details. Please try again or <a className="inline-flex items-center gap-1 underline" href={UK_WHATSAPP_HREF} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />message the UK team on WhatsApp</a>.</p> : null}
      <button disabled={status === 'submitting'} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#7fff00] transition hover:bg-black/85 disabled:opacity-50">
        {status === 'submitting' ? <LoaderCircle className="size-4 animate-spin" /> : null}{status === 'submitting' ? 'Sending…' : notifyOnly ? 'Notify me' : 'Register interest'}
      </button>
    </form>
  );
}
