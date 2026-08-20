import { PRODUCTS } from './catalog.mjs';
import { buildPaymentConfirmation, sendTransactionalEmail } from './email.mjs';
import { publicMerchantData } from './merchant.mjs';
import {
  claimConfirmationEmail, completeConfirmationEmail, releaseConfirmationEmail,
} from './supabase.mjs';

const FINAL_EMAIL_STATES = new Set(['PAID', 'DECLINED', 'FAILED', 'CANCELLED']);

const defaultDependencies = {
  claim: claimConfirmationEmail,
  complete: completeConfirmationEmail,
  release: releaseConfirmationEmail,
  send: sendTransactionalEmail,
};

export async function dispatchConfirmation(order, env = process.env, dependencies = defaultDependencies) {
  if (!order || order.confirmation_email_sent_at || order.confirmation_email_claim_token) return false;
  if (!FINAL_EMAIL_STATES.has(order.payment_status)) return false;

  const claimed = await dependencies.claim(order, env);
  if (!claimed) return false;

  let delivered = false;
  try {
    const current = claimed.order;
    const merchant = publicMerchantData(env);
    const customerAddress = `${current.street}, ${current.postal_code} ${current.city}`;
    const template = buildPaymentConfirmation({
      orderId: current.order_id,
      paymentStatus: current.payment_status,
      customerName: current.customer_name,
      email: current.email,
      street: current.street,
      postalCode: current.postal_code,
      city: current.city,
      deliveryAddress: current.delivery_method === 'pickup' ? 'Save Maskovica 3, Beograd' : customerAddress,
      productName: PRODUCTS[current.product]?.name || current.product,
      items: current.order_items,
      unitPriceRsd: current.unit_price_rsd,
      quantity: current.quantity,
      subtotalRsd: current.subtotal_rsd,
      totalRsd: current.total_rsd,
      deliveryMethod: current.delivery_method,
      deliveryFeeRsd: current.delivery_fee_rsd,
      authorizationCode: current.authorization_code,
      nestpayTransactionId: current.nestpay_transaction_id,
      response: current.response,
      procReturnCode: current.proc_return_code,
      mdStatus: current.md_status,
      transactionDate: current.transaction_date,
      attemptedAt: current.callback_received_at || current.updated_at,
    }, merchant);
    await dependencies.send({ ...template, to: current.email }, env);
    delivered = true;
    const completed = await dependencies.complete(current.order_id, claimed.claimToken, env);
    if (!completed) throw new Error('PAYMENT_CONFIRMATION_FINALIZE_FAILED');
    return true;
  } catch {
    // A failed SMTP attempt releases the claim for a safe retry. If SMTP
    // accepted the message but the database acknowledgement failed, retain the
    // claim so a replay cannot send a duplicate.
    if (!delivered) {
      try { await dependencies.release(order.order_id, claimed.claimToken, env); } catch { /* keep payment final */ }
    }
    throw new Error('PAYMENT_CONFIRMATION_EMAIL_FAILED');
  }
}
