create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  source text not null default 'website',
  language text not null default 'sr' check (language in ('sr', 'en')),
  city text,
  country text,
  todo text,
  medium text,
  stage text,
  outcome text,
  date_contacted date,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads add column if not exists city text;
alter table public.leads add column if not exists country text;
alter table public.leads add column if not exists todo text;
alter table public.leads add column if not exists medium text;
alter table public.leads add column if not exists stage text;
alter table public.leads add column if not exists outcome text;
alter table public.leads add column if not exists date_contacted date;
alter table public.leads add column if not exists comment text;
alter table public.leads drop constraint if exists leads_name_check;
alter table public.leads drop constraint if exists leads_phone_check;
alter table public.leads add constraint leads_name_check check (source = 'admin-manual' or char_length(trim(name)) between 2 and 100);
alter table public.leads add constraint leads_phone_check check (source = 'admin-manual' or char_length(trim(phone)) between 8 and 30);
alter table public.leads add column if not exists updated_at timestamptz;
update public.leads set updated_at = created_at where updated_at is null;
alter table public.leads alter column updated_at set default now();
alter table public.leads alter column updated_at set not null;

create or replace function public.set_lead_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_lead_updated_at();

alter table public.leads enable row level security;

drop policy if exists "Public can submit leads" on public.leads;
create policy "Public can submit leads"
on public.leads for insert
to anon
with check (source <> 'admin-manual');

drop policy if exists "Pogon admin can create leads" on public.leads;
create policy "Pogon admin can create leads"
on public.leads for insert
to authenticated
with check (lower(auth.jwt() ->> 'email') = 'pogonmobility@gmail.com');

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

grant update (city, country, todo, medium, stage, outcome, date_contacted, comment) on public.leads to authenticated;
grant insert (name, phone, source, language, city, country, todo, medium, stage, outcome, date_contacted, comment) on public.leads to authenticated;
revoke delete on public.leads from anon, authenticated;
