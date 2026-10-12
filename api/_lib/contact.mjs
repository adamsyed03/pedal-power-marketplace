const REQUEST_TYPES = new Set([
  'Pitanje o proizvodu',
  'Test vožnja',
  'Kupovina na rate',
  'Poslovna saradnja',
  'Servis i podrška',
]);

const clean = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const htmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export function normalizeContactInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('INVALID_CONTACT');
  const input = {
    name: clean(body.name, 100),
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 40),
    requestType: clean(body.requestType, 60),
    city: clean(body.city, 80),
    message: clean(body.message, 4000),
    website: clean(body.website, 200),
  };
  if (input.name.length < 2 || input.message.length < 3) throw new Error('INVALID_CONTACT');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error('INVALID_CONTACT');
  if (!REQUEST_TYPES.has(input.requestType)) throw new Error('INVALID_CONTACT');
  return input;
}

export function buildContactEmail(input) {
  const rows = [
    ['Ime i prezime', input.name],
    ['Email', input.email],
    ['Telefon', input.phone || 'Nije navedeno'],
    ['Tip upita', input.requestType],
    ['Grad', input.city || 'Nije navedeno'],
  ];
  const text = [...rows.map(([label, value]) => `${label}: ${value}`), '', 'Poruka:', input.message].join('\n');
  const rowHtml = rows.map(([label, value]) => `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e5e5">${htmlEscape(label)}</th><td style="padding:8px;border-bottom:1px solid #e5e5e5">${htmlEscape(value)}</td></tr>`).join('');
  return {
    to: 'pogonmobility@gmail.com',
    replyTo: input.email,
    subject: `Pogon kontakt — ${input.requestType}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#151515;max-width:720px;margin:auto"><h1>Novi upit sa ridepogon.com</h1><table style="width:100%;border-collapse:collapse">${rowHtml}</table><h2 style="margin-top:24px">Poruka</h2><p style="white-space:pre-wrap">${htmlEscape(input.message)}</p></div>`,
  };
}
