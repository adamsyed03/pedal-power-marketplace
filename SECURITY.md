# Payment security boundary

## Responsibility model (Banca Intesa 3D Pay Hosting)

Banca Intesa requires `storetype=3d_pay_hosting` for merchant `13IN004634`.
Pogon prepares the signed non-card transaction fields and immediately POSTs
them to NestPay. The customer enters PAN, CVV and expiry exclusively on the
Banca Intesa / NestPay hosted payment page; Pogon never receives those values.

Hard rules enforced in code and tests:

- PAN, CVV and expiry are never collected, persisted, logged, sent to analytics
  or error monitoring, or stored in local/session storage. The callback strips
  any card-data-shaped fields the gateway might echo before processing.
- `NESTPAY_STORE_KEY`, `NESTPAY_API_USERNAME` and `NESTPAY_API_PASSWORD` are
  server-only and never use a `VITE_` prefix. Hash v2 is computed server-side in
  `/api/nestpay/prepare`; the browser receives only the finished hidden fields.
- The browser POST contains `storetype=3d_pay_hosting`, `hashAlgorithm=ver2`,
  `encoding=utf-8` and `lang=en`; it contains neither `instalment` nor
  `CallbackURL` nor any card-data field.
- Any eligible installment count is selected only on the bank-hosted page after
  BIN recognition and is retained from the normalized final gateway response.
- The hosted response is trusted only after the ver2 response-hash check plus
  merchant, order and amount binding. The callback is already the final payment
  response: NestPay performs the payment automatically, and Pogon never sends a
  second API Auth.
- An order becomes `PAID` only when the signed hosted response contains an
  accepted `mdStatus`, `Response=Approved` and `ProcReturnCode=00`.
- Callbacks are idempotent: a conditional state transition ensures duplicate or
  concurrent callbacks cannot finalize or email the same transaction twice.
- Ambiguous local state is resolved only through the documented read-only Order
  Status query. A payment transaction is never retried blindly.
- TEST mode pins the official Banca Intesa TEST endpoints. Production remains
  disabled until the bank completes inspection and issues production values.
