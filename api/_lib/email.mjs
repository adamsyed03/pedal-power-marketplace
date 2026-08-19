const htmlEscape = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function buildPaymentConfirmation(order, merchant) {
  const paid = order.paymentStatus === 'PAID';
  const declined = order.paymentStatus === 'DECLINED';
  const outcome = paid
    ? 'Uspešno ste izvršili plaćanje – račun Vaše platne kartice je zadužen.'
    : declined
    ? 'Plaćanje neuspešno – račun Vaše platne kartice nije zadužen.'
    : 'Status plaćanja se proverava. Ne možemo još potvrditi da li je račun kartice zadužen.';
  const delivery = order.deliveryMethod === 'pickup'
    ? 'Lično preuzimanje — Save Maskovica 3, Beograd'
    : order.deliveryFeeRsd != null
    ? `${order.deliveryFeeRsd} RSD`
    : 'Obračunava se posebno; nije uključena u cenu proizvoda';
  const unavailable = (value) => value === undefined || value === null || value === '' ? 'Nije dostupno' : value;
  const items = Array.isArray(order.items) && order.items.length
    ? order.items
    : [{ name: order.productName, unitPriceRsd: order.unitPriceRsd, quantity: order.quantity, lineTotalRsd: order.subtotalRsd ?? order.unitPriceRsd * order.quantity }];
  const itemRows = items.flatMap((item, index) => [
    [`Stavka ${index + 1}`, item.name || item.product],
    [`Jedinična cena stavke ${index + 1} sa PDV-om`, `${item.unitPriceRsd} RSD`],
    [`Količina stavke ${index + 1}`, item.quantity],
    [`Iznos stavke ${index + 1}`, `${item.lineTotalRsd ?? item.unitPriceRsd * item.quantity} RSD`],
  ]);
  const rows = [
    ['Broj narudžbine', order.orderId], ['Kupac', order.customerName], ['Email', order.email],
    ['Adresa kupca', `${order.street}, ${order.postalCode} ${order.city}`],
    ...(order.deliveryMethod === 'courier' ? [['Adresa isporuke', `${order.street}, ${order.postalCode} ${order.city}`]] : []),
    ...itemRows,
    ['Proizvodi sa PDV-om', `${order.subtotalRsd ?? items.reduce((sum, item) => sum + (item.lineTotalRsd ?? item.unitPriceRsd * item.quantity), 0)} RSD`],
    ['Dostava', delivery],
    ['Ukupno za plaćanje', order.totalRsd != null ? `${order.totalRsd} RSD` : null],
    ['AuthCode / Autorizacioni kod', unavailable(order.authorizationCode)], ['TransId / Broj transakcije', unavailable(order.nestpayTransactionId)],
    ['Response / Status transakcije', unavailable(order.response)], ['ProcReturnCode', unavailable(order.procReturnCode)],
    ['mdStatus / Statusni kod 3D transakcije', unavailable(order.mdStatus)], ['EXTRA.TRXDATE', unavailable(order.transactionDate)],
    ['Datum i vreme pokušaja', unavailable(order.attemptedAt || order.transactionDate)],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
  const merchantText = `${merchant.legalName} · PIB ${merchant.pib} · ${merchant.address}`;
  return {
    subject: `Pogon potvrda plaćanja – ${order.orderId}`,
    html: `<h1>${htmlEscape(outcome)}</h1><table>${rows.map(([label, value]) => `<tr><th align="left">${htmlEscape(label)}</th><td>${htmlEscape(value)}</td></tr>`).join('')}</table><p>Sve cene proizvoda su sa uračunatim PDV-om. Trošak dostave obračunava se posebno i prikazuje pre potvrde porudžbine.</p><p>${htmlEscape(merchantText)}</p>`,
  };
}

export async function sendTransactionalEmail(message, env = process.env, fetchImpl = fetch) {
  if (!env.RESEND_API_KEY || !env.PAYMENT_EMAIL_FROM) throw new Error('EMAIL_PROVIDER_NOT_CONFIGURED');
  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.PAYMENT_EMAIL_FROM, to: message.to, subject: message.subject, html: message.html }),
  });
  if (!response.ok) throw new Error('PAYMENT_CONFIRMATION_EMAIL_FAILED');
  return response.json();
}
