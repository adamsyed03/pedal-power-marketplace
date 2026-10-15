-- Additive UK-only fields for product-page interest and Fold availability.
-- This migration does not touch the Serbian leads, customers or orders tables.
alter table public.uk_leads
  alter column name drop not null,
  alter column phone drop not null;

alter table public.uk_leads drop constraint if exists uk_leads_model_interest_check;
alter table public.uk_leads add constraint uk_leads_model_interest_check
  check (model_interest in ('any', 'glide', 'core', 'cargo', 'fold'));

alter table public.uk_leads drop constraint if exists uk_leads_page_path_check;
alter table public.uk_leads add constraint uk_leads_page_path_check check (page_path like '/uk%');

alter table public.uk_leads
  add column if not exists displayed_price_gbp integer check (displayed_price_gbp is null or displayed_price_gbp > 0),
  add column if not exists purchase_timeframe text check (purchase_timeframe is null or purchase_timeframe in ('as-soon-as-available', '0-3-months', '3-6-months', '6-12-months', 'researching')),
  add column if not exists price_interest boolean not null default false,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists lead_type text not null default 'interest' check (lead_type in ('interest', 'fold-notify'));

comment on column public.uk_leads.displayed_price_gbp is 'VAT-inclusive GBP price shown when the UK enquiry was submitted.';
comment on column public.uk_leads.lead_type is 'UK expression of interest or Fold availability notification.';
