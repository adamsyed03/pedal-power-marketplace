begin;

create extension if not exists pgcrypto;

-- Additive finance workspace. Existing leads/orders and their policies are untouched.
create or replace function public.is_pogon_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) = 'pogonmobility@gmail.com'
  or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' $$;
revoke all on function public.is_pogon_admin() from public;
grant execute on function public.is_pogon_admin() to authenticated, service_role;

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null default 'Banca Intesa',
  account_number text not null,
  iban text,
  currency char(3) not null default 'RSD',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (account_number, currency)
);

create table public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  kind text not null check (kind in ('revenue','cost_of_sales','operating_expense','asset','liability','equity','transfer','tax','other')),
  affects_profit boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bank_statements (
  id uuid primary key default gen_random_uuid(),
  bank_account_id uuid not null references public.bank_accounts(id),
  statement_year integer not null check (statement_year between 2000 and 2200),
  statement_number text not null,
  statement_date date not null,
  opening_balance numeric(18,2) not null,
  closing_balance numeric(18,2) not null,
  total_debit numeric(18,2) not null default 0 check (total_debit >= 0),
  total_credit numeric(18,2) not null default 0 check (total_credit >= 0),
  currency char(3) not null default 'RSD',
  status text not null default 'processing' check (status in ('processing','reconciled','review','failed')),
  source_email_id text,
  source_email_subject text,
  source_file_hash text not null,
  storage_path text,
  parser_version text not null,
  reconciliation_difference numeric(18,2) not null default 0,
  imported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (bank_account_id, statement_year, statement_number),
  unique (source_file_hash)
);

create table public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  statement_id uuid not null references public.bank_statements(id) on delete restrict,
  bank_account_id uuid not null references public.bank_accounts(id),
  sequence_no integer not null check (sequence_no > 0),
  booked_on date not null,
  value_date date,
  direction text not null check (direction in ('credit','debit')),
  amount numeric(18,2) not null check (amount > 0),
  currency char(3) not null default 'RSD',
  counterparty_name text,
  counterparty_account text,
  description text not null default '',
  payment_reference text,
  category_id uuid references public.financial_categories(id),
  categorisation_confidence numeric(5,4) check (categorisation_confidence between 0 and 1),
  fingerprint text not null,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (statement_id, sequence_no),
  unique (bank_account_id, fingerprint)
);

create table public.categorisation_rules (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.financial_categories(id),
  field text not null check (field in ('description','counterparty_name','counterparty_account','payment_reference')),
  operator text not null default 'contains' check (operator in ('contains','equals','regex')),
  pattern text not null,
  direction text check (direction in ('credit','debit')),
  priority integer not null default 100,
  auto_apply boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.finance_import_runs (
  id uuid primary key default gen_random_uuid(),
  import_type text not null check (import_type in ('scheduled','manual','backfill')),
  uk_business_date date,
  status text not null default 'running' check (status in ('running','completed','partial','failed','skipped')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  emails_scanned integer not null default 0,
  statements_imported integer not null default 0,
  transactions_imported integer not null default 0,
  duplicate_count integer not null default 0,
  error_count integer not null default 0,
  cursor text,
  details jsonb not null default '{}'::jsonb
);

create table public.finance_reconciliation_errors (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid references public.finance_import_runs(id),
  statement_id uuid references public.bank_statements(id),
  transaction_id uuid references public.bank_transactions(id),
  code text not null,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  supplier text,
  expected_on date,
  received_on date,
  freight_cost numeric(18,2) check (freight_cost >= 0),
  duty_cost numeric(18,2) check (duty_cost >= 0),
  other_cost numeric(18,2) check (other_cost >= 0),
  currency char(3) not null default 'RSD',
  status text not null default 'in_transit' check (status in ('planned','in_transit','partial','received','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_schedules (
  id uuid primary key default gen_random_uuid(),
  crm_lead_id uuid references public.leads(id) on delete restrict,
  crm_order_id uuid references public.orders(id) on delete restrict,
  crm_order_number text,
  customer_name text not null,
  bicycle_model text check (bicycle_model in ('core','cargo','glide')),
  chassis_number text,
  total_amount numeric(18,2) not null check (total_amount >= 0),
  received_amount numeric(18,2) not null default 0 check (received_amount >= 0 and received_amount <= total_amount),
  outstanding_amount numeric(18,2) generated always as (total_amount - received_amount) stored,
  currency char(3) not null default 'RSD',
  payment_method text not null check (payment_method in ('full_payment','deposit','bank_transfer','card_pos','cash','cheque','manual_instalments','administrative_deduction')),
  expected_payer text,
  employer_institution text,
  expected_reference text,
  status text not null default 'upcoming' check (status in ('upcoming','partially_paid','paid','overdue','cancelled')),
  next_due_on date,
  notes text,
  sale_recognised_on date not null default current_date,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (crm_lead_id is not null or crm_order_id is not null or crm_order_number is not null or customer_name <> '')
);

create table public.payment_instalments (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.payment_schedules(id) on delete restrict,
  sequence_no integer not null check (sequence_no > 0),
  due_on date not null,
  amount numeric(18,2) not null check (amount > 0),
  received_amount numeric(18,2) not null default 0 check (received_amount >= 0 and received_amount <= amount),
  currency char(3) not null default 'RSD',
  status text not null default 'upcoming' check (status in ('upcoming','partially_paid','paid','overdue','cancelled')),
  expected_reference text,
  created_at timestamptz not null default now(),
  unique (schedule_id, sequence_no)
);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  bank_transaction_id uuid references public.bank_transactions(id) on delete restrict,
  instalment_id uuid not null references public.payment_instalments(id) on delete restrict,
  amount numeric(18,2) not null check (amount > 0),
  currency char(3) not null default 'RSD',
  allocation_source text not null check (allocation_source in ('automatic','suggested','manual_bank','manual_cash','manual_card','manual_other')),
  confidence numeric(5,4) check (confidence between 0 and 1),
  payment_reference text,
  paid_on date not null,
  idempotency_key text not null unique,
  allocated_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.payment_match_suggestions (
  id uuid primary key default gen_random_uuid(),
  bank_transaction_id uuid not null references public.bank_transactions(id) on delete restrict,
  instalment_id uuid not null references public.payment_instalments(id) on delete restrict,
  suggested_amount numeric(18,2) not null check (suggested_amount > 0),
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  reasons jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','expired')),
  created_at timestamptz not null default now(),
  unique (bank_transaction_id, instalment_id)
);

create table public.inventory_units (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id),
  model text not null check (model in ('core','cargo','glide')),
  chassis_number text not null unique,
  received_on date,
  purchase_cost numeric(18,2) check (purchase_cost >= 0),
  allocated_landed_cost numeric(18,2) check (allocated_landed_cost >= 0),
  landed_cost numeric(18,2) check (landed_cost >= 0),
  retail_price numeric(18,2) check (retail_price >= 0),
  currency char(3) not null default 'RSD',
  status text not null default 'available' check (status in ('in_transit','available','reserved','sold','demo','incomplete','returned','damaged')),
  battery_status text not null default 'complete' check (battery_status in ('complete','missing','incomplete','unknown')),
  storage_location text,
  crm_lead_id uuid references public.leads(id) on delete restrict,
  crm_order_id uuid references public.orders(id) on delete restrict,
  payment_schedule_id uuid references public.payment_schedules(id) on delete restrict,
  warranty_start_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_unit_id uuid not null references public.inventory_units(id) on delete restrict,
  from_status text,
  to_status text not null,
  movement_type text not null check (movement_type in ('received','adjustment','reserved','sold','returned','damaged','location_change','import')),
  from_location text,
  to_location text,
  note text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.private_financial_documents (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  document_type text not null check (document_type in ('bank_statement','payment_support','inventory_import','other')),
  statement_id uuid references public.bank_statements(id),
  payment_schedule_id uuid references public.payment_schedules(id),
  file_name text not null,
  mime_type text not null,
  file_hash text not null,
  size_bytes bigint check (size_bytes >= 0),
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- RLS blocks browser access entirely; only service_role backend code handles encrypted tokens.
create table public.gmail_connections (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null unique,
  encrypted_refresh_token text not null,
  encrypted_access_token text,
  token_expires_at timestamptz,
  scopes text[] not null,
  gmail_history_id text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bank_transactions_booked_idx on public.bank_transactions (booked_on desc);
create unique index finance_import_runs_one_scheduled_day_idx on public.finance_import_runs (uk_business_date) where import_type = 'scheduled';
create index bank_transactions_reference_idx on public.bank_transactions (payment_reference);
create index bank_transactions_counterparty_idx on public.bank_transactions using gin (to_tsvector('simple', coalesce(counterparty_name,'') || ' ' || description));
create index payment_instalments_due_idx on public.payment_instalments (status, due_on);
create index payment_schedules_crm_lead_idx on public.payment_schedules (crm_lead_id);
create index payment_schedules_crm_order_idx on public.payment_schedules (crm_order_id);
create index inventory_units_model_status_idx on public.inventory_units (model, status);
create index allocation_transaction_idx on public.payment_allocations (bank_transaction_id);


-- Keep cash allocations consistent even when server-side service_role importers write directly.
-- Lock the bank transaction first, then the instalment, to serialize concurrent allocations.
create or replace function public.finance_guard_allocation()
returns trigger language plpgsql security definer set search_path = public as $
declare v_tx_amount numeric; v_tx_currency char(3); v_tx_direction text; v_statement_status text;
        v_tx_allocated numeric; v_inst_amount numeric; v_inst_currency char(3);
        v_inst_status text; v_inst_allocated numeric;
begin
  if new.bank_transaction_id is not null then
    select bt.amount, bt.currency, bt.direction, bs.status
      into v_tx_amount, v_tx_currency, v_tx_direction, v_statement_status
      from public.bank_transactions bt join public.bank_statements bs on bs.id = bt.statement_id
      where bt.id = new.bank_transaction_id for update of bt;
    if not found or v_tx_direction <> 'credit' or v_statement_status <> 'reconciled' then
      raise exception 'Only credits from reconciled bank statements may be allocated';
    end if;
    if new.currency <> v_tx_currency then raise exception 'Bank allocation currency mismatch'; end if;
    select coalesce(sum(amount),0) into v_tx_allocated from public.payment_allocations
      where bank_transaction_id = new.bank_transaction_id;
    if v_tx_allocated + new.amount > v_tx_amount then raise exception 'Bank transaction allocation exceeds amount'; end if;
  end if;
  select amount, currency, status into v_inst_amount, v_inst_currency, v_inst_status
    from public.payment_instalments where id = new.instalment_id for update;
  if not found or v_inst_status = 'cancelled' then raise exception 'Instalment unavailable for allocation'; end if;
  if new.currency <> v_inst_currency then raise exception 'Instalment allocation currency mismatch'; end if;
  select coalesce(sum(amount),0) into v_inst_allocated from public.payment_allocations
    where instalment_id = new.instalment_id;
  if v_inst_allocated + new.amount > v_inst_amount then raise exception 'Instalment allocation exceeds amount'; end if;
  return new;
end $;
create trigger payment_allocation_guard before insert on public.payment_allocations
for each row execute function public.finance_guard_allocation();

create or replace function public.finance_refresh_schedule(p_schedule_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_received numeric; v_total numeric; v_next date; v_status text;
begin
  select coalesce(sum(received_amount),0), min(due_on) filter (where status not in ('paid','cancelled'))
    into v_received, v_next from payment_instalments where schedule_id = p_schedule_id;
  select total_amount into v_total from payment_schedules where id = p_schedule_id for update;
  v_received := least(v_total, v_received);
  v_status := case when v_received >= v_total then 'paid' when v_next < current_date then 'overdue'
    when v_received > 0 then 'partially_paid' else 'upcoming' end;
  update payment_schedules set received_amount=v_received, next_due_on=v_next, status=v_status, updated_at=now() where id=p_schedule_id and status <> 'cancelled';
end $$;

create or replace function public.finance_after_allocation()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_schedule uuid; v_sum numeric;
begin
  select schedule_id into v_schedule from payment_instalments where id=coalesce(new.instalment_id,old.instalment_id) for update;
  select coalesce(sum(amount),0) into v_sum from payment_allocations where instalment_id=coalesce(new.instalment_id,old.instalment_id);
  update payment_instalments set received_amount=least(amount,v_sum), status=case when v_sum >= amount then 'paid' when due_on < current_date then 'overdue' when v_sum > 0 then 'partially_paid' else 'upcoming' end where id=coalesce(new.instalment_id,old.instalment_id);
  perform finance_refresh_schedule(v_schedule); return new;
end $$;
create trigger payment_allocation_refresh after insert or update or delete on public.payment_allocations for each row execute function public.finance_after_allocation();

create or replace function public.finance_record_manual_payment(p_instalment_id uuid, p_amount numeric, p_paid_on date, p_reference text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_remaining numeric; v_id uuid; v_key text;
begin
  if not is_pogon_admin() then raise exception 'admin required'; end if;
  select amount-received_amount into v_remaining from payment_instalments where id=p_instalment_id for update;
  if v_remaining is null or p_amount <= 0 or p_amount > v_remaining then raise exception 'amount exceeds remaining instalment'; end if;
  v_key := encode(digest(p_instalment_id::text || ':' || p_amount::text || ':' || p_paid_on::text || ':' || coalesce(p_reference,'') || ':' || clock_timestamp()::text,'sha256'),'hex');
  insert into payment_allocations(instalment_id,amount,allocation_source,payment_reference,paid_on,idempotency_key,allocated_by)
  values(p_instalment_id,p_amount,'manual_other',p_reference,p_paid_on,v_key,auth.uid()) returning id into v_id;
  return v_id;
end $$;

create or replace function public.finance_allocate_bank_payment(p_transaction_id uuid, p_instalment_id uuid, p_amount numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_tx_remaining numeric; v_inst_remaining numeric; v_currency char(3); v_paid_on date; v_reference text; v_id uuid; v_key text;
begin
  if not is_pogon_admin() then raise exception 'admin required'; end if;
  select t.amount-coalesce((select sum(a.amount) from payment_allocations a where a.bank_transaction_id=t.id),0),t.currency,t.booked_on,t.payment_reference
    into v_tx_remaining,v_currency,v_paid_on,v_reference from bank_transactions t where t.id=p_transaction_id and t.direction='credit' for update;
  select amount-received_amount into v_inst_remaining from payment_instalments where id=p_instalment_id for update;
  if v_tx_remaining is null or v_inst_remaining is null or p_amount<=0 or p_amount>v_tx_remaining or p_amount>v_inst_remaining then raise exception 'allocation exceeds transaction or instalment balance'; end if;
  v_key:=encode(digest(p_transaction_id::text||':'||p_instalment_id::text||':'||p_amount::text||':'||clock_timestamp()::text,'sha256'),'hex');
  insert into payment_allocations(bank_transaction_id,instalment_id,amount,currency,allocation_source,confidence,payment_reference,paid_on,idempotency_key,allocated_by)
  values(p_transaction_id,p_instalment_id,p_amount,v_currency,'manual_bank',1,v_reference,v_paid_on,v_key,auth.uid()) returning id into v_id;
  update payment_match_suggestions set status='accepted' where bank_transaction_id=p_transaction_id and instalment_id=p_instalment_id;
  return v_id;
end $$;

create or replace function public.finance_move_inventory(p_unit_id uuid, p_status text, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_old text; v_id uuid;
begin
  if not is_pogon_admin() then raise exception 'admin required'; end if;
  select status into v_old from inventory_units where id=p_unit_id for update;
  if v_old is null or p_status not in ('in_transit','available','reserved','sold','demo','incomplete','returned','damaged') then raise exception 'invalid inventory transition'; end if;
  update inventory_units set status=p_status,updated_at=now() where id=p_unit_id;
  insert into inventory_movements(inventory_unit_id,from_status,to_status,movement_type,note,changed_by)
  values(p_unit_id,v_old,p_status,case p_status when 'reserved' then 'reserved' when 'sold' then 'sold' when 'returned' then 'returned' when 'damaged' then 'damaged' else 'adjustment' end,p_note,auth.uid()) returning id into v_id;
  return v_id;
end $$;

create or replace function public.finance_dashboard_summary(p_from date, p_to date)
returns jsonb language sql stable security invoker set search_path = public as $
with cash as (
  select coalesce(sum(amount) filter(where direction='credit'),0) received, coalesce(sum(amount) filter(where direction='debit'),0) paid from bank_transactions where booked_on between p_from and p_to
), sales as (
  select coalesce(sum(total_amount),0) revenue from payment_schedules where sale_recognised_on between p_from and p_to and status <> 'cancelled'
), costs as (
  select sum(coalesce(i.landed_cost,i.allocated_landed_cost,i.purchase_cost)) cost from inventory_units i join payment_schedules p on p.id=i.payment_schedule_id where p.sale_recognised_on between p_from and p_to and i.status='sold'
), expenses as (
  select coalesce(sum(t.amount),0) expense from bank_transactions t join financial_categories c on c.id=t.category_id where t.booked_on between p_from and p_to and t.direction='debit' and c.kind='operating_expense'
), latest as (select closing_balance from bank_statements where status='reconciled' order by statement_date desc, imported_at desc limit 1), recv as (select coalesce(sum(outstanding_amount),0) outstanding from payment_schedules where status not in ('paid','cancelled')), expected as (select coalesce(sum(amount-received_amount),0) amount from payment_instalments where due_on between current_date and current_date+30 and status not in ('paid','cancelled')), stock as (select count(*) units,coalesce(sum(coalesce(landed_cost,allocated_landed_cost,purchase_cost,0)),0) value from inventory_units where status not in ('sold','returned'))
select jsonb_build_object('bank_balance',(select closing_balance from latest),'cash_received',cash.received,'cash_paid',cash.paid,'net_cash_flow',cash.received-cash.paid,'recognised_revenue',sales.revenue,'operating_expenses',expenses.expense,'gross_profit',case when costs.cost is null then null else sales.revenue-costs.cost end,'gross_margin',case when costs.cost is null or sales.revenue=0 then null else round((sales.revenue-costs.cost)/sales.revenue*100,2) end,'net_profit',case when costs.cost is null then null else sales.revenue-costs.cost-expenses.expense end,'outstanding_receivables',recv.outstanding,'expected_30_days',expected.amount,'inventory_units',stock.units,'inventory_value',stock.value) from cash,sales,costs,expenses,recv,expected,stock where public.is_pogon_admin()
$;

-- Atomic, idempotent statement commit used only by the service-role importer.
create or replace function public.finance_commit_bank_statement(p_statement jsonb, p_transactions jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_account uuid; v_statement uuid; v_tx jsonb; v_count int:=0; v_difference numeric;
begin
  insert into bank_accounts(account_number,currency) values(p_statement->>'account_number',coalesce(p_statement->>'currency','RSD')) on conflict(account_number,currency) do update set active=true returning id into v_account;
  select id into v_statement from bank_statements where source_file_hash=p_statement->>'source_file_hash';
  if v_statement is not null then return jsonb_build_object('duplicate',true,'statement_id',v_statement,'transactions',0); end if;
  v_difference := round((p_statement->>'closing_balance')::numeric - ((p_statement->>'opening_balance')::numeric + (p_statement->>'total_credit')::numeric - (p_statement->>'total_debit')::numeric),2);
  insert into bank_statements(bank_account_id,statement_year,statement_number,statement_date,opening_balance,closing_balance,total_debit,total_credit,currency,status,source_email_id,source_email_subject,source_file_hash,storage_path,parser_version,reconciliation_difference)
  values(v_account,(p_statement->>'statement_year')::int,p_statement->>'statement_number',(p_statement->>'statement_date')::date,(p_statement->>'opening_balance')::numeric,(p_statement->>'closing_balance')::numeric,(p_statement->>'total_debit')::numeric,(p_statement->>'total_credit')::numeric,coalesce(p_statement->>'currency','RSD'),case when v_difference=0 then 'reconciled' else 'review' end,p_statement->>'source_email_id',p_statement->>'source_email_subject',p_statement->>'source_file_hash',p_statement->>'storage_path',p_statement->>'parser_version',v_difference) returning id into v_statement;
  for v_tx in select * from jsonb_array_elements(p_transactions) loop
    insert into bank_transactions(statement_id,bank_account_id,sequence_no,booked_on,value_date,direction,amount,currency,counterparty_name,counterparty_account,description,payment_reference,fingerprint,raw_data)
    values(v_statement,v_account,(v_tx->>'sequence_no')::int,(v_tx->>'booked_on')::date,nullif(v_tx->>'value_date','')::date,v_tx->>'direction',(v_tx->>'amount')::numeric,coalesce(v_tx->>'currency','RSD'),v_tx->>'counterparty_name',v_tx->>'counterparty_account',coalesce(v_tx->>'description',''),v_tx->>'payment_reference',v_tx->>'fingerprint',v_tx); v_count:=v_count+1;
  end loop;
  return jsonb_build_object('duplicate',false,'statement_id',v_statement,'transactions',v_count,'reconciled',v_difference=0,'difference',v_difference);
end $$;

insert into public.financial_categories(name,kind,affects_profit) values
('Bicycle sales','revenue',true),('Cost of bicycles sold','cost_of_sales',true),('Advertising','operating_expense',true),('Shipping and logistics','operating_expense',true),('Rent and storage','operating_expense',true),('Bank fees','operating_expense',true),('Taxes','tax',false),('Internal transfer','transfer',false),('Uncategorised','other',false) on conflict(name) do nothing;

do $$ declare t text; begin foreach t in array array['bank_accounts','financial_categories','bank_statements','bank_transactions','categorisation_rules','finance_import_runs','finance_reconciliation_errors','shipments','payment_schedules','payment_instalments','payment_allocations','payment_match_suggestions','inventory_units','inventory_movements','private_financial_documents','gmail_connections'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;

-- Explicit per-table policies keep financial rows inaccessible to ordinary authenticated customers.
do $$ declare t text; begin foreach t in array array['bank_accounts','financial_categories','bank_statements','bank_transactions','categorisation_rules','finance_import_runs','finance_reconciliation_errors','shipments','payment_schedules','payment_instalments','payment_allocations','payment_match_suggestions','inventory_units','inventory_movements','private_financial_documents'] loop
  execute format('create policy %I on public.%I for select to authenticated using (public.is_pogon_admin())','finance_admin_select_'||t,t);
  execute format('create policy %I on public.%I for insert to authenticated with check (public.is_pogon_admin())','finance_admin_insert_'||t,t);
  execute format('create policy %I on public.%I for update to authenticated using (public.is_pogon_admin()) with check (public.is_pogon_admin())','finance_admin_update_'||t,t);
end loop; end $$;

grant select,insert,update on public.bank_accounts,public.financial_categories,public.bank_statements,public.bank_transactions,public.categorisation_rules,public.finance_import_runs,public.finance_reconciliation_errors,public.shipments,public.payment_schedules,public.payment_instalments,public.payment_allocations,public.payment_match_suggestions,public.inventory_units,public.inventory_movements,public.private_financial_documents to authenticated;
revoke delete on public.bank_accounts,public.financial_categories,public.bank_statements,public.bank_transactions,public.categorisation_rules,public.finance_import_runs,public.finance_reconciliation_errors,public.shipments,public.payment_schedules,public.payment_instalments,public.payment_allocations,public.payment_match_suggestions,public.inventory_units,public.inventory_movements,public.private_financial_documents,public.gmail_connections from authenticated;
grant execute on function public.finance_dashboard_summary(date,date),public.finance_record_manual_payment(uuid,numeric,date,text),public.finance_allocate_bank_payment(uuid,uuid,numeric),public.finance_move_inventory(uuid,text,text) to authenticated;
revoke all on function public.finance_commit_bank_statement(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.finance_commit_bank_statement(jsonb,jsonb) to service_role;
-- These internal privileged functions must not be callable through the public Data API.
revoke all on function public.finance_refresh_schedule(uuid), public.finance_after_allocation(), public.finance_guard_allocation() from public, anon, authenticated;
revoke all on function public.finance_record_manual_payment(uuid,numeric,date,text), public.finance_allocate_bank_payment(uuid,uuid,numeric), public.finance_move_inventory(uuid,text,text), public.finance_dashboard_summary(date,date) from public, anon;
-- Payments must be inserted through audited RPCs (or the guarded backend service role).
revoke insert, update, delete on public.payment_allocations from authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('finance-documents','finance-documents',false,20971520,array['application/pdf','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']) on conflict(id) do update set public=false;
create policy finance_admin_read_documents on storage.objects for select to authenticated using(bucket_id='finance-documents' and public.is_pogon_admin());
create policy finance_admin_upload_documents on storage.objects for insert to authenticated with check(bucket_id='finance-documents' and public.is_pogon_admin());

commit;
