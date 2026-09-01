import { Download, Gift, PackageCheck, ShoppingBag } from 'lucide-react';
import { PaidOrder } from '../../lib/supabase';

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const formatRsd = (value: number) => `${new Intl.NumberFormat('sr-RS').format(value)} RSD`;
const orderPrize = (order: PaidOrder) => order.items.find((item) => item.gamePrizeLabel)?.gamePrizeLabel ?? null;
const itemSummary = (order: PaidOrder) => order.items.length
  ? order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')
  : `${order.product} × ${order.quantity}`;
const deliveryLabel = (order: PaidOrder) => order.deliveryMethod === 'pickup'
  ? 'Lično preuzimanje · Save Maskovica 3, Beograd'
  : `Kurir · ${order.street}, ${order.postalCode} ${order.city}`;

export function AdminOrdersPanel({ orders, loading, error }: { orders: PaidOrder[]; loading: boolean; error?: string }) {
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalRsd || 0), 0);
  const prizeOrders = orders.filter((order) => orderPrize(order)).length;

  const exportCsv = () => {
    const rows = [
      ['Order ID', 'Paid/created date', 'Customer', 'Email', 'Phone', 'Items', 'Prize', 'Delivery', 'Total RSD', 'Transaction ID'],
      ...orders.map((order) => [
        order.orderId,
        order.transactionDate || order.createdAt,
        order.customerName,
        order.email,
        order.phone,
        itemSummary(order),
        orderPrize(order) || '',
        deliveryLabel(order),
        order.totalRsd,
        order.transactionId || '',
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pogon-paid-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-7 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-black text-[#7fff00]"><PackageCheck className="size-4.5" /></span>
            <div><h2 className="text-xl font-black tracking-tight">Completed orders</h2><p className="mt-0.5 text-xs text-black/45">Successfully paid orders only</p></div>
          </div>
        </div>
        <button type="button" onClick={exportCsv} disabled={!orders.length || Boolean(error)} className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-black/35 disabled:opacity-35"><Download className="size-4" />Export orders CSV</button>
      </header>

      <div className="grid gap-px border-b border-black/10 bg-black/10 sm:grid-cols-3">
        <div className="bg-white px-6 py-5"><p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-black/40">Paid orders</p><p className="mt-2 text-3xl font-black">{error ? '—' : orders.length.toLocaleString('sr-RS')}</p></div>
        <div className="bg-white px-6 py-5"><p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-black/40">Revenue</p><p className="mt-2 text-2xl font-black">{error ? '—' : formatRsd(totalRevenue)}</p></div>
        <div className="bg-white px-6 py-5"><p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-black/40">Orders with prize</p><p className="mt-2 text-3xl font-black">{error ? '—' : prizeOrders.toLocaleString('sr-RS')}</p></div>
      </div>

      {error ? (
        <div role="alert" className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-700">{error}</div>
      ) : !loading && orders.length === 0 ? (
        <div className="px-6 py-16 text-center"><ShoppingBag className="mx-auto size-10 text-black/20" /><h3 className="mt-4 text-xl font-bold">No completed orders yet</h3><p className="mt-2 text-sm text-black/45">Paid orders will appear here automatically.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1260px] border-collapse text-left">
            <thead><tr className="border-b border-black/10 bg-black/[0.025] text-[0.68rem] uppercase tracking-[0.16em] text-black/45"><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Items</th><th className="px-5 py-4">Prize</th><th className="px-5 py-4">Delivery</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4 text-right">Total</th></tr></thead>
            <tbody>{orders.map((order) => {
              const placed = new Date(order.transactionDate || order.createdAt);
              const prize = orderPrize(order);
              return (
                <tr key={order.orderId} className="border-b border-black/[0.07] align-top last:border-0 hover:bg-black/[0.02]">
                  <td className="px-5 py-5"><div className="font-mono text-xs font-bold">{order.orderId}</div><div className="mt-2 text-xs text-black/45">{placed.toLocaleDateString('sr-RS')} · {placed.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</div></td>
                  <td className="px-5 py-5"><div className="font-bold">{order.customerName}</div><a href={`tel:${order.phone}`} className="mt-1 block text-sm text-black/60 hover:text-black">{order.phone}</a><a href={`mailto:${order.email}`} className="mt-1 block text-xs text-black/45 hover:text-black">{order.email}</a></td>
                  <td className="px-5 py-5 text-sm"><div className="font-bold">{itemSummary(order)}</div><div className="mt-1 text-xs text-black/45">{order.installmentCount === 1 ? 'Jednokratno plaćanje' : `${order.installmentCount} rata`}</div></td>
                  <td className="px-5 py-5">{prize ? <span className="inline-flex items-center gap-2 rounded-full bg-[#7fff00]/20 px-3 py-2 text-xs font-black text-[#244d00]"><Gift className="size-4" />{prize}</span> : <span className="text-sm text-black/30">No prize</span>}</td>
                  <td className="max-w-64 px-5 py-5 text-sm text-black/60">{deliveryLabel(order)}</td>
                  <td className="px-5 py-5"><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">PAID</span>{order.transactionId && <div className="mt-2 max-w-40 truncate font-mono text-[0.65rem] text-black/35" title={order.transactionId}>{order.transactionId}</div>}</td>
                  <td className="px-5 py-5 text-right text-base font-black">{formatRsd(order.totalRsd)}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
