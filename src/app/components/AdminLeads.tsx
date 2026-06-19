import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Download, Lock, LogOut, RefreshCw, Users } from 'lucide-react';

type StoredLead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  language: 'en' | 'sr';
  createdAt: string;
};

const STORAGE_KEY = 'pogon_test_ride_leads';
const ADMIN_SESSION_KEY = 'pogon_admin_authenticated';
const ADMIN_PASSWORD = 'ide!pogon!';

const readLeads = (): StoredLead[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored)
      ? stored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];
  } catch {
    return [];
  }
};

const escapeCsv = (value: string) => `"${String(value).replace(/"/g, '""')}"`;

export function AdminLeads() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const refresh = useCallback(() => setLeads(readLeads()), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [isAuthenticated, refresh]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setLoginError('Incorrect password.');
      return;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setIsAuthenticated(true);
    setPassword('');
    setLoginError('');
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setLeads([]);
  };

  const exportCsv = () => {
    const rows = [
      ['Name', 'Phone', 'Date', 'Time', 'Source', 'Language'],
      ...leads.map((lead) => {
        const submitted = new Date(lead.createdAt);
        return [
          lead.name,
          lead.phone,
          submitted.toLocaleDateString('sr-RS'),
          submitted.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }),
          lead.source,
          lead.language.toUpperCase(),
        ];
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

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f4f2] p-4 text-[#111]">
        <section className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-7 shadow-xl sm:p-9">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-black text-[#7fff00]">
            <Lock className="size-5" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Pogon Admin</h1>
          <p className="mt-2 text-sm text-black/50">Enter the admin password to view test-ride leads.</p>
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-black/55">
              Password
              <input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 w-full rounded-xl border border-black/15 bg-black/[0.025] px-4 py-3 text-base font-normal normal-case tracking-normal outline-none transition-colors focus:border-black/50" />
            </label>
            {loginError && <p role="alert" className="text-sm font-medium text-red-600">{loginError}</p>}
            <button type="submit" className="w-full rounded-full bg-black px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]">Log in</button>
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
              <Users className="size-4 text-[#7fff00]" />
              Admin
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Test ride leads</h1>
            <p className="mt-2 text-sm text-black/55">Saved in this browser · {leads.length} {leads.length === 1 ? 'lead' : 'leads'}</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={refresh} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold transition-colors hover:bg-black/5">
              <RefreshCw className="size-4" /> Refresh
            </button>
            <button type="button" onClick={exportCsv} disabled={!leads.length} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-35">
              <Download className="size-4" /> Export CSV
            </button>
            <button type="button" onClick={logout} aria-label="Log out" className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-bold transition-colors hover:bg-black/5">
              <LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          {leads.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Users className="mx-auto size-10 text-black/20" />
              <h2 className="mt-4 text-xl font-bold">No leads yet</h2>
              <p className="mt-2 text-sm text-black/45">Submitted phone-number forms will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/10 bg-black/[0.025] text-[0.68rem] uppercase tracking-[0.16em] text-black/45">
                    <th className="px-6 py-4 font-bold">Name</th>
                    <th className="px-6 py-4 font-bold">Phone number</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Time</th>
                    <th className="px-6 py-4 font-bold">Source</th>
                    <th className="px-6 py-4 font-bold">Language</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const submitted = new Date(lead.createdAt);
                    return (
                      <tr key={lead.id} className="border-b border-black/[0.07] last:border-0 hover:bg-black/[0.02]">
                        <td className="px-6 py-5 font-bold">{lead.name}</td>
                        <td className="px-6 py-5"><a href={`tel:${lead.phone}`} className="font-medium text-black/70 hover:text-black">{lead.phone}</a></td>
                        <td className="px-6 py-5 text-sm text-black/60">{submitted.toLocaleDateString('sr-RS')}</td>
                        <td className="px-6 py-5 text-sm text-black/60">{submitted.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-6 py-5"><span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-black/60">{lead.source}</span></td>
                        <td className="px-6 py-5 text-xs font-bold text-black/45">{lead.language.toUpperCase()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <a href="/" className="mt-6 inline-flex text-sm font-bold text-black/50 hover:text-black">← Back to website</a>
      </div>
    </main>
  );
}
