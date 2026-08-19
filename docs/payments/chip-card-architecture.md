# Payment architecture (Banca Intesa / NestPay 3D+API)

The supplied technical manuals define the direct NestPay sequence below and do
not document a separate Chip Card API. A merchant-specific support reply also
said Pogon should redirect to Chip Card's page instead of the bank's 3D Pay
Hosting page. Because those sources conflict, this TEST implementation may be
validated locally but must not be treated as approved for live execution until
the merchant-specific routing instruction is resolved. See
`CHIP_CARD_INTEGRATION.md`.

## Actual flow (per the supplied bank documentation)

```text
Customer → ridepogon.com/checkout → order persisted (PENDING)
        → /payment/card (merchant-hosted card page)
        → POST /api/nestpay/prepare (server builds Hash v2 + hidden fields)
        → browser POSTs card + fields to https://testsecurepay.eway2pay.com/fim/est3dgate
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
- `src/app/components/CardPayment.tsx` — merchant-hosted card page; card data
  goes browser → NestPay only.

Secrets (StoreKey, API user password) are server-only. PAN/CVV/expiry are never
received, persisted or logged by Pogon servers.
