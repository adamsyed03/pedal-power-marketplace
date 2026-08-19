import { FormEvent, useEffect, useRef, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { detectCardType, isOfficialTestPan, normalizeExpiryMonth, normalizeExpiryYear } from '../../lib/nestpay';
import { PaymentBranding } from './PaymentBranding';

type PreparedPayment = {
  mode: string;
  orderId: string;
  totalRsd: number;
  installmentCount: number;
  gateUrl: string;
  fields: Record<string, string>;
};

const formatRsd = (value: number) => `${new Intl.NumberFormat('sr-RS').format(value)} RSD`;
const inputClassName = 'min-h-13 w-full rounded-2xl border border-black/10 bg-[#f8f7f3] px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/20 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10';

// Merchant-hosted card page for the NestPay 3D+API model. The transaction
// fields and hash come from the server; the card data entered here is POSTed
// by the browser directly to the Banca Intesa TEST NestPay gateway and never
// touches Pogon servers, storage or logs.
export function CardPayment() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || '';
  const token = params.get('token') || '';
  const [prepared, setPrepared] = useState<PreparedPayment | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!orderId || !token) { setError('Nedostaju podaci porudžbine.'); return; }
    fetch('/api/nestpay/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, token }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error || 'Priprema plaćanja nije uspela.');
        setPrepared(body);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Priprema plaćanja nije uspela.'));
  }, [orderId, token]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prepared || submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const pan = String(data.get('pan') || '').replace(/\s/g, '');
    const month = normalizeExpiryMonth(String(data.get('expMonth') || ''));
    const year = normalizeExpiryYear(String(data.get('expYear') || ''));
    const cvv = String(data.get('cv2') || '').trim();
    setError('');
    if (!/^\d{13,19}$/.test(pan)) { setError('Proverite broj kartice.'); return; }
    if (!month || !year) { setError('Proverite datum isteka kartice.'); return; }
    if (!/^\d{3,4}$/.test(cvv)) { setError('Proverite CVC/CVV kod.'); return; }
    if (prepared.mode === 'test' && !(await isOfficialTestPan(pan))) {
      setError('TEST okruženje prihvata isključivo zvanične testne kartice banke.');
      return;
    }
    setSubmitting(true);

    // Plain browser form POST straight to the gateway; server-prepared hidden
    // fields are submitted verbatim next to the card fields.
    const gateForm = document.createElement('form');
    gateForm.method = 'POST';
    gateForm.action = prepared.gateUrl;
    const append = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      gateForm.appendChild(input);
    };
    for (const [name, value] of Object.entries(prepared.fields)) append(name, value);
    append('pan', pan);
    append('cv2', cvv);
    append('Ecom_Payment_Card_ExpDate_Month', month);
    append('Ecom_Payment_Card_ExpDate_Year', year);
    const cardType = detectCardType(pan);
    if (cardType) append('cardType', cardType);
    document.body.appendChild(gateForm);
    gateForm.submit();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f2ed] px-5 py-12 text-[#171713]">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm font-bold text-black/50">← Pogon</a>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-black/50">
            <LockKeyhole className="size-4 text-emerald-700" /> Sigurno plaćanje
          </span>
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Plaćanje karticom</h1>
        {prepared && (
          <dl className="mt-5 grid gap-2 rounded-2xl bg-[#f8f7f3] p-4 text-sm">
            <div className="flex justify-between"><dt>Broj narudžbine</dt><dd className="font-bold">{prepared.orderId}</dd></div>
            <div className="flex justify-between"><dt>Iznos sa PDV-om</dt><dd className="font-black">{formatRsd(prepared.totalRsd)}</dd></div>
            {prepared.installmentCount > 1 && (
              <div className="flex justify-between"><dt>Broj rata</dt><dd className="font-bold">{prepared.installmentCount}</dd></div>
            )}
            {prepared.mode === 'test' && (
              <p className="mt-1 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">TEST okruženje — prihvataju se samo zvanične testne kartice.</p>
            )}
          </dl>
        )}
        {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <PaymentBranding compact />
        {prepared && (
          <form ref={formRef} onSubmit={submit} className="mt-6 space-y-4" autoComplete="off">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Broj kartice</span>
              <input name="pan" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" required maxLength={23} className={inputClassName} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Mesec</span>
                <input name="expMonth" inputMode="numeric" autoComplete="cc-exp-month" placeholder="MM" required maxLength={2} className={inputClassName} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Godina</span>
                <input name="expYear" inputMode="numeric" autoComplete="cc-exp-year" placeholder="GGGG" required maxLength={4} className={inputClassName} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold">CVC/CVV</span>
                <input name="cv2" inputMode="numeric" autoComplete="cc-csc" placeholder="123" required maxLength={4} className={inputClassName} />
              </label>
            </div>
            <button disabled={submitting} className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-orange-500 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40">
              {submitting ? 'Preusmeravanje na banku…' : 'Plati'}
            </button>
            <p className="flex items-center justify-center gap-2 text-center text-[11px] text-black/40">
              <ShieldCheck className="size-3.5" /> Podaci kartice se šalju šifrovano direktno banci (Banca Intesa / NestPay) i ne čuvaju se kod trgovca.
            </p>
          </form>
        )}
        {!prepared && !error && <p className="mt-6 text-sm text-black/50">Priprema sigurnog plaćanja…</p>}
      </section>
    </main>
  );
}
