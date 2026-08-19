import { PRODUCTS } from './catalog.mjs';
import { buildPaymentConfirmation, sendTransactionalEmail } from './email.mjs';
import { patchOrder } from './supabase.mjs';

export async function dispatchConfirmation(order, env = process.env) {
  if (order.confirmation_email_sent_at) return false;
  if (!['PAID', 'DECLINED'].includes(order.payment_status)) return false;
  const merchant = { legalName: env.MERCHANT_LEGAL_NAME, pib: env.MERCHANT_PIB, address: env.MERCHANT_ADDRESS };
  if (!merchant.legalName || !merchant.pib || !merchant.address) throw new Error('MERCHANT_CONFIRMATION_DATA_MISSING');
  const template = buildPaymentConfirmation({
    orderId: order.order_id, paymentStatus: order.payment_status,
    customerName: order.customer_name, email: order.email, street: order.street,
    postalCode: order.postal_code, city: order.city,
    productName: PRODUCTS[order.product]?.name || order.product, items: order.order_items,
    unitPriceRsd: order.unit_price_rsd, quantity: order.quantity,
    subtotalRsd: order.subtotal_rsd, totalRsd: order.total_rsd,
    deliveryMethod: order.delivery_method, deliveryFeeRsd: order.delivery_fee_rsd,
    authorizationCode: order.authorization_code, nestpayTransactionId: order.nestpay_transaction_id,
    response: order.response, procReturnCode: order.proc_return_code, mdStatus: order.md_status,
    transactionDate: order.transaction_date,
  }, merchant);
  await sendTransactionalEmail({ ...template, to: order.email }, env);
  await patchOrder(order.order_id, { confirmation_email_sent_at: new Date().toISOString() }, [order.payment_status], env);
  return true;
}
