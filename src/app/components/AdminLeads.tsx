import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, CalendarCheck, Check, Download, FilterX, Lock, LogOut, PackageCheck, Plus, RefreshCw, Target, Users, X } from 'lucide-react';
import { AdminSession, createLead, fetchLeads, fetchPaidOrders, Lead, PaidOrder, refreshAdminSession, signInAdmin, SUPABASE_ADMIN_EMAIL, updateLead } from '../../lib/supabase';
import { AdminOrdersPanel } from './AdminOrdersPanel';

const ADMIN_SESSION_KEY = 'pogon_supabase_admin_session';
const escapeXml = (value: string | null | undefined) => String(value ?? '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const TODO_OPTIONS = ['Call', 'WhatsApp', 'Email', 'Test ride', 'Follow up', 'Send offer', 'Service', 'Done'] as const;
const MEDIUM_OPTIONS = ['Phone', 'WhatsApp', 'Website', 'Instagram', 'Email', 'Viber', 'Other'] as const;
const STAGE_OPTIONS = ['New', 'Contacted', 'Qualified', 'Test ride', 'Offer', 'Negotiation', 'Won', 'Lost'] as const;
type LeadColumn = 'name' | 'city' | 'todo' | 'phone' | 'date_contacted' | 'medium' | 'stage' | 'comment';
type SortableLeadColumn = LeadColumn | 'updated_at';
type LeadFilters = Record<LeadColumn, string>;
type ManualLeadForm = Record<'name' | 'phone' | 'city' | 'todo' | 'date_contacted' | 'medium' | 'stage' | 'comment', string>;

const EMPTY_FILTERS: LeadFilters = {
  name: '', city: '', todo: '', phone: '', date_contacted: '', medium: '', stage: '', comment: '',
};
const EMPTY_MANUAL_LEAD: ManualLeadForm = {
  name: '', phone: '', city: '', todo: '', date_contacted: '', medium: '', stage: '', comment: '',
};

const normalized = (value: string | null | undefined) => (value ?? '').trim().toLocaleLowerCase('sr-RS');

const inferredMedium = (lead: Lead) => {
  if (lead.medium) return lead.medium;
  const source = normalized(lead.source);
  if (source.includes('whatsapp')) return 'WhatsApp';
  if (source.includes('instagram')) return 'Instagram';
  if (source.includes('viber')) return 'Viber';
  if (source.includes('phone') || source.includes('call')) return 'Phone';
  if (source.includes('email')) return 'Email';
  return 'Website';
};

const leadValue = (lead: Lead, column: SortableLeadColumn) => {
  if (column === 'medium') return inferredMedium(lead);
  return lead[column] ?? '';
};

const savedTimestamp = (value: string) => {
  const saved = new Date(value);
  if (Number.isNaN(saved.getTime())) return { label: 'Unknown time', title: '' };
  return {
    label: `${saved.toLocaleDateString('sr-RS')} ${saved.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}`,
    title: saved.toLocaleString('sr-RS'),
  };
};

const readStoredSession = (): AdminSession | null => {
  try {
    const value = localStorage.getItem(ADMIN_SESSION_KEY);
    return value ? JSON.parse(value) as AdminSession : null;
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

const storeSession = (session: AdminSession) => {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export function AdminLeads() {
  const [session, setSession] = useState<AdminSession | null>(readStoredSession);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [paidOrders, setPaidOrders] = useState<PaidOrder[]>([]);
  const [paidOrdersError, setPaidOrdersError] = useState('');
  const [saveState, setSaveState] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<{ column: SortableLeadColumn; direction: 'asc' | 'desc' } | null>(null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [manualLead, setManualLead] = useState<ManualLeadForm>(EMPTY_MANUAL_LEAD);
  const [createState, setCreateState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [createError, setCreateError] = useState('');
  const totals = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const contacted = leads.filter((lead) => Boolean(lead.date_contacted)).length;
    const newToday = leads.filter((lead) => new Date(lead.created_at).getTime() >= startOfToday).length;

    return [
      { label: 'Total leads', value: leads.length.toLocaleString('sr-RS'), icon: Users },
      { label: 'New today', value: newToday.toLocaleString('sr-RS'), icon: Target },
      { label: 'Contacted', value: contacted.toLocaleString('sr-RS'), icon: CalendarCheck },
      { label: 'Open follow-ups', value: Math.max(0, leads.length - contacted).toLocaleString('sr-RS'), icon: RefreshCw },
    ];
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const filtered = leads.filter((lead) => (Object.entries(filters) as [LeadColumn, string][]).every(([column, query]) => {
      if (!query) return true;
      const value = normalized(String(leadValue(lead, column)));
      return column === 'date_contacted' || column === 'todo' || column === 'medium' || column === 'stage'
        ? value === normalized(query)
        : value.includes(normalized(query));
    }));

    if (!sort) return filtered;
    return [...filtered].sort((left, right) => {
      if (sort.column === 'updated_at') {
        const comparison = new Date(left.updated_at).getTime() - new Date(right.updated_at).getTime();
        return sort.direction === 'asc' ? comparison : -comparison;
      }
      const leftValue = normalized(String(leadValue(left, sort.column)));
      const rightValue = normalized(String(leadValue(right, sort.column)));
      const comparison = leftValue.localeCompare(rightValue, 'sr', { numeric: true, sensitivity: 'base' });
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [filters, leads, sort]);

  const hasFilters = Object.values(filters).some(Boolean);

  const updateFilter = (column: LeadColumn, value: string) => {
    setFilters((current) => ({ ...current, [column]: value }));
  };

  const sortBy = (column: SortableLeadColumn) => {
    setSort((current) => current?.column === column
      ? { column, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { column, direction: column === 'updated_at' ? 'desc' : 'asc' });
  };

  const getActiveSession = useCallback(async () => {
    if (!session) throw new Error('No admin session.');
    if (session.expires_at * 1000 > Date.now() + 60_000) return session;

    const renewed = await refreshAdminSession(session.refresh_token);
    storeSession(renewed);
    setSession(renewed);
    return renewed;
  }, [session]);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const activeSession = await getActiveSession();
      setLeads(await fetchLeads(activeSession.access_token));
      try {
        setPaidOrders(await fetchPaidOrders(activeSession.access_token));
        setPaidOrdersError('');
      } catch (cause) {
        if (cause instanceof Error && cause.message === 'ADMIN_SESSION_EXPIRED') throw cause;
        setPaidOrdersError(cause instanceof Error && cause.message === 'ADMIN_ORDERS_API_NOT_RUNNING'
          ? 'The orders API is not running in this preview. Open the deployed admin or use npm run dev:fullstack.'
          : 'Completed orders could not be loaded. Try Refresh again.');
      }
      setLoginError('');
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setSession(null);
      setLoginError('Your login could not be renewed. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, [getActiveSession, session]);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const newSession = await signInAdmin(password);
      storeSession(newSession);
      setSession(newSession);
      setPassword('');
    } catch {
      setLoginError('Incorrect password or the Supabase admin user has not been created yet.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setSession(null);
    setLeads([]);
    setPaidOrders([]);
    setPaidOrdersError('');
  };

  const scrollToOrders = () => {
    const ordersSection = document.getElementById('completed-orders');
    if (!ordersSection) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    ordersSection.scrollIntoView({ behavior, block: 'start' });
    ordersSection.focus({ preventScroll: true });
  };

  const editLead = (id: string, changes: Partial<Lead>) => {
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...changes } : lead));
  };

  const saveLeadField = async (
    id: string,
    changes: Partial<Pick<Lead, 'city' | 'todo' | 'medium' | 'stage' | 'date_contacted' | 'comment'>>,
  ) => {
    setSaveState((current) => ({ ...current, [id]: 'saving' }));
    try {
      const activeSession = await getActiveSession();
      const updated = await updateLead(activeSession.access_token, id, changes);
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...changes, updated_at: updated.updated_at } : lead));
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

  const handleCreateLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateState('saving');
    setCreateError('');
    try {
      const activeSession = await getActiveSession();
      const created = await createLead(activeSession.access_token, {
        name: manualLead.name.trim(),
        phone: manualLead.phone.trim(),
        city: manualLead.city.trim() || null,
        todo: manualLead.todo || null,
        date_contacted: manualLead.date_contacted || null,
        medium: manualLead.medium || null,
        stage: manualLead.stage || null,
        comment: manualLead.comment.trim() || null,
      });
      setLeads((current) => [created, ...current]);
      setSaveState((current) => ({ ...current, [created.id]: 'saved' }));
      setManualLead(EMPTY_MANUAL_LEAD);
      setCreateState('idle');
      setIsAddingLead(false);
      setSort({ column: 'updated_at', direction: 'desc' });
    } catch (cause) {
      setCreateState('error');
      setCreateError(cause instanceof Error ? cause.message : 'The lead could not be added.');
    }
  };

  const exportExcel = () => {
    const rows = [
      ['Customer', 'City', 'To-do', 'Contact No', 'Contact Date', 'Medium', 'Stage', 'Comment', 'Last saved date', 'Last saved time', 'Submitted date', 'Submitted time', 'Source', 'Language'],
      ...visibleLeads.map((lead) => {
        const submitted = new Date(lead.created_at);
        const saved = new Date(lead.updated_at);
        return [lead.name, lead.city ?? '', lead.todo ?? '', lead.phone, lead.date_contacted ?? '', inferredMedium(lead), lead.stage ?? '', lead.comment ?? '', saved.toLocaleDateString('sr-RS'), saved.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }), submitted.toLocaleDateString('sr-RS'), submitted.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }), lead.source, lead.language.toUpperCase()];
      }),
    ];
    const columnWidths = [150, 95, 95, 110, 100, 90, 90, 360, 100, 80, 100, 80, 100, 65];
    const worksheetRows = rows.map((row, rowIndex) => `<Row${rowIndex === 0 ? ' ss:StyleID="Header"' : ''}>${row.map((value) => `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`).join('')}</Row>`).join('');
    const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top"/><Font ss:FontName="Aptos" ss:Size="10"/></Style>
    <Style ss:ID="Header"><Alignment ss:Vertical="Center"/><Font ss:FontName="Aptos Display" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#111827" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="CRM Leads">
    <Table ss:ExpandedColumnCount="${rows[0].length}" ss:ExpandedRowCount="${rows.length}" x:FullColumns="1" x:FullRows="1">
      ${columnWidths.map((width) => `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`).join('')}
      ${worksheetRows}
    </Table>
    <x:WorksheetOptions><x:Selected/><x:FreezePanes/><x:FrozenNoSplit/><x:SplitHorizontal>1</x:SplitHorizontal><x:TopRowBottomPane>1</x:TopRowBottomPane><x:ActivePane>2</x:ActivePane></x:WorksheetOptions>
    <x:AutoFilter x:Range="R1C1:R${rows.length}C${rows[0].length}"/>
  </Worksheet>
</Workbook>`;
    const url = URL.createObjectURL(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pogon-leads-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const columnHeader = (column: SortableLeadColumn, label: string) => (
    <button type="button" onClick={() => sortBy(column)} className="flex w-full items-center justify-between gap-2 px-2 py-2 text-left font-semibold text-slate-700 hover:bg-slate-100" title={`Sort by ${label}`}>
      <span>{label}</span>
      <ArrowUpDown className={`size-3 shrink-0 ${sort?.column === column ? 'text-blue-700' : 'text-slate-400'}`} />
    </button>
  );

  const filterInputClass = 'h-8 w-full border-0 bg-white px-2 text-xs font-normal text-slate-700 outline-none placeholder:text-slate-400 focus:bg-blue-50';
  const cellInputClass = 'h-9 w-full min-w-0 border border-transparent bg-transparent px-2 text-sm text-slate-800 outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white';
  const cellSelectClass = `${cellInputClass} cursor-pointer appearance-auto`;

  if (!session) {
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
      <div className="mx-auto max-w-[1900px]">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white"><Users className="size-4 text-[#7fff00]" />Admin</div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Sales CRM</h1>
            <p className="mt-2 text-sm text-black/55">Shared Supabase database · {leads.length} {leads.length === 1 ? 'lead' : 'leads'} · {paidOrders.length} paid {paidOrders.length === 1 ? 'order' : 'orders'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={scrollToOrders} aria-controls="completed-orders" className="inline-flex items-center gap-2 rounded-full bg-[#7fff00] px-5 py-3 text-sm font-black text-black shadow-sm transition hover:bg-[#70e600]"><PackageCheck className="size-4" />Completed orders<span className="rounded-full bg-black px-2 py-0.5 text-xs text-[#7fff00]">{paidOrdersError ? '!' : paidOrders.length}</span></button>
            <button type="button" onClick={() => { setIsAddingLead((current) => !current); setCreateError(''); }} aria-expanded={isAddingLead} aria-controls="manual-lead-form" className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800">{isAddingLead ? <X className="size-4" /> : <Plus className="size-4" />}{isAddingLead ? 'Cancel' : 'Add lead'}</button>
            <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold disabled:opacity-40"><RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
            <button type="button" onClick={exportExcel} disabled={!visibleLeads.length} title="Export the current filtered and sorted view for Excel" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-35"><Download className="size-4" />Export Excel</button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-bold"><LogOut className="size-4" /><span className="hidden sm:inline">Log out</span></button>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {totals.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-h-28 items-center justify-between rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
              <div>
                <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-black/40">{label}</div>
                <div className="mt-2 text-4xl font-black tracking-tight text-black">{value}</div>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-black text-[#7fff00]">
                <Icon className="size-5" />
              </div>
            </div>
          ))}
        </section>

        {isAddingLead && (
          <form id="manual-lead-form" onSubmit={handleCreateLead} className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-lg font-black text-slate-950">Add a lead manually</h2><p className="mt-1 text-xs text-slate-500">All fields are optional. The new entry is saved directly to the shared CRM.</p></div>
              <button type="button" onClick={() => { setIsAddingLead(false); setManualLead(EMPTY_MANUAL_LEAD); setCreateError(''); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close manual lead form"><X className="size-4" /></button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs font-bold text-slate-600">Customer name<input autoFocus maxLength={100} value={manualLead.name} onChange={(event) => setManualLead((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" placeholder="Full name" /></label>
              <label className="text-xs font-bold text-slate-600">Phone<input maxLength={30} value={manualLead.phone} onChange={(event) => setManualLead((current) => ({ ...current, phone: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" placeholder="+381..." /></label>
              <label className="text-xs font-bold text-slate-600">City<input value={manualLead.city} onChange={(event) => setManualLead((current) => ({ ...current, city: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" placeholder="City" /></label>
              <label className="text-xs font-bold text-slate-600">Contact date<input type="date" value={manualLead.date_contacted} onChange={(event) => setManualLead((current) => ({ ...current, date_contacted: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" /></label>
              <label className="text-xs font-bold text-slate-600">To-do<select value={manualLead.todo} onChange={(event) => setManualLead((current) => ({ ...current, todo: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600"><option value="">—</option>{TODO_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-600">Medium<select value={manualLead.medium} onChange={(event) => setManualLead((current) => ({ ...current, medium: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600"><option value="">—</option>{MEDIUM_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-600">Stage<select value={manualLead.stage} onChange={(event) => setManualLead((current) => ({ ...current, stage: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600"><option value="">—</option>{STAGE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-600">Comment<input value={manualLead.comment} onChange={(event) => setManualLead((current) => ({ ...current, comment: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" placeholder="Sales note" /></label>
            </div>
            {createError && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{createError}</p>}
            <div className="mt-4 flex justify-end"><button type="submit" disabled={createState === 'saving'} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-40">{createState === 'saving' ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}{createState === 'saving' ? 'Adding…' : 'Add to CRM'}</button></div>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          {!loading && leads.length === 0 ? (
            <div className="px-6 py-20 text-center"><Users className="mx-auto size-10 text-black/20" /><h2 className="mt-4 text-xl font-bold">No leads yet</h2><p className="mt-2 text-sm text-black/45">New submissions from every device will appear here.</p></div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span>Showing <strong className="text-slate-900">{visibleLeads.length}</strong> of <strong className="text-slate-900">{leads.length}</strong> customers</span>
                <button type="button" onClick={() => { setFilters(EMPTY_FILTERS); setSort(null); }} disabled={!hasFilters && !sort} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"><FilterX className="size-3.5" />Clear filters &amp; sort</button>
              </div>
              <div className="max-h-[68vh] overflow-auto">
                <table className="w-full min-w-[1480px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-20 bg-slate-100 shadow-[0_1px_0_#94a3b8]">
                    <tr className="text-xs">
                      <th className="w-48 border-r border-slate-300">{columnHeader('name', 'Customer')}</th>
                      <th className="w-36 border-r border-slate-300">{columnHeader('city', 'City')}</th>
                      <th className="w-36 border-r border-slate-300">{columnHeader('todo', 'To-do')}</th>
                      <th className="w-40 border-r border-slate-300">{columnHeader('phone', 'Contact No')}</th>
                      <th className="w-40 border-r border-slate-300">{columnHeader('date_contacted', 'Contact Date')}</th>
                      <th className="w-36 border-r border-slate-300">{columnHeader('medium', 'Medium')}</th>
                      <th className="w-36 border-r border-slate-300">{columnHeader('stage', 'Stage')}</th>
                      <th className="min-w-[28rem] border-r border-slate-300">{columnHeader('comment', 'Comment')}</th>
                      <th className="w-36">{columnHeader('updated_at', 'Saved')}</th>
                    </tr>
                    <tr className="border-t border-slate-300 bg-white">
                      <th className="border-r border-slate-300"><input aria-label="Filter customers" value={filters.name} onChange={(event) => updateFilter('name', event.target.value)} placeholder="Filter…" className={filterInputClass} /></th>
                      <th className="border-r border-slate-300"><input aria-label="Filter cities" value={filters.city} onChange={(event) => updateFilter('city', event.target.value)} placeholder="Filter…" className={filterInputClass} /></th>
                      <th className="border-r border-slate-300"><select aria-label="Filter to-do" value={filters.todo} onChange={(event) => updateFilter('todo', event.target.value)} className={filterInputClass}><option value="">All</option>{TODO_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></th>
                      <th className="border-r border-slate-300"><input aria-label="Filter phone numbers" value={filters.phone} onChange={(event) => updateFilter('phone', event.target.value)} placeholder="Filter…" className={filterInputClass} /></th>
                      <th className="border-r border-slate-300"><input aria-label="Filter contact date" type="date" value={filters.date_contacted} onChange={(event) => updateFilter('date_contacted', event.target.value)} className={filterInputClass} /></th>
                      <th className="border-r border-slate-300"><select aria-label="Filter medium" value={filters.medium} onChange={(event) => updateFilter('medium', event.target.value)} className={filterInputClass}><option value="">All</option>{MEDIUM_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></th>
                      <th className="border-r border-slate-300"><select aria-label="Filter stage" value={filters.stage} onChange={(event) => updateFilter('stage', event.target.value)} className={filterInputClass}><option value="">All</option>{STAGE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></th>
                      <th className="border-r border-slate-300"><input aria-label="Filter comments" value={filters.comment} onChange={(event) => updateFilter('comment', event.target.value)} placeholder="Filter comments…" className={filterInputClass} /></th>
                      <th className="bg-slate-50" />
                    </tr>
                  </thead>
                  <tbody>{visibleLeads.map((lead) => {
                    const submitted = new Date(lead.created_at);
                    const stage = normalized(lead.stage);
                    const rowTone = stage === 'won' ? 'bg-emerald-50/80' : stage === 'lost' ? 'bg-red-50/90' : 'bg-white';
                    return (
                      <tr key={lead.id} className={`${rowTone} border-b border-slate-300 align-middle hover:bg-blue-50/70`}>
                        <td className="border-r border-slate-300 px-2 py-1.5"><div className="font-semibold text-slate-900">{lead.name || '—'}</div><div className="mt-0.5 text-[0.65rem] text-slate-400">{lead.language.toUpperCase()} · {submitted.toLocaleDateString('sr-RS')} · {submitted.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</div></td>
                        <td className="border-r border-slate-300 p-0"><input value={lead.city ?? ''} onChange={(event) => editLead(lead.id, { city: event.target.value })} onBlur={(event) => void saveLeadField(lead.id, { city: event.currentTarget.value.trim() || null })} placeholder="City" className={cellInputClass} /></td>
                        <td className="border-r border-slate-300 p-0"><select value={lead.todo ?? ''} onChange={(event) => { const todo = event.target.value || null; editLead(lead.id, { todo }); void saveLeadField(lead.id, { todo }); }} className={cellSelectClass}><option value="">—</option>{TODO_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></td>
                        <td className="border-r border-slate-300 px-2 py-1.5">{lead.phone ? <a href={`tel:${lead.phone}`} className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900">{lead.phone}</a> : <span className="text-slate-400">—</span>}</td>
                        <td className="border-r border-slate-300 p-0"><input type="date" value={lead.date_contacted ?? ''} onChange={(event) => { const date_contacted = event.target.value || null; editLead(lead.id, { date_contacted }); void saveLeadField(lead.id, { date_contacted }); }} className={cellInputClass} /></td>
                        <td className="border-r border-slate-300 p-0"><select value={inferredMedium(lead)} onChange={(event) => { const medium = event.target.value || null; editLead(lead.id, { medium }); void saveLeadField(lead.id, { medium }); }} className={cellSelectClass}>{MEDIUM_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></td>
                        <td className="border-r border-slate-300 p-0"><select value={lead.stage ?? ''} onChange={(event) => { const stage = event.target.value || null; editLead(lead.id, { stage }); void saveLeadField(lead.id, { stage }); }} className={cellSelectClass}><option value="">—</option>{STAGE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></td>
                        <td className="border-r border-slate-300 p-0"><textarea value={lead.comment ?? ''} onChange={(event) => editLead(lead.id, { comment: event.target.value })} onBlur={(event) => void saveLeadField(lead.id, { comment: event.currentTarget.value.trim() || null })} placeholder="Add sales note…" rows={1} className="min-h-10 w-full min-w-[28rem] resize-y border-0 bg-transparent px-2 py-2 text-sm leading-5 text-slate-800 outline-none hover:bg-white/70 focus:bg-white" /></td>
                        <td className="px-2 py-1.5 text-xs font-semibold"><span className={`inline-flex items-center gap-1 ${saveState[lead.id] === 'error' ? 'text-red-700' : 'text-slate-500'}`}>{saveState[lead.id] === 'saving' && <RefreshCw className="size-3 animate-spin" />}{saveState[lead.id] === 'saved' && <Check className="size-3 text-emerald-600" />}{saveState[lead.id] === 'saving' ? 'Saving' : saveState[lead.id] === 'saved' ? 'Saved' : saveState[lead.id] === 'error' ? 'Retry' : 'Auto'}</span><div className="mt-0.5 whitespace-nowrap text-[0.65rem] font-normal text-slate-400" title={savedTimestamp(lead.updated_at).title}>{savedTimestamp(lead.updated_at).label}</div></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
                {!loading && visibleLeads.length === 0 && <div className="px-6 py-14 text-center text-sm text-slate-500">No customers match the active filters.</div>}
              </div>
            </div>
          )}
        </section>
        <AdminOrdersPanel orders={paidOrders} loading={loading} error={paidOrdersError} />
        <a href="/" className="mt-6 inline-flex text-sm font-bold text-black/50 hover:text-black">← Back to website</a>
      </div>
    </main>
  );
}
