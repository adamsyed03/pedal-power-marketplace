-- UK launch enquiries are deliberately isolated from the Serbian `leads`
-- table and all ecommerce/order workflows. Only the server-side service role
-- writes to this table; there is no anonymous browser policy.
create table if not exists public.uk_leads (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(trim(name)) between 2 and 100),
  email text check (email is null or char_length(trim(email)) between 3 and 254),
  phone text check (phone is null or char_length(trim(phone)) between 7 and 30),
  postcode text check (postcode is null or char_length(trim(postcode)) between 2 and 12),
  model_interest text not null default 'any' check (model_interest in ('any', 'glide', 'core', 'cargo', 'fold')),
  message text check (message is null or char_length(message) <= 1000),
  source text not null default 'uk-landing' check (source = 'uk-landing'),
  market text not null default 'UK' check (market = 'UK'),
  page_path text not null default '/uk' check (page_path like '/uk%'),
  displayed_price_gbp integer check (displayed_price_gbp is null or displayed_price_gbp > 0),
  purchase_timeframe text check (purchase_timeframe is null or purchase_timeframe in ('as-soon-as-available', '0-3-months', '3-6-months', '6-12-months', 'researching')),
  price_interest boolean not null default false,
  marketing_consent boolean not null default false,
  lead_type text not null default 'interest' check (lead_type in ('interest', 'fold-notify')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);

alter table public.uk_leads enable row level security;

revoke all on public.uk_leads from anon, authenticated;

comment on table public.uk_leads is 'UK-only expressions of interest; isolated from Serbian CRM, ecommerce, payment and delivery workflows.';
