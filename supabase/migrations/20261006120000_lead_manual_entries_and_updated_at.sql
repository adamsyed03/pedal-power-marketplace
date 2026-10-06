alter table public.leads add column if not exists updated_at timestamptz;

update public.leads
set updated_at = created_at
where updated_at is null;

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

grant insert (name, phone, source, language, city, country, todo, medium, stage, outcome, date_contacted, comment)
on public.leads to authenticated;
