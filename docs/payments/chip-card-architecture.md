# Payment architecture (Banca Intesa / NestPay 3D+API)

The supplied technical manuals define the direct NestPay sequence below and do
not document a separate Chip Card runtime API. Banca Intesa subsequently gave
the merchant-specific request contract in writing: use
`storetype=3d_pay_hosting`, and do not include `instalment` or `CallbackURL` in
the 3D POST. This implementation follows that latest explicit instruction. See
`CHIP_CARD_INTEGRATION.md`.

## Actual flow (per the supplied bank documentation)

```text
Customer → ridepogon.com/checkout → order persisted (PENDING)
        → /payment/card (Pogon order review and redirect; no card inputs)
        → POST /api/nestpay/prepare (server builds Hash v2 + hidden fields)
        → browser POSTs only server-prepared non-card fields to https://testsecurepay.eway2pay.com/fim/est3dgate
        → customer enters card data on the bank-hosted NestPay page
        → 3-D Secure authentication at issuer
        → NestPay POSTs 3D result (md/eci/xid/cavv/mdStatus) to /api/nestpay/callback
        → server verifies the ver2 response hash and claims the order (AUTHORIZING)
        → server sends CC5Request Auth to https://testsecurepay.eway2pay.com/fim/api
        → Approved + ProcReturnCode 00 → PAID; Declined → DECLINED;
          Error/transport failure/ambiguity → UNKNOWN
          UNKNOWN is resolved by Order Status query
        → browser redirected to /payment/success or /payment/failed
```

Key implementation files:

- `api/_lib/nestpay.mjs` — Hash v2, 3D form fields, response-hash check,
  CC5Request builders, response parsing.
- `api/_lib/payment-flow.mjs` — prepare + callback processing (idempotent,
  single API Auth per order, card-data stripping).
- `api/nestpay/prepare.ts`, `api/nestpay/callback.ts` — HTTP surfaces.
- `api/_lib/reconcile.mjs`, `api/internal/reconcile.ts` — UNKNOWN resolution.
- `src/app/components/CardPayment.tsx` — bank-hosted redirect page; it submits
  only the server-prepared transaction fields and contains no card inputs.

Secrets (StoreKey, API user password) are server-only. PAN/CVV/expiry are never
received, persisted or logged by Pogon browser or server code.
