alter table public.orders add column if not exists idempotency_key text;
alter table public.orders add column if not exists lookup_token_hash text;
alter table public.orders add column if not exists response text;
alter table public.orders add column if not exists transaction_date timestamptz;
alter table public.orders add column if not exists confirmation_email_sent_at timestamptz;
alter table public.orders add column if not exists confirmation_email_claim_token uuid;
alter table public.orders add column if not exists confirmation_email_claimed_at timestamptz;
alter table public.orders add column if not exists confirmation_email_attempts integer not null default 0;
alter table public.orders add column if not exists reconciliation_attempts integer not null default 0;
alter table public.orders add column if not exists delivery_fee_rsd integer check (delivery_fee_rsd is null or delivery_fee_rsd >= 0);
alter table public.orders add column if not exists subtotal_rsd integer;
alter table public.orders add column if not exists terms_accepted_at timestamptz;
alter table public.orders add column if not exists terms_version text;
alter table public.orders add column if not exists order_items jsonb;
update public.orders set subtotal_rsd = unit_price_rsd * quantity where subtotal_rsd is null;
alter table public.orders alter column subtotal_rsd set not null;
alter table public.orders drop constraint if exists orders_total_rsd_check;
alter table public.orders alter column total_rsd drop not null;
alter table public.orders add constraint orders_final_total_check check (
  (
    (delivery_fee_rsd is null and total_rsd is null)
    or total_rsd = subtotal_rsd + delivery_fee_rsd
  )
);
alter table public.orders drop constraint if exists orders_quantity_check;
alter table public.orders add constraint orders_quantity_check check (quantity >= 1);
alter table public.orders add constraint orders_items_shape_check check (
  order_items is null or (jsonb_typeof(order_items) = 'array' and jsonb_array_length(order_items) between 1 and 3)
);

create unique index if not exists orders_idempotency_key_idx on public.orders(idempotency_key);
create index if not exists orders_lookup_idx on public.orders(order_id, lookup_token_hash);
