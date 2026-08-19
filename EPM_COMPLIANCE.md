# Banca Intesa EPM compliance checklist

## Confirmed and implemented

- Products have accurate descriptions and prices displayed in RSD.
- Consumer product prices include VAT.
- Checkout displays the bank-requested statement: “Sve cene su sa uračunatim
  PDV-om i nema dodatnih ili skrivenih troškova.”
- Delivery is available throughout Serbia.
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
- The official Banca Intesa logo extracted unchanged from the supplied EPM v3.5
  document is linked on the homepage, checkout, card-entry and payment-security
  views. The acceptance and 3D Secure groups have separate, dimensioned slots;
  usable individual bank-supplied Visa, Mastercard, Visa Secure and MC ID Check
  artwork is still required before those slots can be released as final branding.
- Payment-result and email templates distinguish the VAT-inclusive product
  subtotal from delivery and include the mandatory customer, order, merchant
  and available non-sensitive transaction fields for PAID and DECLINED results.
- UNKNOWN payment state never claims that a card was or was not charged.
- Full card number, security code and expiry are not persisted or logged;
  StoreKey and API credentials remain server-side.
- No prohibited product categories are offered.

## OWNER_INPUT_REQUIRED

- Bank inspection/approval and any bank-required brand artwork not already
  supplied in the project. Specifically: individual official Visa, Mastercard,
  Visa Secure and MC ID Check logo files. The PDF contains only composite layout
  examples for these marks, not reusable individual source assets.
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
