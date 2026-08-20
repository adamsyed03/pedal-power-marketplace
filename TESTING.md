# Banca Intesa official TEST execution plan

> Executable now: payments run through the merchant-hosted card page
> (`/payment/card`) → NestPay TEST 3D gateway → server-side API Auth, per the
> supplied Banca Intesa 3D+API documentation.

## Scope and official sources

Pogon supports **SMS/Sale only**. Do not implement or execute DMS/PreAuth cases.

Official sources:

- `docs/nestpay/Primeri testnih case-ova za trgovce sa testnim karticama (1).xls`
  - `SMS test cases`
  - `Testne kartice`
- `docs/nestpay/izgled tabele sa testnim transakcijama (1).xls`

The official test-card sheet contains Mastercard, Visa, Dina and American
Express test-card rows. The SMS case rows do not assign any of those cards to a
specific case. Current merchant support is believed to be Visa and Mastercard;
do not use Dina or American Express unless merchant-specific confirmation from
Banca Intesa says they are enabled. Card values must be read directly from the
workbook by the human test operator. Never copy full card numbers, expiry
values, CVC values or 3-D Secure passwords into source control, application
logs, screenshots, tickets, chat, customer pages or this document. Use them
only against the official TEST payment page.

An official case is **not executed** until the real transaction is visible in
Banca Intesa TEST Merchant Center. Local automated tests are not official bank
transactions.

## Official SMS cases

| Case | Official scenario | Initiation | Expected gateway result | Expected Pogon state | Merchant Center action |
|---|---|---|---|---|---|
| TC01 | Successful SMS authorization | Payment page | Approved | `PAID` only after verified terminal result | Use the approved transaction as the source for TC02 |
| TC02 | Reversal of TC01 | Merchant Center/back office | Approved | `CANCELLED` after confirmed reconciliation | Reverse TC01 on the same business day |
| TC03 | Successful SMS authorization | Payment page | Approved | `PAID` only after verified terminal result | Use the approved transaction as the source for TC04 |
| TC04 | Refund of TC03 | Merchant Center/back office | Approved | `REFUNDED` after confirmed reconciliation | Refund the original TC03 transaction |
| TC36 | Successful SMS authorization with 3 instalments | Payment page | Approved | `PAID` only after verified terminal result | Confirm instalment count `3` in Merchant Center |

The workbook represents TC36's minimum as `XX`; it does not provide the actual
threshold. The operator must obtain the applicable minimum from Banca Intesa
and use an order total strictly above it.

## Card selection and required coverage

The workbook requires official test cards but does not map a particular card
or brand to TC01, TC03 or TC36. Before the first run, the operator must obtain
merchant-specific confirmation of:

- whether TC01 and TC03 should use Visa, Mastercard, or both;
- which enabled test-card category is eligible for TC36 instalments; and
- whether the bank expects any case to be repeated across card categories.

Use only confirmed enabled categories and a fresh Order ID for every run. Do
not infer coverage from the presence of Dina or American Express rows in the
generic workbook.

## Execution record — complete for every run

Record these non-sensitive values in the operator's evidence sheet:

- Unique local Order ID (`PGN-YYYY-...`)
- Official case and run ID
- Card brand and safe workbook reference only; never the full card number
- Exact server-authoritative amount in RSD
- Instalment count (`1` or `3`)
- Initiation location (`Payment page` or `Merchant Center/back office`)
- Expected gateway result (`Approved`)
- Expected Pogon order state
- Required Merchant Center follow-up
- UTC/local start time and Merchant Center appearance time
- Safe gateway evidence: Order ID, masked card display, AuthCode, TransId,
  Response, ProcReturnCode, mdStatus and transaction date
- Screenshot/export reference with card number masked by Merchant Center
- Operator name and final pass/fail/blocked result

## TC01 — successful SMS authorization

1. Confirm TEST mode (`NESTPAY_ENV=test`) and that `/api/nestpay/prepare`
   returns the TEST gateway URL.
2. Use the bank-confirmed Visa or Mastercard test-card category from `Testne
   kartice`; enter card data only on the merchant TEST card page
   (`/payment/card`). The workbook itself does not select the category.
3. Create a fresh Pogon checkout and record its unique Order ID, exact RSD
   amount and instalment count `1`.
4. Submit once from the payment page. Do not retry after a timeout.
5. Expected gateway result: `Approved`.
6. Expected Pogon state: `PAID` only after an authenticated, verified terminal
   result; otherwise `UNKNOWN`, never assumed success.
7. Locate the transaction in TEST Merchant Center by Order ID.
8. Preserve the safe evidence fields listed above.
9. Reserve this transaction for TC02 and perform TC02 during the same business
   day. Do not perform the reversal automatically.

## TC02 — same-day reversal of TC01

1. Use the successful TC01 Order ID and transaction reference.
2. In TEST Merchant Center, have the authorized operator initiate Reversal/Void
   on the same business day.
3. Record original amount, brand, instalment `1`, initiation location
   `Merchant Center/back office`, and expected result `Approved`.
4. Confirm the reversal appears as approved in Merchant Center.
5. Reconcile Pogon to `CANCELLED`; do not infer cancellation from the operator
   clicking the action.
6. Export/capture the masked Merchant Center evidence and link it to TC01.

## TC03 — successful SMS authorization

1. Repeat the TC01 payment-page procedure with a fresh Order ID.
2. Use the bank-confirmed Visa or Mastercard category required for this case.
3. Record exact RSD amount and instalment count `1`.
4. Expected gateway result: `Approved`.
5. Expected Pogon state: verified `PAID`, or `UNKNOWN` if the outcome is
   ambiguous.
6. Confirm the real transaction in TEST Merchant Center and collect only safe,
   masked evidence.
7. Reserve this transaction for TC04. Do not initiate refund automatically.

## TC04 — refund of TC03

1. Use the successful TC03 Order ID and transaction reference.
2. In TEST Merchant Center, have the authorized operator initiate Refund/Credit
   for the required eligible amount.
3. Record brand, amount, instalment `1`, initiation location `Merchant
   Center/back office`, and expected result `Approved`.
4. Confirm the refund appears as approved in Merchant Center.
5. Reconcile Pogon to `REFUNDED`; never mark it from an unverified local action.
6. Export/capture masked evidence and link it to TC03.

## TC36 — successful SMS authorization with 3 instalments

1. Obtain the actual minimum eligible amount and installment-card eligibility
   from Banca Intesa. Stop if either is unknown.
2. Create a fresh order whose exact server-authoritative total is above that
   minimum and record its unique Order ID.
3. Select instalment count `3`.
4. Use the appropriate official workbook card only on the licensed TEST payment
   page. Repeat for each brand the bank confirms as installment-eligible.
5. Expected gateway result: `Approved`.
6. Expected Pogon state: `PAID` only after a verified terminal result; ambiguous
   results remain `UNKNOWN` and must be reconciled before any retry.
7. Confirm Merchant Center shows the exact Order ID, amount, brand and
   instalment count `3`.
8. Preserve safe masked evidence and the actual minimum used for the run.

## Timeout and retry rule

Never send a second Sale/Auth solely because the browser or API timed out. Keep
the order `UNKNOWN` and resolve it with the documented Order Status
reconciliation (`/api/internal/reconcile`) before deciding whether another
attempt is safe.

## Explicitly excluded DMS cases

Do not implement or run TC11, TC12, TC14, TC15, TC33, TC34 or TC35. Pogon does
not use PreAuth/PostAuth DMS processing.

## Merchant Center operator workflow

1. Open the official Banca Intesa TEST Merchant Center user login at
   `https://testsecurepay.eway2pay.com/bib/report/user.login`.
2. Sign in with the bank-issued Merchant ID, user name and password. Never save
   the password in this repository or in evidence files.
3. Find each transaction using the exact Pogon Order ID and verify transaction
   type/status, date, masked card, card brand, amount and currency, instalment
   count, authorization number, 3-D Secure `mdStatus`, response code and
   response detail.
4. Export or transcribe the results into the supplied
   `izgled tabele sa testnim transakcijama` structure. Review the output and
   keep card data masked before sharing it.

The supplied documents do not include the Merchant Center user manual or login
credentials. Exact screen/menu names and the export control must be confirmed
after the bank supplies access.

## Completion and submission

1. Confirm every bank-required, merchant-enabled Visa/Mastercard category has
   the required real approved SMS result; do not infer the matrix from the
   generic test-card sheet.
2. Confirm TC02 was performed against TC01 on the same business day.
3. Confirm TC04 was performed against TC03.
4. Confirm TC36 used three instalments and an amount above the real minimum.
5. Export the official TEST results from Merchant Center following the supplied
   example workbook.
6. Review the export for unnecessary sensitive data before distributing it.
7. Submit the required evidence and request Banca Intesa EPM inspection.
