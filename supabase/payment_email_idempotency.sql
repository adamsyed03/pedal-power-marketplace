begin;

alter table public.orders
  add column if not exists confirmation_email_claim_token uuid;

alter table public.orders
  add column if not exists confirmation_email_claimed_at timestamptz;

alter table public.orders
  add column if not exists confirmation_email_attempts integer not null default 0;

commit;
