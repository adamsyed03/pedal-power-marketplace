alter table public.leads drop constraint if exists leads_name_check;
alter table public.leads drop constraint if exists leads_phone_check;

alter table public.leads
add constraint leads_name_check
check (source = 'admin-manual' or char_length(trim(name)) between 2 and 100);

alter table public.leads
add constraint leads_phone_check
check (source = 'admin-manual' or char_length(trim(phone)) between 8 and 30);

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
