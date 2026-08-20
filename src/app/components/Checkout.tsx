import { FormEvent, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import { formatRsd, products, ProductKey } from '../../lib/products';
import { PaymentBranding } from './PaymentBranding';
import { Turnstile } from './Turnstile';

const fieldClassName = 'min-h-13 w-full rounded-2xl border border-black/10 bg-[#f8f7f3] px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/20 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10';

const fields = [
  { name: 'firstName', label: 'Ime', type: 'text', autoComplete: 'given-name', placeholder: 'Petar' },
  { name: 'lastName', label: 'Prezime', type: 'text', autoComplete: 'family-name', placeholder: 'Petrović' },
  { name: 'email', label: 'Email adresa', type: 'email', autoComplete: 'email', placeholder: 'petar@email.com' },
  { name: 'phone', label: 'Broj telefona', type: 'tel', autoComplete: 'tel', placeholder: '+381 64 123 4567' },
  { name: 'street', label: 'Ulica i broj', type: 'text', autoComplete: 'street-address', placeholder: 'Kneza Miloša 12', wide: true },
  { name: 'postalCode', label: 'Poštanski broj', type: 'text', autoComplete: 'postal-code', placeholder: '11000' },
  { name: 'city', label: 'Grad', type: 'text', autoComplete: 'address-level2', placeholder: 'Beograd' },
] as const;

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#171713] text-sm font-black text-white">{number}</span>
      <div>
        <h2 className="text-xl font-black tracking-[-0.02em] sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-black/50">{description}</p>
      </div>
    </div>
  );
}

export function Checkout() {
  const requestedModel = new URLSearchParams(window.location.search).get('model')?.toLowerCase();
  const model = products.some((entry) => entry.key === requestedModel) ? requestedModel as ProductKey : null;
  const [items, setItems] = useState<{ product: ProductKey; quantity: number }[]>(model ? [{ product: model, quantity: 1 }] : []);
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('courier');
  const [accepted, setAccepted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [customerSummary, setCustomerSummary] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');
  const idempotencyKey = useRef(crypto.randomUUID());
  const displayedTotal = useMemo(() => items.reduce((sum, item) => {
    const entry = products.find((candidate) => candidate.key === item.product)!;
    return sum + entry.priceRsd * item.quantity;
  }, 0), [items]);
  const displayedDeliveryFee = deliveryMethod === 'courier' ? 3_500 : 0;
  const displayedPayableTotal = displayedTotal + displayedDeliveryFee;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accepted || !captchaToken) return;
    setStatus('submitting');
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      items,
      installmentCount: 1,
      customer: {
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        email: form.get('email'),
        phone: form.get('phone'),
        street: form.get('street'),
        city: form.get('city'),
        postalCode: form.get('postalCode'),
      },
      deliveryMethod,
      paymentOption: 'card',
      captchaToken,
      termsAccepted: accepted,
    };

    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey.current },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || 'Plaćanje trenutno nije dostupno.');
      if (body?.paymentReady === false) {
        throw new Error(body.message || `Porudžbina ${body.orderId} je sačuvana, ali plaćanje još nije omogućeno.`);
      }
      if (!body?.redirectUrl) throw new Error('Nedostaje bezbedna adresa za plaćanje.');
      window.location.assign(body.redirectUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Plaćanje trenutno nije dostupno.');
      setStatus('error');
    }
  };

  const changeQuantity = (key: ProductKey, amount: number) => {
    setItems((current) => current.map((item) => item.product === key ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  };

  const addModel = (key: ProductKey) => setItems((current) => current.some((item) => item.product === key) ? current : [...current, { product: key, quantity: 1 }]);
  const removeModel = (key: ProductKey) => setItems((current) => current.filter((item) => item.product !== key));

  if (!model) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ec] px-4 text-center text-[#171713]">
        <div className="max-w-md rounded-[2rem] border border-black/[0.06] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight">Prvo izaberi model</h1>
          <p className="mt-3 leading-7 text-black/50">Checkout se otvara direktno za Pogon model koji izabereš.</p>
          <a href="/#modeli" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#171713] px-6 font-black text-white">Pogledaj modele</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#171713] selection:bg-orange-200">
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#f4f2ec]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center">
          <a href="/#modeli" className="group inline-flex w-fit items-center gap-2 rounded-full px-2 py-2 text-sm font-bold transition hover:bg-black/5">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Nazad na modele</span>
            <span className="sm:hidden">Nazad</span>
          </a>
          <a href="/" aria-label="Pogon početna" className="justify-self-center"><img src="/Logo.png" alt="Pogon" className="h-8 w-auto sm:h-9" /></a>
          <span className="inline-flex items-center justify-self-end gap-2 text-xs font-bold text-black/50"><LockKeyhole className="size-4 text-emerald-700" /><span className="hidden sm:inline">Bezbedna kupovina</span></span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-9 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mb-9 max-w-2xl sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-bold text-black/55 shadow-sm">
            <ShieldCheck className="size-4 text-emerald-700" /> Sigurna online porudžbina
          </div>
          <h1 className="text-[2.5rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">Još samo par detalja.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-black/55 sm:text-lg">Unesi podatke za dostavu i proveri porudžbinu pre odlaska na bezbedno plaćanje.</p>
        </div>

        <form onSubmit={submit} onInput={(event) => { const input = event.target as HTMLInputElement; if (input.name) setCustomerSummary((current) => ({ ...current, [input.name]: input.value })); }} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_410px] lg:gap-10">
          <div className="space-y-5">
            <section className="rounded-[2rem] border border-black/[0.06] bg-white p-5 shadow-[0_10px_40px_rgba(32,28,18,0.05)] sm:p-8">
              <SectionHeading number="1" title="Kako želiš da preuzmeš bicikl?" description="Cena dostave je odmah uključena u ukupan iznos." />
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setDeliveryMethod('courier')} aria-pressed={deliveryMethod === 'courier'} className={`flex min-h-32 gap-4 rounded-2xl border-2 p-4 text-left transition ${deliveryMethod === 'courier' ? 'border-orange-500 bg-orange-50/60' : 'border-black/[0.07] hover:border-black/20'}`}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"><Truck className="size-5" /></span>
                  <span><span className="flex items-center gap-2 font-black">Kurirska dostava {deliveryMethod === 'courier' && <Check className="size-4 text-orange-600" />}</span><span className="mt-1 block text-sm leading-5 text-black/50">Cela Srbija · 1–3 radna dana</span><span className="mt-2 block text-sm font-black">3.500 RSD</span></span>
                </button>
                <button type="button" onClick={() => setDeliveryMethod('pickup')} aria-pressed={deliveryMethod === 'pickup'} className={`flex min-h-32 gap-4 rounded-2xl border-2 p-4 text-left transition ${deliveryMethod === 'pickup' ? 'border-orange-500 bg-orange-50/60' : 'border-black/[0.07] hover:border-black/20'}`}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"><Store className="size-5" /></span>
                  <span><span className="flex items-center gap-2 font-black">Lično preuzimanje {deliveryMethod === 'pickup' && <Check className="size-4 text-orange-600" />}</span><span className="mt-1 block text-sm leading-5 text-black/50">Save Maskovica 3, Beograd</span><span className="mt-2 block text-sm font-black text-emerald-700">Besplatno</span></span>
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/[0.06] bg-white p-5 shadow-[0_10px_40px_rgba(32,28,18,0.05)] sm:p-8">
              <SectionHeading number="2" title="Podaci za porudžbinu" description={deliveryMethod === 'courier' ? 'Na ovu adresu šaljemo bicikl i potvrdu porudžbine.' : 'Koristićemo ih da potvrdimo termin preuzimanja.'} />
              <div className="mt-7 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.name} className={field.wide ? 'sm:col-span-2' : ''}>
                    <span className="mb-2 block text-sm font-bold">{field.label}</span>
                    <input name={field.name} type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} required maxLength={field.name === 'email' ? 254 : 120} className={fieldClassName} />
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="overflow-hidden rounded-[2rem] border border-black/[0.06] bg-[#1b1b17] text-white shadow-[0_24px_70px_rgba(26,23,15,0.18)] lg:sticky lg:top-24">
            <div className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Tvoja porudžbina</p>
              <div className="mt-5 space-y-3">
                {items.map((item) => {
                  const entry = products.find((candidate) => candidate.key === item.product)!;
                  return <div key={item.product} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f3ed]"><img src={entry.image} alt={entry.name} className="size-full object-contain p-1" /></div>
                    <div className="min-w-0 flex-1"><h2 className="font-black tracking-tight">{entry.name}</h2><p className="mt-1 text-xs leading-4 text-white/45">{entry.description}</p><p className="mt-1 text-xs font-bold text-white/70">{formatRsd(entry.priceRsd)} po komadu</p></div>
                    <div className="flex items-center gap-0.5 rounded-full bg-white/10 p-1">
                      <button type="button" aria-label="Smanji količinu" onClick={() => item.quantity === 1 && items.length > 1 ? removeModel(item.product) : changeQuantity(item.product, -1)} className="flex size-7 items-center justify-center rounded-full hover:bg-white/10"><Minus className="size-3" /></button>
                      <span className="min-w-6 text-center text-xs font-black">{item.quantity}</span>
                      <button type="button" aria-label="Dodaj još jedan" onClick={() => changeQuantity(item.product, 1)} className="flex size-7 items-center justify-center rounded-full bg-orange-500 text-black hover:bg-orange-400"><Plus className="size-3" /></button>
                    </div>
                  </div>;
                })}
              </div>

              {items.length < products.length && <div className="mt-4">
                <p className="mb-2 text-xs font-bold text-white/45">Dodaj drugi model</p>
                <div className="flex flex-wrap gap-2">{products.filter((entry) => !items.some((item) => item.product === entry.key)).map((entry) => <button key={entry.key} type="button" onClick={() => addModel(entry.key)} className="rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-white/70 transition hover:border-orange-400 hover:text-white"><Plus className="mr-1 inline size-3" /> {entry.name}</button>)}</div>
              </div>}

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex items-center gap-3"><CreditCard className="size-5 text-orange-400" /><div><p className="text-sm font-bold">Plaćanje karticom</p><p className="text-xs text-white/45">Jednokratno plaćanje</p></div></div>
                <p className="mt-3 text-xs leading-5 text-white/40">Podatke kartice unosite u sledećem koraku; pregledač ih šalje direktno Banca Intesa / NestPay sistemu.</p>
              </div>

              <PaymentBranding dark compact />

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-5 text-white/60">
                <p className="font-black text-white">Podaci za konačnu specifikaciju</p>
                {customerSummary.firstName || customerSummary.lastName || customerSummary.email ? <dl className="mt-2 grid gap-1">
                  <div><dt className="inline text-white/40">Kupac: </dt><dd className="inline">{`${customerSummary.firstName || ''} ${customerSummary.lastName || ''}`.trim() || '—'}</dd></div>
                  <div><dt className="inline text-white/40">Email: </dt><dd className="inline break-all">{customerSummary.email || '—'}</dd></div>
                  <div><dt className="inline text-white/40">Telefon: </dt><dd className="inline">{customerSummary.phone || '—'}</dd></div>
                  <div><dt className="inline text-white/40">{deliveryMethod === 'courier' ? 'Adresa isporuke' : 'Adresa kupca'}: </dt><dd className="inline">{[customerSummary.street, customerSummary.postalCode, customerSummary.city].filter(Boolean).join(', ') || '—'}</dd></div>
                  <div><dt className="inline text-white/40">Način preuzimanja: </dt><dd className="inline">{deliveryMethod === 'courier' ? 'Kurirska dostava' : 'Lično preuzimanje'}</dd></div>
                </dl> : <p className="mt-2">Popunite podatke kupca u odeljku 2. Ovde će biti prikazani za završnu proveru pre plaćanja.</p>}
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-white/60"><span>Proizvodi ({items.reduce((sum, item) => sum + item.quantity, 0)})</span><span className="font-medium text-white">{formatRsd(displayedTotal)}</span></div>
                <div className="flex justify-between gap-4 text-white/60"><span>Dostava</span><span className={deliveryMethod === 'pickup' ? 'font-bold text-emerald-400' : 'font-medium text-white'}>{deliveryMethod === 'pickup' ? 'Besplatno' : formatRsd(displayedDeliveryFee)}</span></div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5"><span className="font-bold">Ukupno</span><span className="text-2xl font-black tracking-tight">{formatRsd(displayedPayableTotal)}</span></div>
                <p className="text-right text-[11px] leading-4 text-white/50">Sve cene su sa uračunatim PDV-om i nema dodatnih ili skrivenih troškova.</p>
                <p className="text-right text-[11px] text-white/35">Prodavnica naplaćuje isključivo u RSD.</p>
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/15 p-5 sm:p-7">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-3.5 transition hover:bg-white/[0.04]">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-orange-500" />
                <span className="text-xs leading-5 text-white/60">Pročitao/la sam i prihvatam <a href="/uslovi-kupovine" target="_blank" rel="noreferrer" className="font-bold text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">Opšte uslove kupovine</a>, uključujući dostavu, reklamacije, odustanak i povraćaj sredstava.</span>
              </label>
              <div className="mt-4 overflow-hidden"><Turnstile onToken={setCaptchaToken} /></div>
              {error && <p role="alert" className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3.5 text-sm leading-5 text-red-100">{error}</p>}
              <button disabled={!accepted || !captchaToken || status === 'submitting'} className="group mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 font-black text-black shadow-[0_8px_28px_rgba(249,115,22,0.25)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none">
                {status === 'submitting' ? 'Priprema plaćanja…' : <>Nastavi na plaćanje <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" /></>}
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/35"><LockKeyhole className="size-3.5" /> Pogon ne čuva broj kartice ni sigurnosni kod</div>
              <a href="tel:+38169692345" className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-white/50 transition hover:text-white"><Phone className="size-3.5" /> Za veću porudžbinu pozovi +381 69 692 345</a>
              <nav aria-label="Informacije za kupce" className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 text-[11px] text-white/45">
                <a href="/informacije-o-trgovcu" className="underline hover:text-white">Podaci o trgovcu</a>
                <a href="/dostava" className="underline hover:text-white">Dostava</a>
                <a href="/reklamacije" className="underline hover:text-white">Reklamacije</a>
                <a href="/privatnost" className="underline hover:text-white">Privatnost</a>
                <a href="/bezbednost-placanja" className="underline hover:text-white">Bezbednost plaćanja</a>
              </nav>
            </div>
          </aside>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-black/40 lg:justify-start">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" /> Bezbedna obrada</span>
          <span className="inline-flex items-center gap-2"><MapPin className="size-4" /> Dostava širom Srbije</span>
          <span className="inline-flex items-center gap-2"><CreditCard className="size-4" /> Plaćanje u RSD</span>
        </div>
      </div>
    </main>
  );
}
