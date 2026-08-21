create type public.payment_status as enum (
  'PENDING', '3D_PENDING', 'AUTHORIZING', 'PAID', 'DECLINED',
  'FAILED', 'UNKNOWN', 'CANCELLED', 'REFUNDED'
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product text not null check (product in ('glide', 'core', 'cargo')),
  quantity integer not null check (quantity between 1 and 5),
  unit_price_rsd integer not null check (unit_price_rsd > 0),
  total_rsd integer not null check (total_rsd = unit_price_rsd * quantity),
  customer_name text not null,
  email text not null,
  phone text not null,
  street text not null,
  city text not null,
  postal_code text not null,
  delivery_method text not null check (delivery_method in ('courier', 'pickup')),
  installment_count integer not null default 1 check (installment_count between 1 and 12),
  payment_status public.payment_status not null default 'PENDING',
  nestpay_transaction_id text,
  authorization_code text,
  host_reference text,
  proc_return_code text,
  md_status text,
  last_reconciliation_at timestamptz,
  callback_received_at timestamptz,
  constraint no_card_data_columns check (true)
);

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;

create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
