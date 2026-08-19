import { useEffect, useState } from 'react';

type PublicOrder = {
  orderId: string; status: string; product: string; quantity: number;
  unitPriceRsd: number; subtotalRsd?: number; totalRsd: number | null; installmentCount: number;
  authCode?: string; transactionId?: string; response?: string;
  procReturnCode?: string; mdStatus?: string; transactionDate?: string;
  deliveryMethod?: string; deliveryFeeRsd?: number | null;
};

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
          <dl className="mt-8 grid gap-3 border-t border-black/10 pt-6 text-sm">
            <div className="flex justify-between"><dt>Broj narudžbine</dt><dd className="font-bold">{order.orderId}</dd></div>
            <div className="flex justify-between"><dt>Proizvod</dt><dd className="font-bold">{order.product} × {order.quantity}</dd></div>
            <div className="flex justify-between"><dt>Proizvodi sa PDV-om</dt><dd className="font-bold">{new Intl.NumberFormat('sr-RS').format(order.subtotalRsd ?? order.unitPriceRsd * order.quantity)} RSD</dd></div>
            <div className="flex justify-between"><dt>Dostava</dt><dd className="font-bold">{order.deliveryMethod === 'pickup' ? 'Lično preuzimanje' : order.deliveryFeeRsd != null ? `${new Intl.NumberFormat('sr-RS').format(order.deliveryFeeRsd)} RSD` : 'Obračunava se posebno'}</dd></div>
            {order.totalRsd != null && <div className="flex justify-between"><dt>Ukupno za plaćanje</dt><dd className="font-bold">{new Intl.NumberFormat('sr-RS').format(order.totalRsd)} RSD</dd></div>}
            {order.installmentCount > 1 && <div className="flex justify-between"><dt>Broj rata</dt><dd className="font-bold">{order.installmentCount}</dd></div>}
            {order.authCode && <div className="flex justify-between"><dt>Autorizacioni kod</dt><dd>{order.authCode}</dd></div>}
            {order.transactionId && <div className="flex justify-between"><dt>Broj transakcije</dt><dd>{order.transactionId}</dd></div>}
            {order.response && <div className="flex justify-between"><dt>Status transakcije</dt><dd>{order.response}</dd></div>}
            {order.procReturnCode && <div className="flex justify-between"><dt>Kod statusa transakcije</dt><dd>{order.procReturnCode}</dd></div>}
            {order.mdStatus && <div className="flex justify-between"><dt>Statusni kod 3D transakcije</dt><dd>{order.mdStatus}</dd></div>}
            {order.transactionDate && <div className="flex justify-between"><dt>Datum transakcije</dt><dd>{order.transactionDate}</dd></div>}
          </dl>
        )}
      </section>
    </main>
  );
}
