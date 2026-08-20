# NestPay implementation status

> The TEST 3D+API implementation follows the supplied Banca Intesa technical
> documentation and Marina Marković's merchant-specific clarification (see
> `docs/payments/chip-card-architecture.md`). The 3D POST uses
> `storetype=3d_pay_hosting`, omits `instalment` and `CallbackURL`, and sends no
> card data from Pogon. The customer enters card data on the bank-hosted page.
> The merchant backend retains the documented CC5 API Auth handling for
> returned `md`/`eci`/`xid`/`cavv` values.

## Project audit

- React 18 + TypeScript + Vite 6 + Tailwind CSS 4.
- Static Vercel deployment with Vercel Functions under `api/`; this repository
  has no Render configuration.
- Existing Supabase/Postgres database (currently used for leads).
- `/checkout` exists and posts to `/api/checkout/create`.
- The create endpoint currently fails closed and does not collect card data.
- Server-authoritative catalog: Glide 165,000 RSD, Core 135,000 RSD, Cargo
  130,000 RSD.
- No pre-existing NestPay code or EPM policy pages were present.

## Implemented

- No promo codes, discounts, or influencer attribution.
- Server-only product catalog and price × quantity calculation.
- Cryptographically random immutable order IDs.
- Supabase order schema with payment states and no card-data columns.
- TEST/production endpoint separation guards.
- Bank-hosted card entry; Pogon browser and server code do not collect PAN,
  CVV or expiry.
- Merchant-specific `3d_pay_hosting` request with `instalment` and
  `CallbackURL` absent from the POST.
- Hash v2 selected per direct Banca Intesa instruction.
- SMS/immediate Sale selected; DMS is not enabled.
- Documented Hash v2 request generation and response-hash verification.
- `mdStatus` acceptance predicate for values 1–4, per the 3D manual.
- CC5AS Auth and Order Status XML primitives and response parsing.
- Guest-checkout Turnstile widget and server verification.
- Verified-status customer result-page presentation.
- Transactional payment-confirmation email template/provider abstraction.
- Persistent server-side order creation with authoritative totals.
- Idempotency keys and opaque hashed public-status tokens.
- Rate-limited create, status, callback, and internal reconciliation routes.
- Conservative `UNKNOWN` reconciliation using documented Order Status queries.
- HTTPS callback/result URLs derived exclusively from `APP_BASE_URL`.
- Tests for totals, tampering, IDs, hashes, 3D status, XML, malformed/declined
  responses, status query separation, and environment isolation.

## Deliberately disabled

Production payments stay disabled: `NESTPAY_ENV=test` pins the TEST endpoints,
and switching to production requires the bank's production parameters issued
after the EPM inspection (see `CHIP_CARD_INTEGRATION.md` and `SECURITY.md`).

The Order Detail Service document referenced by the connectivity guide was not
supplied; reconciliation uses the documented Order Status query
(`api/_lib/reconcile.mjs`, triggered via `api/internal/reconcile.ts`).

## Database deployment

Apply `supabase/orders.sql` in the Supabase SQL editor. The table has RLS enabled
and grants no browser access. A server-only service-role credential will be
needed by the future Vercel/Render server runtime.

After the base migration, also apply `supabase/orders_lifecycle.sql` for
idempotency, secure status lookup, email-delivery tracking, and reconciliation
metadata.

## Owner facts still required for EPM

- Bank-supplied, approved brand assets
- Verified deployment provider/subprocessor disclosures
- Actual deployment credentials

These facts must not be replaced with fake public placeholders.

## Confirmed delivery and VAT configuration

- Delivery throughout Serbia.
- Expected delivery in 1–3 business days when the model is in stock.
- Courier delivery is fixed at 3,500 RSD per order, calculated server-side and
  not included in bicycle prices.
- Personal pickup: Save Maskovica 3, Belgrade.
- Pogon Mobility d.o.o. is VAT registered and consumer product prices include
  VAT.
- Checkout shows the exact delivery fee and final payable total before
  acceptance.

## Approval process

Complete TEST SMS scenarios, demonstrate them in Merchant Center, export the
results table, notify `ecomm_podrska@bancaintesa.rs`, pass EPM inspection, then
receive production credentials. Card payments must remain private until
authorized bank personnel complete successful pilot production transactions and
the Bank places the EPM into LIVE status.
