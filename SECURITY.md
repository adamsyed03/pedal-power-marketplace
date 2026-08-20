# Payment security boundary

## Responsibility model (3D+API, bank-hosted card page)

Banca Intesa configured merchant `13IN004634` for its bank-hosted NestPay flow
(see `docs/payments/chip-card-architecture.md`). `/payment/card` contains no
card fields: the browser POSTs only server-prepared non-card transaction fields
to NestPay, and the customer enters card data on the bank-hosted page. Card
data never reaches Pogon browser logic or servers.

Hard rules enforced in code and tests:

- PAN, CVV and expiry are never persisted, logged, sent to analytics or error
  monitoring, or stored in local/session storage. The callback strips any
  card-data-shaped fields NestPay may echo before processing
  (`stripSensitiveFields` in `api/_lib/payment-flow.mjs`).
- `NESTPAY_STORE_KEY`, `NESTPAY_API_USERNAME` and `NESTPAY_API_PASSWORD` are
  server-only and must never use a `VITE_` prefix. The Hash v2 is computed
  server-side in `/api/nestpay/prepare`; the browser only receives the finished
  hidden-field set.
- The 3D response is trusted only after the ver2 response-hash check
  (SHA-512/Base64 over the escaped `HASHPARAMS` values plus StoreKey), plus
  clientid and order checks. An order becomes `PAID` only when the server-side
  API Auth returns `Response=Approved` and `ProcReturnCode=00`.
- Callbacks are idempotent: an order is claimed with a conditional
  `AUTHORIZING` transition, so a duplicate or concurrent callback can never
  trigger a second Sale or overwrite a final state.
- Ambiguous outcomes (timeouts, transport errors) stay `UNKNOWN` and are
  resolved only through the documented Order Status query — a Sale is never
  retried blindly.
- In TEST mode the gateway is pinned to Banca Intesa's TEST endpoint. Test
  operators must enter only the official workbook cards on the bank page.
- `NESTPAY_ENV=test` pins the TEST endpoints; mixing TEST and production URLs
  fails closed (`NESTPAY_ENDPOINT_ENV_MISMATCH`). Production stays disabled
  until the bank issues production parameters after EPM inspection.
