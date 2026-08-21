import { useEffect, useRef, useState } from 'react';
import { LockKeyhole } from 'lucide-react';

type PreparedPayment = {
  mode: string;
  orderId: string;
  totalRsd: number;
  installmentCount: number;
  gateUrl: string;
  fields: Record<string, string>;
};

const formatRsd = (value: number) => `${new Intl.NumberFormat('sr-RS').format(value)} RSD`;

// Pogon prepares only the non-card transaction fields. The browser immediately
// POSTs them unchanged to Banca Intesa / NestPay, where the customer enters all
// card data on the bank-hosted HPP page.
export function CardPayment() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || '';
  const token = params.get('token') || '';
  const [prepared, setPrepared] = useState<PreparedPayment | null>(null);
  const [error, setError] = useState('');
  const submittedRef = useRef(false);

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

  useEffect(() => {
    if (!prepared || submittedRef.current) return;
    submittedRef.current = true;
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
  }, [prepared]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f2ed] px-5 py-12 text-[#171713]">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm font-bold text-black/50">← Pogon</a>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-black/50">
            <LockKeyhole className="size-4 text-emerald-700" /> Sigurno plaćanje
          </span>
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Preusmeravanje na banku</h1>
        {prepared && (
          <dl className="mt-5 grid gap-2 rounded-2xl bg-[#f8f7f3] p-4 text-sm">
            <div className="flex justify-between gap-4"><dt>Broj narudžbine</dt><dd className="font-bold">{prepared.orderId}</dd></div>
            <div className="flex justify-between gap-4"><dt>Iznos sa PDV-om</dt><dd className="font-black">{formatRsd(prepared.totalRsd)}</dd></div>
          </dl>
        )}
        {error ? (
          <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p>
        ) : (
          <p className="mt-6 text-sm leading-6 text-black/60">
            Preusmeravamo Vas na zaštićenu Banca Intesa / NestPay stranicu. Podatke platne kartice unosite isključivo na stranici banke.
          </p>
        )}
      </section>
    </main>
  );
}
