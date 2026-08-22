# Chip Card's role in the Pogon payment setup

- Merchant: **POGON MOBILITY DOO** (`ridepogon.com`)
- Banca Intesa TEST Merchant ID: **13IN004634**
- Payment model (bank setup): **3D Pay Hosting / SMS**, instalments up to 12 (`Rate: 12`)
- Registered integrator: **Chip Card**

Chip Card is the registered **integrator/payment institution** on the Banca
Intesa side of this merchant. None of the supplied technical manuals define a
Chip Card API, SDK, endpoint or runtime protocol, and the bank's integration guide
(`docs/nestpay/Guidelines NestPay connectivity scenario for 3D API merchants
v3.0 - BIB (1).pdf`) describes the merchant/IPSP communicating **directly with
NestPay**:

1. Pogon prepares and signs only non-card transaction fields.
2. The browser POSTs those fields directly to the environment-pinned NestPay
   hosted page, where the customer enters all card data.
3. NestPay performs 3-D Secure and the SMS payment, then POSTs the signed final
   result to Pogon's callback. Pogon does not send a second API Auth.

Both TEST and production configuration branches follow the bank-approved
hosting model; see `NESTPAY_IMPLEMENTATION.md`. Production support in code does
not activate production until its separate Vercel variables are configured.

The earlier routing ambiguity is now resolved by Banca Intesa's later explicit
merchant-specific instruction from Marina Marković: use
`storetype=3d_pay_hosting`; the 3D POST must contain neither `instalment` nor
`CallbackURL`. No separate Chip Card endpoint or request schema was supplied,
so the runtime remains the documented NestPay endpoint selected by
`NESTPAY_ENV`.
