# Banca Intesa EPM compliance checklist

## Confirmed and implemented

- Products have accurate descriptions and prices displayed in RSD.
- Consumer product prices include VAT.
- Checkout displays the bank-requested statement: “Sve cene su sa uračunatim
  PDV-om i nema dodatnih ili skrivenih troškova.”
- Delivery is available throughout Serbia.
- Checkout delivery is limited to the Republic of Serbia; international delivery
  and export are explicitly unavailable, so customs/import charges do not apply.
- Expected delivery is 1–3 business days when the selected model is in stock.
- Courier delivery is fixed at 3,500 RSD per order, calculated server-side and
  shown separately before payment. Pickup is 0 RSD.
- Personal pickup is available at Save Maskovica 3, Belgrade.
- Checkout shows the actual product/model and description, unit price, quantity,
  VAT-inclusive product subtotal, delivery, total, pickup/delivery method and a
  live customer/address summary before terms acceptance and payment.
- Payment cannot start without explicit acceptance of purchase terms.
- Guest checkout uses Cloudflare Turnstile with server-side verification and
  fails closed when its server secret is missing.
- Public routes cover merchant/contact details, delivery, complaints, refunds,
  privacy, transaction confidentiality and purchase terms. Checkout and footer
  link to these routes.
- Visa and Mastercard informational links use the URLs supplied by Banca Intesa.
- Merchant information includes both activity code 4690 and its plain-language
  activity, “Nespecijalizovana trgovina na veliko.”
- The official Banca Intesa logo extracted unchanged from the supplied EPM v3.5
  document is linked on the homepage, checkout, card-entry and payment-security
  views. Visa, Mastercard, Visa Secure and MC ID Check artwork files are present.
  Acceptance marks use equal 74x40-pixel canvases, program marks use equal
  60x60-pixel canvases, and the groups have the required four-program-mark-width
  (240-pixel) separation. Final presentation remains subject to bank inspection.
- Card refunds are disclosed as exclusive refunds of the original card
  transaction to the card account used for payment; cash or another account is
  not offered.
- A print-ready withdrawal form is publicly available from the purchase terms.
- Payment-result and email templates distinguish the VAT-inclusive product
  subtotal from delivery and include the mandatory customer, order, merchant
  and available non-sensitive transaction fields for PAID and DECLINED results.
- UNKNOWN payment state never claims that a card was or was not charged.
- Full card number, security code and expiry are not persisted or logged;
  StoreKey and API credentials remain server-side.
- No prohibited product categories are offered.

## OWNER_INPUT_REQUIRED

- Bank inspection/approval of the implemented brand presentation and supplied
  artwork.
- Verified deployment provider/subprocessor disclosures where required.
- Actual deployment credentials.
- Execution and Merchant Center evidence for the official bank test scenarios.

## Not executed in this audit

No live or TEST card transaction was attempted. The existing NestPay payment
architecture and protocol fields were not redesigned as part of this work.

## Manual bank check

- Smallest currency unit: the inspection checklist mentions para, while the
  supplied NestPay 3D/API manuals define major-unit decimal transaction values.
  Keep RSD amounts unchanged and confirm the checklist interpretation with the
  bank (`SMALLEST_CURRENCY_UNIT=MANUAL_BANK_CHECK`).
