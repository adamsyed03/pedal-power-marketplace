import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { insertUkLead, normalizeUkLeadInput } from '../api/_lib/uk-leads.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function sourceFiles(directory) {
  return readdirSync(new URL(`../${directory}/`, import.meta.url), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(relative);
    return /\.(?:ts|tsx|mjs)$/.test(entry.name) ? [relative] : [];
  });
}

test('UK landing route, navigation and telephone stay inside the UK surface', () => {
  const app = read('src/app/App.tsx');
  const ukMarket = read('src/uk/ukMarket.ts');
  const main = read('src/main.tsx');
  const vercel = JSON.parse(read('vercel.json'));

  assert.match(main, /route === "\/uk"[\s\S]*<App market="uk"/);
  assert.ok(vercel.routes.some((route) => route.dest === '/index.html' && new RegExp(route.src).test('/uk')));
  assert.match(ukMarket, /tel:\+447403113911/);
  assert.match(ukMarket, /\+44 7403 113911/);
  assert.match(app, /market = 'serbia'/);
  assert.match(app, /isUk \? '\/uk#modeli'/);
  assert.match(app, /isUk \? '\/uk#kontakt'/);
  assert.match(app, /isUk[\s\S]*submitUkLead/);

  const nonUkSourceFiles = [...sourceFiles('src'), ...sourceFiles('api')]
    .filter((file) => !file.startsWith('src/uk/') && !file.startsWith('api/uk/') && file !== 'api/_lib/uk-leads.mjs');
  for (const file of nonUkSourceFiles) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /(?:\+44 7403 113911|\+447403113911)/, file);
  }
});

test('UK mode reuses the original homepage without entering Serbian checkout', () => {
  const app = read('src/app/App.tsx');
  assert.match(app, /export default function App\(\{ market = 'serbia' \}/);
  assert.match(app, /heroTitle: 'choose adventure\.'/);
  assert.match(app, /heroSub: 'a premium european feel at the frontier of the micromobility revolution'/);
  assert.match(app, /const homeCopyEn = \{[\s\S]*heroTitle: 'Forget traffic, parking, and fuel\.'/);
  assert.match(app, /if \(isUk\) \{[\s\S]*openLeadModal\('uk-cart-enquiry'\)[\s\S]*return;[\s\S]*checkout_started/);
  assert.match(app, /const bikeModels = isUk \? \[/);
  assert.match(app, /\.\.\.baseBikeModels\.map/);
  assert.match(app, /const ukPrice = UK_PRODUCT_PRICES\[model\.key\]/);
  assert.match(app, /price: ukPrice\.current/);
  assert.match(app, /!isUk \? <PaymentBranding compact \/>/);
});

test('UK enquiries normalize to an explicit UK market and never use Serbian lead or order tables', async () => {
  const normalized = normalizeUkLeadInput({
    name: ' Ada Lovelace ', email: ' ADA@EXAMPLE.COM ', phone: '+44 7700 900123', postcode: ' sw1a 1aa ',
    model: 'glide', message: ' Daily city riding ', consent: true, utm_source: 'search',
  });
  assert.deepEqual(normalized, {
    name: 'Ada Lovelace', email: 'ada@example.com', phone: '+447700900123', postcode: 'SW1A 1AA',
    model_interest: 'glide', message: 'Daily city riding', source: 'uk-landing', market: 'UK', page_path: '/uk',
    displayed_price_gbp: 1699, purchase_timeframe: null, price_interest: false, marketing_consent: false, lead_type: 'interest',
    utm_source: 'search', utm_medium: null, utm_campaign: null, consent: true,
  });

  let request;
  const saved = await insertUkLead(normalized, { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'secret' }, async (url, init) => {
    request = { url, init };
    return { ok: true, status: 201, json: async () => [{ id: 'uk-1' }] };
  });
  assert.equal(saved.id, 'uk-1');
  assert.match(request.url, /\/rest\/v1\/uk_leads$/);
  assert.doesNotMatch(request.url, /\/(?:leads|orders)$/);
  assert.equal(JSON.parse(request.init.body).market, 'UK');

  const localPhone = normalizeUkLeadInput({ name: 'Grace Hopper', phone: '07403 113911', model: 'any', consent: true });
  assert.equal(localPhone.phone, '+447403113911');

  const endpoint = read('api/uk/leads.ts');
  assert.doesNotMatch(endpoint, /checkout|nestpay|order|payment|delivery|fiscal/i);
});

test('UK lead storage is service-role-only and physically separate from Serbian leads', () => {
  const migration = read('supabase/migrations/20261014120000_create_uk_leads.sql');
  assert.match(migration, /create table if not exists public\.uk_leads/);
  assert.match(migration, /alter table public\.uk_leads enable row level security/);
  assert.match(migration, /revoke all on public\.uk_leads from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy/i);
  assert.doesNotMatch(migration, /alter table public\.leads/i);
});

test('UK product pages use isolated routes, GBP pricing and enquiry-only calls to action', () => {
  const main = read('src/main.tsx');
  const app = read('src/app/App.tsx');
  const market = read('src/uk/ukMarket.ts');
  const page = read('src/uk/UkProductPage.tsx');
  const form = read('src/uk/UkInterestForm.tsx');
  const vercel = JSON.parse(read('vercel.json'));

  assert.match(main, /const ukProductMatch = route\.match/);
  assert.match(main, /cargo\|core\|glide\|fold/);
  assert.match(main, /<UkProductPage productKey=\{ukProductKey\}/);
  for (const route of ['/uk/products/cargo/', '/uk/products/core/', '/uk/products/glide/', '/uk/products/fold/']) {
    assert.ok(vercel.routes.some((entry) => entry.dest === '/index.html' && new RegExp(entry.src).test(route)), route);
  }
  assert.match(market, /cargo: \{ current: '£1,299', amount: 1299 \}/);
  assert.match(market, /core: \{ current: '£1,700', amount: 1700 \}/);
  assert.match(market, /glide: \{ current: '£1,699', amount: 1699 \}/);
  assert.match(market, /fold: \{ current: '£1,099', amount: 1099 \}/);
  assert.match(market, /UK_WHATSAPP_NUMBER = '447403113911'/);
  assert.match(page, /No payment or reservation is taken/);
  assert.match(page, /Currently unavailable\. More coming soon/);
  const foldProductGallery = page.match(/const foldGallery: ProductMedia\[\] = \[[\s\S]*?\n\];/)?.[0] ?? '';
  assert.match(foldProductGallery, /Cargo fold\.jpg/);
  assert.doesNotMatch(foldProductGallery, /Cargo Main\.jpg|Cargo 1\.jpg/);
  const foldLandingGallery = app.match(/key: 'fold',[\s\S]*?gallery: \[[\s\S]*?\n\s*\],/)?.[0] ?? '';
  assert.match(foldLandingGallery, /Cargo fold\.jpg/);
  assert.doesNotMatch(foldLandingGallery, /Cargo Main\.jpg|Cargo 1\.jpg/);
  assert.match(page, /fold: \['\/Cargo fold\.jpg'\]/);
  assert.match(page, /productKey !== 'fold' \? <article/);
  assert.match(form, /purchaseTimeframe/);
  assert.match(form, /priceInterest/);
  assert.doesNotMatch(page, /\/checkout|RSD|NestPay|Banca Intesa/);
});

test('Fold notifications are email-only and UK product leads capture the authoritative displayed price', () => {
  const fold = normalizeUkLeadInput({
    email: ' rider@example.com ', model: 'fold', page: '/uk/products/fold/', lead_type: 'fold-notify', consent: true,
  });
  assert.equal(fold.name, null);
  assert.equal(fold.phone, null);
  assert.equal(fold.email, 'rider@example.com');
  assert.equal(fold.displayed_price_gbp, 1099);
  assert.equal(fold.page_path, '/uk/products/fold/');
  assert.equal(fold.lead_type, 'fold-notify');

  const glide = normalizeUkLeadInput({
    name: 'Ada Lovelace', phone: '07700 900123', email: 'ada@example.com', postcode: 'SW1A 1AA',
    model: 'glide', page: '/uk/products/glide/', purchase_timeframe: '0-3-months', price_interest: true,
    marketing_consent: true, displayed_price_gbp: 1, consent: true,
  });
  assert.equal(glide.displayed_price_gbp, 1699);
  assert.equal(glide.purchase_timeframe, '0-3-months');
  assert.equal(glide.price_interest, true);
  assert.equal(glide.marketing_consent, true);
});

test('existing admin exposes a clearly labelled UK landing page panel without merging UK rows into Serbian leads', () => {
  const admin = read('src/app/components/AdminLeads.tsx');
  const panel = read('src/app/components/AdminUkLeadsPanel.tsx');
  const api = read('api/admin/uk-leads.ts');
  const helper = read('api/_lib/uk-leads.mjs');

  assert.match(admin, /<AdminUkLeadsPanel leads=\{ukLeads\}/);
  assert.match(panel, />UK landing page</);
  assert.match(panel, /stored separately from Serbian leads and orders/);
  assert.match(api, /verifyAdminAccessToken/);
  assert.match(helper, /uk_leads\?select=/);
  assert.doesNotMatch(helper, /dbRequest\(['"](?:leads|orders)/);
});

test('latest UK-only merchandising changes do not rewrite Serbian content', () => {
  const app = read('src/app/App.tsx');
  const page = read('src/uk/UkProductPage.tsx');
  const helper = read('api/_lib/uk-leads.mjs');

  assert.match(app, /id="accessories"[\s\S]*choose adventure\.[\s\S]*a premium european feel at the frontier of the micromobility revolution/);
  assert.match(app, /phone holder[\s\S]*free — included/);
  assert.match(page, /included at no extra cost[\s\S]*phone holder[\s\S]*free/);
  assert.match(app, /sold out[\s\S]*more coming soon/);
  assert.match(app, /model\.isUnavailable \? 'select-none blur-\[5px\]/);
  assert.match(page, /unavailable \? 'select-none blur-\[6px\]/);
  assert.match(app, /isUk[\s\S]*meet the electric bike raising the standard\.[\s\S]*: tr\(\{/);
  assert.match(app, /!isUk \? <section aria-labelledby="partneri-heading"/);
  assert.match(app, /id="app"[\s\S]*Control your bike from your phone\.[\s\S]*Cutting-edge technology/);
  assert.match(app, /isUk \? 'Bike control from your phone'/);
  assert.match(app, /isUk \? '150 min weekly'/);
  assert.match(app, /isUk \? '£1,353 yearly'/);
  assert.match(app, /isUk \? '59 hours yearly'/);
  assert.match(app, /isUk \? 'Cutting edge'/);
  assert.match(app, /NHS guidance recommends at least 150 minutes/);
  assert.match(app, /UK drivers lost an average of 59 hours to congestion in 2025/);
  assert.match(page, /Cutting-edge connected technology[\s\S]*Control your bike from your phone\.[\s\S]*App control/);
  assert.match(read('src\/uk\/ukMarket.ts'), /Pogon app control/);
  assert.match(app, /Upoznaj Pogon električni bicikl koji podiže standard u Srbiji\./);
  assert.match(app, /Oko 5\.700 smrti u Srbiji/);
  assert.match(app, /Prosečan beogradski vozač provede najmanje 150 sati godišnje/);
  assert.match(app, /Working with leading institutions and companies/);
  assert.match(helper, /cargo: 1299, core: 1700/);
});
