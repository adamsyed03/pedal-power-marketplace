alter table public.leads add column if not exists todo text;
alter table public.leads add column if not exists medium text;
alter table public.leads add column if not exists stage text;
alter table public.leads add column if not exists outcome text;

grant update (city, country, todo, medium, stage, outcome, date_contacted, comment)
on public.leads to authenticated;
