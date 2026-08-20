# Chip Card's role in the Pogon payment setup

- Merchant: **POGON MOBILITY DOO** (`ridepogon.com`)
- Banca Intesa TEST Merchant ID: **13IN004634**
- Payment model (bank setup): **3D Pay + API**, instalments up to 12 (`Rate: 12`)
- Registered integrator: **Chip Card**

Chip Card is the registered **integrator/payment institution** on the Banca
Intesa side of this merchant. None of the supplied technical manuals define a
Chip Card API, SDK, endpoint or runtime protocol, and the bank's integration guide
(`docs/nestpay/Guidelines NestPay connectivity scenario for 3D API merchants
v3.0 - BIB (1).pdf`) describes the merchant/IPSP communicating **directly with
NestPay**:

1. Browser POST of signed transaction fields to the NestPay 3D gateway
   (`https://testsecurepay.eway2pay.com/fim/est3dgate` in TEST), followed by
   card entry on the bank-hosted page.
2. NestPay returns the 3-D Secure result (`md`, `eci`, `xid`, `cavv`,
   `mdStatus`) to the merchant callback.
3. Merchant backend sends the `CC5Request` API Auth
   (`<Number>md</Number>`, `<PayerSecurityLevel>eci</PayerSecurityLevel>`,
   `<PayerTxnId>xid</PayerTxnId>`, `<PayerAuthenticationCode>cavv</PayerAuthenticationCode>`)
   to `https://testsecurepay.eway2pay.com/fim/api`.

The TEST implementation follows the supplied NestPay manuals directly; see
`NESTPAY_IMPLEMENTATION.md`. It is hard-disabled outside `NESTPAY_ENV=test`.

The earlier routing ambiguity is now resolved by Banca Intesa's later explicit
merchant-specific instruction from Marina Marković: use
`storetype=3d_pay_hosting`; the 3D POST must contain neither `instalment` nor
`CallbackURL`. No separate Chip Card endpoint or request schema was supplied,
so the runtime remains the documented NestPay TEST endpoint with bank-hosted
card entry.
