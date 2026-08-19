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

1. Browser POST of card + transaction fields to the NestPay 3D gateway
   (`https://testsecurepay.eway2pay.com/fim/est3dgate` in TEST).
2. NestPay returns the 3-D Secure result (`md`, `eci`, `xid`, `cavv`,
   `mdStatus`) to the merchant callback.
3. Merchant backend sends the `CC5Request` API Auth
   (`<Number>md</Number>`, `<PayerSecurityLevel>eci</PayerSecurityLevel>`,
   `<PayerTxnId>xid</PayerTxnId>`, `<PayerAuthenticationCode>cavv</PayerAuthenticationCode>`)
   to `https://testsecurepay.eway2pay.com/fim/api`.

The TEST implementation follows the supplied NestPay manuals directly; see
`NESTPAY_IMPLEMENTATION.md`. It is hard-disabled outside `NESTPAY_ENV=test`.

An earlier merchant-specific support reply explicitly said: "Obzirom da radite
preko Chip Carda potrebno je da se redirektujete na stranicu Chip Carda" and
said the bank page being used was intended for 3D Pay Hosting. This conflicts
with the direct technical-manual flow and cannot honestly be reclassified as
an administrative-only statement. The code can be completed and tested
locally, but no live TC01 should be submitted until that routing conflict is
resolved in writing.
