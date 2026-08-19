# Payment operations

Void and refund are back-office operations performed in the NestPay TEST
Merchant Center (`https://testsecurepay.eway2pay.com/bib/report/user.login`),
exactly as the SMS test workbook prescribes for TC02 and TC04. No public
void/refund endpoint is exposed.

## Same-day cancellation (Void)

For an eligible transaction that has not settled, authorized staff may initiate
`Void` in NestPay Merchant Center using the original Order ID/transaction. The
official SMS test workbook requires the TC02 reversal to be performed during the
same business day. Verify the result is approved and update/reconcile the local
order. No public Void endpoint is exposed.

## Settled payment return (Credit/Refund)

For a settled SMS/Sale transaction, authorized staff initiate `Credit`/Refund
against the original transaction in Merchant Center. A partial refund includes
the partial amount; a full refund uses the full eligible amount. Refunds must go
back to the original card method. Do not automatically refund because a product
is unavailable—staff must deliberately verify the order and choose the correct
operation. Installment refunds follow the Bank’s operational procedure.

## Safety

- Never perform Void or Credit from an unauthenticated customer route.
- Never retry Auth after a timeout; run Order Status reconciliation first.
- Preserve the original Order ID and gateway references in the audit trail.
- Confirm the Merchant Center result before marking an order `CANCELLED` or
  `REFUNDED`.
