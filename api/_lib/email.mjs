import nodemailer from 'nodemailer';

const htmlEscape = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const FINAL_FAILURE_STATES = new Set(['DECLINED', 'FAILED', 'CANCELLED']);
const unavailable = (value) => value === undefined || value === null || value === '' ? '-' : value;
const address = (street, postalCode, city) => [street, [postalCode, city].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '-';

export function buildPaymentConfirmation(order, merchant) {
  const paid = order.paymentStatus === 'PAID';
  if (!paid && !FINAL_FAILURE_STATES.has(order.paymentStatus)) throw new Error('EMAIL_REQUIRES_FINAL_PAYMENT_STATUS');

  const outcome = paid
    ? 'Uspešno ste izvršili plaćanje – račun Vaše platne kartice je zadužen.'
    : 'Plaćanje neuspešno – račun Vaše platne kartice nije zadužen.';
  const customerAddress = address(order.street, order.postalCode, order.city);
  const deliveryAddress = order.deliveryAddress
    || (order.deliveryMethod === 'pickup' ? 'Save Maskovica 3, Beograd' : customerAddress);
  const items = Array.isArray(order.items) && order.items.length
    ? order.items
    : [{
      name: order.productName,
      unitPriceRsd: order.unitPriceRsd,
      quantity: order.quantity,
      lineTotalRsd: order.subtotalRsd ?? Number(order.unitPriceRsd || 0) * Number(order.quantity || 0),
    }];
  const itemRows = items.flatMap((item, index) => [
    [`Proizvod ${index + 1}`, unavailable(item.name || item.product)],
    [`Količina ${index + 1}`, unavailable(item.quantity)],
    [`Jedinična cena ${index + 1}`, item.unitPriceRsd == null ? '-' : `${item.unitPriceRsd} RSD`],
    [`Ukupno za proizvod ${index + 1}`, item.lineTotalRsd == null ? '-' : `${item.lineTotalRsd} RSD`],
  ]);
  const rows = [
    ['Ime i prezime kupca', unavailable(order.customerName)],
    ['Email kupca', unavailable(order.email)],
    ['Adresa kupca', customerAddress],
    ['Adresa isporuke / preuzimanja', unavailable(deliveryAddress)],
    ...itemRows,
    ['PDV / Porez', 'PDV je uračunat u prikazane cene.'],
    ['Ukupan iznos proizvoda sa PDV-om', order.subtotalRsd == null ? '-' : `${order.subtotalRsd} RSD`],
    ['Dostava', order.deliveryFeeRsd == null ? '-' : `${order.deliveryFeeRsd} RSD`],
    ['Ukupno za plaćanje', order.totalRsd == null ? '-' : `${order.totalRsd} RSD`],
    ['Order ID / Broj narudžbine', unavailable(order.orderId)],
    ['AuthCode / Autorizacioni kod', unavailable(order.authorizationCode)],
    ['TransId / Broj transakcije', unavailable(order.nestpayTransactionId)],
    ['Response / Status transakcije', unavailable(order.response)],
    ['ProcReturnCode / Kod statusa transakcije', unavailable(order.procReturnCode)],
    ['mdStatus / Statusni kod 3D transakcije', unavailable(order.mdStatus)],
    ['EXTRA.TRXDATE', unavailable(order.transactionDate)],
    ['Datum i vreme transakcije', unavailable(order.transactionDate || order.attemptedAt)],
    ['Trgovac', 'POGON MOBILITY DOO'],
    ['PIB', '115472260'],
    ['Adresa trgovca', 'Temišvarska 25B, Beograd'],
  ];
  const rowHtml = rows.map(([label, value]) => `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e5e5">${htmlEscape(label)}</th><td style="padding:8px;border-bottom:1px solid #e5e5e5">${htmlEscape(value)}</td></tr>`).join('');
  const text = [outcome, '', ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n');
  return {
    subject: `Pogon potvrda plaćanja – ${order.orderId}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#151515;max-width:760px;margin:auto"><h1>${htmlEscape(outcome)}</h1><table style="width:100%;border-collapse:collapse">${rowHtml}</table><p style="margin-top:24px">${htmlEscape(merchant.legalName || 'POGON MOBILITY DOO')} · PIB ${htmlEscape(merchant.pib || '115472260')} · ${htmlEscape(merchant.address || 'Temišvarska 25B, Beograd')}</p></div>`,
  };
}

export function smtpTransportOptions(env = process.env) {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  if (required.some((name) => typeof env[name] !== 'string' || env[name].length === 0)) {
    throw new Error('EMAIL_PROVIDER_NOT_CONFIGURED');
  }
  const port = Number(env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !['true', 'false'].includes(env.SMTP_SECURE)) {
    throw new Error('EMAIL_PROVIDER_INVALID_CONFIGURATION');
  }
  return {
    host: env.SMTP_HOST,
    port,
    secure: env.SMTP_SECURE === 'true',
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  };
}

export async function verifySmtpConnection(env = process.env, nodemailerImpl = nodemailer) {
  const transport = nodemailerImpl.createTransport(smtpTransportOptions(env));
  try {
    return await transport.verify();
  } finally {
    transport.close?.();
  }
}

export async function sendTransactionalEmail(message, env = process.env, nodemailerImpl = nodemailer) {
  const transport = nodemailerImpl.createTransport(smtpTransportOptions(env));
  try {
    return await transport.sendMail({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  } catch {
    throw new Error('PAYMENT_CONFIRMATION_EMAIL_FAILED');
  } finally {
    transport.close?.();
  }
}
