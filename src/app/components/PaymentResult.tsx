import { useEffect, useState } from 'react';

type PublicOrder = {
  orderId: string; status: string; product: string; quantity: number;
  unitPriceRsd: number; subtotalRsd?: number; totalRsd: number | null; installmentCount: number;
  items?: { product: string; name: string; quantity: number; unitPriceRsd: number; lineTotalRsd: number; originalUnitPriceRsd?: number; discountRsd?: number; promoCode?: string }[];
  customer: { name: string; email: string; address: string; deliveryAddress?: string };
  merchant: { legalName: string; pib: string; address: string };
  authCode?: string; transactionId?: string; response?: string;
  procReturnCode?: string; mdStatus?: string; transactionDate?: string;
  attemptedAt?: string;
  deliveryMethod?: string; deliveryFeeRsd?: number | null;
};

const formatRsd = (value: number) => `${new Intl.NumberFormat('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} RSD`;
const available = (value?: string | null) => value || 'Nije dostupno';

export function PaymentResult() {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState('');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || '';
  const token = params.get('token') || '';

  useEffect(() => {
    if (!orderId || !token) { setError('Nedostaju podaci za proveru porudžbine.'); return; }
    fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error || 'Status nije dostupan.');
        setOrder(body);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Status nije dostupan.'));
  }, [orderId, token]);

  const paid = order?.status === 'PAID';
  const declined = order?.status === 'DECLINED';
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f2ed] px-5 py-12">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <a href="/" className="text-sm font-bold text-black/50">← Pogon</a>
        <h1 className="mt-6 text-4xl font-black">
          {paid ? 'Plaćanje je uspešno' : declined ? 'Plaćanje nije uspelo' : 'Provera statusa plaćanja'}
        </h1>
        <p className="mt-3 text-black/60">
          {paid
            ? 'Uspešno ste izvršili plaćanje – račun Vaše platne kartice je zadužen.'
            : declined
            ? 'Plaćanje neuspešno – račun Vaše platne kartice nije zadužen.'
            : 'Ne možemo još pouzdano da potvrdimo da li je račun kartice zadužen. Ne pokušavajte ponovo dok se provera ne završi.'}
        </p>
        {error && <p role="alert" className="mt-6 rounded-2xl bg-amber-50 p-4 text-amber-900">{error}</p>}
        {order && (
          <div className="mt-8 space-y-8 border-t border-black/10 pt-6 text-sm">
            <section><h2 className="text-lg font-black">Podaci o porudžbini</h2><dl className="mt-3 grid gap-3">
              <div className="flex justify-between gap-6"><dt>Broj narudžbine</dt><dd className="break-all text-right font-bold">{order.orderId}</dd></div>
              {(order.items?.length ? order.items : [{ product: order.product, name: order.product, quantity: order.quantity, unitPriceRsd: order.unitPriceRsd, lineTotalRsd: order.unitPriceRsd * order.quantity }]).map((item) => <div key={item.product} className="rounded-xl bg-black/[0.03] p-3"><div className="flex justify-between gap-4"><dt>{item.name}</dt><dd className="font-bold">{item.quantity} × {formatRsd(item.unitPriceRsd)}</dd></div>{item.discountRsd ? <p className="mt-1 text-right font-bold text-emerald-700">Popust ({item.promoCode}): −{formatRsd(item.discountRsd)}</p> : null}<p className="mt-1 text-right text-black/50">Ukupno: {formatRsd(item.lineTotalRsd)}</p></div>)}
              <div className="flex justify-between gap-6"><dt>Proizvodi sa PDV-om</dt><dd className="font-bold">{formatRsd(order.subtotalRsd ?? order.unitPriceRsd * order.quantity)}</dd></div>
              <div className="flex justify-between gap-6"><dt>PDV / Porez</dt><dd className="text-right font-bold">PDV je uračunat u prikazane cene.</dd></div>
              <div className="flex justify-between gap-6"><dt>Dostava</dt><dd className="text-right font-bold">{order.deliveryMethod === 'pickup' ? 'Lično preuzimanje — bez naknade' : order.deliveryFeeRsd != null ? formatRsd(order.deliveryFeeRsd) : 'Obračunava se posebno'}</dd></div>
              <div className="flex justify-between gap-6"><dt>Ukupno za plaćanje</dt><dd className="font-bold">{order.totalRsd != null ? formatRsd(order.totalRsd) : 'Nije dostupno'}</dd></div>
              <div className="flex justify-between gap-6"><dt>Broj rata</dt><dd className="font-bold">{order.installmentCount}</dd></div>
            </dl></section>
            <section><h2 className="text-lg font-black">Podaci o kupcu</h2><dl className="mt-3 grid gap-3">
              <div className="flex justify-between gap-6"><dt>Ime i prezime</dt><dd className="text-right font-bold">{order.customer.name}</dd></div>
              <div className="flex justify-between gap-6"><dt>Email</dt><dd className="break-all text-right font-bold">{order.customer.email}</dd></div>
              <div className="flex justify-between gap-6"><dt>Adresa kupca</dt><dd className="text-right font-bold">{order.customer.address}</dd></div>
              {order.customer.deliveryAddress && <div className="flex justify-between gap-6"><dt>{order.deliveryMethod === 'pickup' ? 'Adresa preuzimanja' : 'Adresa isporuke'}</dt><dd className="text-right font-bold">{order.customer.deliveryAddress}</dd></div>}
            </dl></section>
            <section><h2 className="text-lg font-black">Podaci o transakciji</h2><dl className="mt-3 grid gap-3">
              <div className="flex justify-between gap-6"><dt>Autorizacioni kod</dt><dd>{available(order.authCode)}</dd></div>
              <div className="flex justify-between gap-6"><dt>Broj transakcije</dt><dd>{available(order.transactionId)}</dd></div>
              <div className="flex justify-between gap-6"><dt>Response</dt><dd>{available(order.response)}</dd></div>
              <div className="flex justify-between gap-6"><dt>ProcReturnCode</dt><dd>{available(order.procReturnCode)}</dd></div>
              <div className="flex justify-between gap-6"><dt>mdStatus</dt><dd>{available(order.mdStatus)}</dd></div>
              <div className="flex justify-between gap-6"><dt>EXTRA.TRXDATE</dt><dd>{available(order.transactionDate)}</dd></div>
              <div className="flex justify-between gap-6"><dt>Datum i vreme pokušaja</dt><dd>{available(order.attemptedAt || order.transactionDate)}</dd></div>
            </dl></section>
            <section><h2 className="text-lg font-black">Podaci o trgovcu</h2><p className="mt-3">{order.merchant.legalName} · PIB {order.merchant.pib} · {order.merchant.address}</p></section>
          </div>
        )}
      </section>
    </main>
  );
}
