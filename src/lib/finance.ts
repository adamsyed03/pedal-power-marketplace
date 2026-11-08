import { AdminSession, refreshAdminSession, supabaseRequest } from './supabase';

export const ADMIN_SESSION_KEY = 'pogon_supabase_admin_session';

export type FinanceSummary = {
  bank_balance: number | null;
  cash_received: number;
  cash_paid: number;
  net_cash_flow: number;
  recognised_revenue: number;
  operating_expenses: number;
  gross_profit: number | null;
  gross_margin: number | null;
  net_profit: number | null;
  outstanding_receivables: number;
  expected_30_days: number;
  inventory_units: number;
  inventory_value: number;
};

export type BankTransaction = {
  id: string; booked_on: string; description: string; counterparty_name: string | null;
  amount: number; direction: 'credit' | 'debit'; currency: string; category_name?: string | null;
};

export type PaymentSchedule = {
  id: string; customer_name: string; bicycle_model: string | null; total_amount: number;
  received_amount: number; outstanding_amount: number; currency: string; status: string;
  payment_method: string; expected_payer: string | null; next_due_on: string | null;
};

export type Instalment = {
  id: string; schedule_id: string; sequence_no: number; due_on: string; amount: number;
  received_amount: number; status: string;
};

export type InventoryUnit = {
  id: string; model: 'core' | 'cargo' | 'glide'; chassis_number: string; status: string;
  received_on: string | null; landed_cost: number | null; retail_price: number | null;
  currency: string; storage_location: string | null; battery_status: string;
  customer_name?: string | null;
};

export function readAdminSession(): AdminSession | null {
  try { const raw = localStorage.getItem(ADMIN_SESSION_KEY); return raw ? JSON.parse(raw) : null; }
  catch { localStorage.removeItem(ADMIN_SESSION_KEY); return null; }
}

export async function activeAdminSession(session: AdminSession) {
  if (session.expires_at * 1000 > Date.now() + 60_000) return session;
  const renewed = await refreshAdminSession(session.refresh_token);
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(renewed));
  return renewed;
}

async function json<T>(path: string, token: string, init: RequestInit = {}) {
  const response = await supabaseRequest(path, init, token);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const financeApi = {
  summary: (token: string, from: string, to: string) => json<FinanceSummary>('/rest/v1/rpc/finance_dashboard_summary', token, {
    method: 'POST', body: JSON.stringify({ p_from: from, p_to: to }),
  }),
  transactions: (token: string, from: string, to: string, offset = 0) => json<BankTransaction[]>(`/rest/v1/bank_transactions?select=id,booked_on,description,counterparty_name,amount,direction,currency,financial_categories(name)&booked_on=gte.${from}&booked_on=lte.${to}&order=booked_on.desc&limit=50&offset=${offset}`, token),
  statements: (token: string) => json<any[]>('/rest/v1/bank_statements?select=id,statement_number,statement_date,opening_balance,closing_balance,currency,status,source_email_subject,created_at&order=statement_date.desc&limit=30', token),
  importRuns: (token: string) => json<any[]>('/rest/v1/finance_import_runs?select=*&order=started_at.desc&limit=20', token),
  schedules: (token: string) => json<PaymentSchedule[]>('/rest/v1/payment_schedules?select=id,customer_name,bicycle_model,total_amount,received_amount,outstanding_amount,currency,status,payment_method,expected_payer,next_due_on&order=created_at.desc&limit=200', token),
  instalments: (token: string) => json<Instalment[]>('/rest/v1/payment_instalments?select=id,schedule_id,sequence_no,due_on,amount,received_amount,status&order=due_on.asc&limit=500', token),
  matchSuggestions: (token: string) => json<any[]>('/rest/v1/payment_match_suggestions?select=id,suggested_amount,confidence,reasons,status,bank_transaction_id,instalment_id,bank_transactions(amount,currency,booked_on,counterparty_name,description,payment_reference,payment_allocations(amount)),payment_instalments(amount,received_amount,due_on,sequence_no,payment_schedules(customer_name,expected_payer))&status=eq.pending&order=confidence.desc&limit=100', token),
  leads: (token: string) => json<any[]>('/rest/v1/leads?select=id,name,phone&order=name.asc&limit=1000', token),
  orders: async (token: string) => {
    const response = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) throw new Error('Orders could not be loaded.');
    return (await response.json()).orders as any[];
  },
  inventory: (token: string) => json<InventoryUnit[]>('/rest/v1/inventory_units?select=id,model,chassis_number,status,received_on,landed_cost,retail_price,currency,storage_location,battery_status&order=created_at.desc&limit=500', token),
  createSchedule: (token: string, payload: Record<string, unknown>) => json<PaymentSchedule[]>('/rest/v1/payment_schedules?select=*', token, {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
  }),
  createInstalments: (token: string, rows: Record<string, unknown>[]) => json<Instalment[]>('/rest/v1/payment_instalments?select=*', token, {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(rows),
  }),
  recordPayment: (token: string, instalmentId: string, amount: number, paidOn: string, reference?: string) => json('/rest/v1/rpc/finance_record_manual_payment', token, {
    method: 'POST', body: JSON.stringify({ p_instalment_id: instalmentId, p_amount: amount, p_paid_on: paidOn, p_reference: reference || null }),
  }),
  allocateBankPayment: (token: string, transactionId: string, instalmentId: string, amount: number) => json('/rest/v1/rpc/finance_allocate_bank_payment', token, {
    method: 'POST', body: JSON.stringify({ p_transaction_id: transactionId, p_instalment_id: instalmentId, p_amount: amount }),
  }),
  createInventory: (token: string, rows: Record<string, unknown>[]) => json<InventoryUnit[]>('/rest/v1/inventory_units?select=*', token, {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(rows),
  }),
  moveInventory: (token: string, unitId: string, status: string, note?: string) => json('/rest/v1/rpc/finance_move_inventory', token, {
    method: 'POST', body: JSON.stringify({ p_unit_id: unitId, p_status: status, p_note: note || null }),
  }),
};
