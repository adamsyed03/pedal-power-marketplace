import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Check, Download, Lock, LogOut, RefreshCw, Users } from 'lucide-react';
import { fetchLeads, Lead, signInAdmin, SUPABASE_ADMIN_EMAIL, updateLead } from '../../lib/supabase';

const ADMIN_TOKEN_KEY = 'pogon_supabase_admin_token';
const escapeCsv = (value: string) => `"${String(value).replace(/"/g, '""')}"`;

export function AdminLeads() {
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [saveState, setSaveState] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      setLeads(await fetchLeads(accessToken));
      setLoginError('');
    } catch {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setAccessToken('');
      setLoginError('Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const token = await signInAdmin(password);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      setAccessToken(token);
      setPassword('');
    } catch {
      setLoginError('Incorrect password or the Supabase admin user has not been created yet.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setAccessToken('');
    setLeads([]);
  };

  const editLead = (id: string, changes: Partial<Lead>) => {
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...changes } : lead));
  };

  const saveLeadField = async (
    id: string,
    changes: Partial<Pick<Lead, 'city' | 'country' | 'date_contacted' | 'comment'>>,
  ) => {
    setSaveState((current) => ({ ...current, [id]: 'saving' }));
    try {
      await updateLead(accessToken, id, changes);
      setSaveState((current) => ({ ...current, [id]: 'saved' }));
      window.setTimeout(() => setSaveState((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      }), 1800);
    } catch {
      setSaveState((current) => ({ ...current, [id]: 'error' }));
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Name', 'Phone', 'Submitted date', 'Submitted time', 'City', 'Country', 'Date contacted', 'Comment', 'Source', 'Language'],
      ...leads.map((lead) => {
        const submitted = new Date(lead.created_at);
        return [lead.name, lead.phone, submitted.toLocaleDateString('sr-RS'), submitted.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }), lead.city ?? '', lead.country ?? '', lead.date_contacted ?? '', lead.comment ?? '', lead.source, lead.language.toUpperCase()];
      }),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pogon-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!accessToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f4f2] p-4 text-[#111]">
        <section className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-7 shadow-xl sm:p-9">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-black text-[#7fff00]"><Lock className="size-5" /></div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Pogon Admin</h1>
          <p className="mt-2 text-sm text-black/50">Secure login for {SUPABASE_ADMIN_EMAIL}</p>
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-black/55">
              Password
              <input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 w-full rounded-xl border border-black/15 bg-black/[0.025] px-4 py-3 text-base font-normal normal-case tracking-normal outline-none focus:border-black/50" />
            </label>
            {loginError && <p role="alert" className="text-sm font-medium text-red-600">{loginError}</p>}
            <button type="submit" disabled={loading || !password} className="w-full rounded-full bg-black px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-40">{loading ? 'Logging in…' : 'Log in'}</button>
          </form>
          <a href="/" className="mt-6 block text-center text-sm font-bold text-black/40 hover:text-black">← Back to website</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f2] px-4 py-8 text-[#111] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white"><Users className="size-4 text-[#7fff00]" />Admin</div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Sales CRM</h1>
            <p className="mt-2 text-sm text-black/55">Shared Supabase database · {leads.length} {leads.length === 1 ? 'lead' : 'leads'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold disabled:opacity-40"><RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
            <button type="button" onClick={exportCsv} disabled={!leads.length} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-35"><Download className="size-4" />Export CSV</button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-bold"><LogOut className="size-4" /><span className="hidden sm:inline">Log out</span></button>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          {!loading && leads.length === 0 ? (
            <div className="px-6 py-20 text-center"><Users className="mx-auto size-10 text-black/20" /><h2 className="mt-4 text-xl font-bold">No leads yet</h2><p className="mt-2 text-sm text-black/45">New submissions from every device will appear here.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1480px] border-collapse text-left">
                <thead><tr className="border-b border-black/10 bg-black/[0.025] text-[0.68rem] uppercase tracking-[0.16em] text-black/45"><th className="px-5 py-4">Name</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Submitted</th><th className="px-5 py-4">City</th><th className="px-5 py-4">Country</th><th className="px-5 py-4">Date contacted</th><th className="px-5 py-4">Comment</th><th className="px-5 py-4">Source</th><th className="px-5 py-4">Save</th></tr></thead>
                <tbody>{leads.map((lead) => { const submitted = new Date(lead.created_at); return (
                  <tr key={lead.id} className="border-b border-black/[0.07] align-top last:border-0 hover:bg-black/[0.02]">
                    <td className="px-5 py-5"><div className="font-bold">{lead.name}</div><div className="mt-1 text-[0.65rem] font-bold text-black/35">{lead.language.toUpperCase()}</div></td>
                    <td className="px-5 py-5"><a href={`tel:${lead.phone}`} className="font-medium text-black/70 hover:text-black">{lead.phone}</a></td>
                    <td className="px-5 py-5 text-sm text-black/60"><div>{submitted.toLocaleDateString('sr-RS')}</div><div className="mt-1 text-xs text-black/35">{submitted.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</div></td>
                    <td className="px-3 py-3"><input value={lead.city ?? ''} onChange={(event) => editLead(lead.id, { city: event.target.value })} onBlur={() => void saveLeadField(lead.id, { city: lead.city?.trim() || null })} placeholder="Add city" className="w-full rounded-xl border border-black/10 bg-black/[0.025] px-3 py-2.5 text-sm outline-none focus:border-black/30 focus:bg-white" /></td>
                    <td className="px-3 py-3"><input value={lead.country ?? ''} onChange={(event) => editLead(lead.id, { country: event.target.value })} onBlur={() => void saveLeadField(lead.id, { country: lead.country?.trim() || null })} placeholder="Add country" className="w-full rounded-xl border border-black/10 bg-black/[0.025] px-3 py-2.5 text-sm outline-none focus:border-black/30 focus:bg-white" /></td>
                    <td className="px-3 py-3"><input type="date" value={lead.date_contacted ?? ''} onChange={(event) => { editLead(lead.id, { date_contacted: event.target.value || null }); void saveLeadField(lead.id, { date_contacted: event.target.value || null }); }} className="w-full rounded-xl border border-black/10 bg-black/[0.025] px-3 py-2.5 text-sm outline-none focus:border-black/30 focus:bg-white" /></td>
                    <td className="px-3 py-3"><textarea value={lead.comment ?? ''} onChange={(event) => editLead(lead.id, { comment: event.target.value })} onBlur={() => void saveLeadField(lead.id, { comment: lead.comment?.trim() || null })} placeholder="Add sales note…" rows={2} className="w-full min-w-64 resize-y rounded-xl border border-black/10 bg-black/[0.025] px-3 py-2.5 text-sm outline-none focus:border-black/30 focus:bg-white" /></td>
                    <td className="px-5 py-5"><span className="rounded-full bg-black/5 px-3 py-1.5 text-xs text-black/60">{lead.source}</span></td>
                    <td className="px-5 py-5 text-xs font-bold"><span className={`inline-flex items-center gap-1.5 ${saveState[lead.id] === 'error' ? 'text-red-600' : 'text-black/40'}`}>{saveState[lead.id] === 'saving' && <RefreshCw className="size-3.5 animate-spin" />}{saveState[lead.id] === 'saved' && <Check className="size-3.5 text-green-600" />}{saveState[lead.id] === 'saving' ? 'Saving' : saveState[lead.id] === 'saved' ? 'Saved' : saveState[lead.id] === 'error' ? 'Retry' : 'Auto'}</span></td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          )}
        </section>
        <a href="/" className="mt-6 inline-flex text-sm font-bold text-black/50 hover:text-black">← Back to website</a>
      </div>
    </main>
  );
}
