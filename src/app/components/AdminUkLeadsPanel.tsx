import { Download, Flag, Mail, Phone } from 'lucide-react';
import type { UkLead } from '../../lib/supabase';

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const formatPrice = (value: number | null) => value ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value) : '—';
const timeframeLabel = (value: string | null) => ({
  'as-soon-as-available': 'As soon as available',
  '0-3-months': 'Within 3 months',
  '3-6-months': '3–6 months',
  '6-12-months': '6–12 months',
  researching: 'Researching',
}[value ?? ''] ?? '—');

export function AdminUkLeadsPanel({ leads, loading, error }: { leads: UkLead[]; loading: boolean; error?: string }) {
  const exportCsv = () => {
    const rows = [
      ['Submitted', 'Lead type', 'Model', 'Displayed GBP price', 'Name', 'Email', 'Phone', 'UK postcode', 'Purchase timeframe', 'Interested at price', 'Marketing consent', 'Page', 'UTM source', 'UTM medium', 'UTM campaign', 'Message'],
      ...leads.map((lead) => [lead.created_at, lead.lead_type, lead.model_interest, lead.displayed_price_gbp, lead.name, lead.email, lead.phone, lead.postcode, timeframeLabel(lead.purchase_timeframe), lead.price_interest ? 'Yes' : 'No', lead.marketing_consent ? 'Yes' : 'No', lead.page_path, lead.utm_source, lead.utm_medium, lead.utm_campaign, lead.message]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pogon-uk-landing-page-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="uk-landing-page-leads" aria-labelledby="uk-leads-heading" className="mt-7 scroll-mt-6 overflow-hidden rounded-3xl border-2 border-[#7fff00] bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-black/10 bg-black px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#7fff00] text-black"><Flag className="size-5" /></span><div><h2 id="uk-leads-heading" className="text-xl font-black tracking-tight">UK landing page</h2><p className="mt-0.5 text-xs text-white/55">UK enquiries only · stored separately from Serbian leads and orders</p></div></div>
        <button type="button" onClick={exportCsv} disabled={!leads.length || Boolean(error)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:opacity-35"><Download className="size-4" />Export UK CSV</button>
      </header>

      {error ? <div className="p-6 text-sm font-semibold text-red-700">{error}</div> : loading && leads.length === 0 ? <div className="p-8 text-sm text-black/45">Loading UK enquiries…</div> : leads.length === 0 ? <div className="p-8 text-sm text-black/45">No UK landing page enquiries yet.</div> : (
        <div className="max-h-[34rem] overflow-auto">
          <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr><th className="border-b border-r border-slate-300 px-3 py-3">Submitted</th><th className="border-b border-r border-slate-300 px-3 py-3">Model / price</th><th className="border-b border-r border-slate-300 px-3 py-3">Customer</th><th className="border-b border-r border-slate-300 px-3 py-3">Contact</th><th className="border-b border-r border-slate-300 px-3 py-3">Postcode</th><th className="border-b border-r border-slate-300 px-3 py-3">Timing</th><th className="border-b border-r border-slate-300 px-3 py-3">At price</th><th className="border-b border-r border-slate-300 px-3 py-3">Campaign</th><th className="border-b border-slate-300 px-3 py-3">Source</th></tr></thead>
            <tbody>{leads.map((lead) => <tr key={lead.id} className="border-b border-slate-200 align-top hover:bg-lime-50/50"><td className="border-r border-slate-200 px-3 py-3 whitespace-nowrap"><div className="font-semibold">{new Date(lead.created_at).toLocaleDateString('en-GB')}</div><div className="text-xs text-black/40">{new Date(lead.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div></td><td className="border-r border-slate-200 px-3 py-3"><div className="font-black capitalize">{lead.model_interest}</div><div className="text-xs text-black/45">{formatPrice(lead.displayed_price_gbp)} · {lead.lead_type === 'fold-notify' ? 'Notify' : 'Interest'}</div></td><td className="border-r border-slate-200 px-3 py-3 font-semibold">{lead.name || 'Email notification'}</td><td className="border-r border-slate-200 px-3 py-3"><div className="space-y-1">{lead.email ? <a className="flex items-center gap-1.5 text-blue-700 underline" href={`mailto:${lead.email}`}><Mail className="size-3" />{lead.email}</a> : null}{lead.phone ? <a className="flex items-center gap-1.5 text-blue-700 underline" href={`tel:${lead.phone}`}><Phone className="size-3" />{lead.phone}</a> : null}</div></td><td className="border-r border-slate-200 px-3 py-3 font-semibold">{lead.postcode || '—'}</td><td className="border-r border-slate-200 px-3 py-3">{timeframeLabel(lead.purchase_timeframe)}</td><td className="border-r border-slate-200 px-3 py-3 font-bold">{lead.price_interest ? 'Yes' : '—'}</td><td className="border-r border-slate-200 px-3 py-3 text-xs"><div>{lead.utm_source || 'Direct'}</div><div className="text-black/40">{lead.utm_medium || '—'} · {lead.utm_campaign || '—'}</div></td><td className="px-3 py-3"><span className="rounded-full bg-black px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-wide text-[#7fff00]">UK landing page</span><div className="mt-2 text-xs text-black/40">{lead.page_path}</div></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
