create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  phone text not null check (char_length(trim(phone)) between 8 and 30),
  source text not null default 'website',
  language text not null default 'sr' check (language in ('sr', 'en')),
  city text,
  country text,
  date_contacted date,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.leads add column if not exists city text;
alter table public.leads add column if not exists country text;
alter table public.leads add column if not exists date_contacted date;
alter table public.leads add column if not exists comment text;

alter table public.leads enable row level security;

drop policy if exists "Public can submit leads" on public.leads;
create policy "Public can submit leads"
on public.leads for insert
to anon, authenticated
with check (true);

drop policy if exists "Pogon admin can view leads" on public.leads;
create policy "Pogon admin can view leads"
on public.leads for select
to authenticated
using (lower(auth.jwt() ->> 'email') = 'pogonmobility@gmail.com');

drop policy if exists "Pogon admin can update leads" on public.leads;
create policy "Pogon admin can update leads"
on public.leads for update
to authenticated
using (lower(auth.jwt() ->> 'email') = 'pogonmobility@gmail.com')
with check (lower(auth.jwt() ->> 'email') = 'pogonmobility@gmail.com');

grant update (city, country, date_contacted, comment) on public.leads to authenticated;
revoke delete on public.leads from anon, authenticated;
