begin;

-- 3D Pay Hosting selects the installment count on the bank page after BIN
-- recognition. Widen only the existing validation constraint so every bank-
-- supported count from 1 through 12 can be retained from the final callback.
alter table public.orders
  drop constraint if exists orders_installment_count_check;

alter table public.orders
  add constraint orders_installment_count_check
  check (installment_count between 1 and 12) not valid;

alter table public.orders
  validate constraint orders_installment_count_check;

commit;
