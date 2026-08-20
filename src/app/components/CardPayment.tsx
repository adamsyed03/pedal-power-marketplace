import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
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

// Bank-hosted NestPay flow. Pogon obtains only the signed transaction fields
// from its server and redirects the browser to Banca Intesa/NestPay. Card data
// is entered exclusively on the bank page and never reaches Pogon code.
export function CardPayment() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || '';
  const token = params.get('token') || '';
  const [prepared, setPrepared] = useState<PreparedPayment | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prepared || submitting) return;
    setSubmitting(true);
    setError('');

    // Submit only the exact server-prepared transaction fields. The hosted
    // NestPay page collects all card details after this redirect.
    const gateForm = document.createElement('form');
    gateForm.method = 'POST';
    gateForm.action = prepared.gateUrl;
    gateForm.hidden = true;
    for (const [name, value] of Object.entries(prepared.fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      gateForm.appendChild(input);
    }
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
            {prepared.mode === 'test' && (
              <p className="mt-1 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">TEST okruženje — zvaničnu testnu karticu unesite tek na sledećoj, bankarskoj stranici.</p>
            )}
          </dl>
        )}
        {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <PaymentBranding compact />
        {prepared && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="rounded-2xl border border-black/10 bg-[#f8f7f3] p-4 text-sm leading-6 text-black/65">
              Bićete preusmereni na zaštićenu Banca Intesa / NestPay stranicu. Podatke kartice unosite isključivo tamo; Pogon ih ne prima niti čuva.
            </div>
            <button disabled={submitting} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-orange-500 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40">
              {submitting ? 'Preusmeravanje na banku…' : 'Nastavi na bezbedno plaćanje'}
            </button>
            <p className="flex items-center justify-center gap-2 text-center text-[11px] text-black/40">
              <ShieldCheck className="size-3.5" /> Kartične podatke obrađuje isključivo Banca Intesa / NestPay.
            </p>
          </form>
        )}
        {!prepared && !error && <p className="mt-6 text-sm text-black/50">Priprema sigurnog plaćanja…</p>}
      </section>
    </main>
  );
}
