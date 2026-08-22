# Payment architecture (Banca Intesa / NestPay 3D Pay Hosting)

Marina Marković confirmed this merchant is a 3D Pay Hosting merchant. The
controlling package is the bank-provided `3D Pay Hosting` package. It requires
`storetype=3d_pay_hosting` and prohibits `instalment` and `CallbackURL` in the
POST. The hosted manual states that payment is performed automatically by
NestPay and that card entry occurs on the bank-hosted page.

## Actual flow

```text
Customer → ridepogon.com/checkout → order persisted (PENDING)
        → POST /api/nestpay/prepare (server creates Hash v2 + non-card fields)
        → browser immediately POSTs those fields to the environment-pinned NestPay HPP
        → customer enters card data exclusively on the bank page
        → NestPay performs 3-D Secure and the payment automatically
        → NestPay POSTs the signed final result to /api/nestpay/callback
        → Pogon verifies Hash v2, merchant ID, order ID and amount
        → accepted mdStatus + Approved + ProcReturnCode 00 → PAID
          Declined/Error or unacceptable mdStatus → DECLINED
          ambiguous state → UNKNOWN, resolved only by Order Status query
        → customer is redirected to Pogon's result page
```

There is no second CC5 API Auth in the hosted flow. API credentials are not
required for the initial Hosted Sale; when configured, they remain server-only
and are consumed only by the protected read-only Order Status reconciliation.

`NESTPAY_ENV=test` is bound to `test.ridepogon.com` and the TEST endpoints.
`NESTPAY_ENV=production` is bound to `ridepogon.com` and the production
endpoints. Cross-environment endpoint, origin, and Vercel-scope combinations
are rejected before payment preparation.

Key files:

- `api/_lib/nestpay.mjs` — Hash v2, hosted form fields and response verification.
- `api/_lib/payment-flow.mjs` — idempotent hosted callback finalization.
- `api/nestpay/prepare.ts`, `api/nestpay/callback.ts` — HTTP surfaces.
- `api/_lib/reconcile.mjs`, `api/internal/reconcile.ts` — Order Status checks.
- `src/app/components/CardPayment.tsx` — automatic non-card POST to the bank.

StoreKey and API credentials are server-only. PAN, CVV and expiry are entered
only on the bank page and are never received, persisted or logged by Pogon.
