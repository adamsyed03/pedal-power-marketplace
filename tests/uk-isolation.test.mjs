import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function sourceFiles(directory) {
  return readdirSync(new URL(`../${directory}/`, import.meta.url), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(relative);
    return /\.(?:ts|tsx|mjs)$/.test(entry.name) ? [relative] : [];
  });
}

test('UK landing route, navigation and WhatsApp contact stay inside the UK surface', () => {
  const app = read('src/app/App.tsx');
  const ukMarket = read('src/uk/ukMarket.ts');
  const main = read('src/main.tsx');
  const vercel = JSON.parse(read('vercel.json'));

  assert.match(main, /route === "\/uk"[\s\S]*<App market="uk"/);
  assert.ok(vercel.routes.some((route) => route.dest === '/index.html' && new RegExp(route.src).test('/uk')));
  assert.match(ukMarket, /https:\/\/wa\.me\/\$\{UK_WHATSAPP_NUMBER\}/);
  assert.doesNotMatch(ukMarket, /tel:\+447403113911/);
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
  assert.match(app, /export default function App\(\{ market = 'serbia', heroVideoTest = false \}/);
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

test('UK enquiries use the existing lead path with an explicit UK label and +44 normalisation', () => {
  const adapter = read('src/uk/ukLeads.ts');
  const originalLeadClient = read('src/lib/supabase.ts');

  assert.match(adapter, /import \{ submitLead, type Lead \} from '\.\.\/lib\/supabase'/);
  assert.match(adapter, /await submitLead\(buildUkLead\(input\)\)/);
  assert.match(adapter, /source: `UK landing page \| \$\{input\.source/);
  assert.match(adapter, /country: 'UK'/);
  assert.match(adapter, /if \(digits\.startsWith\('0'\)\) return `\+44\$\{digits\.slice\(1\)\}`/);
  assert.match(adapter, /UK landing page enquiry/);
  assert.doesNotMatch(adapter, /fetch\('\/api\/uk\/leads'/);
  assert.doesNotMatch(adapter, /checkout|order|payment|delivery|fiscal/i);
  assert.match(originalLeadClient, /request\('\/rest\/v1\/leads'/);
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
  assert.doesNotMatch(form, /type="checkbox"/);
  assert.match(form, /Your details will not be added to marketing updates/);
  assert.doesNotMatch(page, /\/checkout|RSD|NestPay|Banca Intesa/);
  assert.match(page, /<main className="lg:\[zoom:0\.8\]">/);
  assert.doesNotMatch(read('src/app/components/product/ProductPage.tsx'), /\[zoom:0\.8\]/);
});

test('Fold notifications and UK product leads capture WhatsApp numbers and product context', () => {
  const form = read('src/uk/UkInterestForm.tsx');
  const adapter = read('src/uk/ukLeads.ts');
  assert.match(form, /WhatsApp number<input required type="tel"/);
  assert.match(form, /phone: form\.phone\.trim\(\)/);
  assert.match(adapter, /Displayed price: £\$\{input\.displayedPriceGbp\} VAT included/);
  assert.match(adapter, /Lead type: \$\{input\.leadType\}/);
  assert.match(adapter, /Postcode: \$\{postcode\}/);
});

test('existing admin can identify UK rows through the shared lead source and phone country code', () => {
  const admin = read('src/app/components/AdminLeads.tsx');
  const adapter = read('src/uk/ukLeads.ts');
  assert.match(admin, /lead\.source/);
  assert.match(admin, /lead\.phone/);
  assert.match(adapter, /source: `UK landing page/);
  assert.match(adapter, /return `\+44/);
});

test('product videos are shared safely across UK and Serbian galleries and enabled only after R2 verification passes', () => {
  const app = read('src/app/App.tsx');
  const config = read('src/lib/productVideos.ts');
  const player = read('src/app/components/product/ProductVideo.tsx');
  const gallery = read('src/uk/UkProductGallery.tsx');
  const page = read('src/uk/UkProductPage.tsx');
  const serbianGallery = read('src/app/components/product/ProductGallery.tsx');
  const serbianPage = read('src/app/components/product/ProductPage.tsx');
  const ukConfig = read('src/uk/productVideos.ts');
  const ukPlayer = read('src/uk/ProductVideo.tsx');

  assert.match(config, /core:[\s\S]*pub-a596780795d544d0ae581ceaebbb8e46\.r2\.dev\/20260729_163748\.mp4[\s\S]*available: true/);
  assert.match(config, /cargo:[\s\S]*pub-a596780795d544d0ae581ceaebbb8e46\.r2\.dev\/20260713_184119\.mp4[\s\S]*available: true/);
  assert.match(config, /glide:[\s\S]*pub-a596780795d544d0ae581ceaebbb8e46\.r2\.dev\/glide%20\(2\)\.mp4[\s\S]*available: true/);
  assert.equal((config.match(/available: true/g) ?? []).length, 3);
  assert.equal((config.match(/available: false/g) ?? []).length, 0);
  assert.match(config, /return video\.available \? video : undefined/);

  assert.match(player, /<video/);
  assert.match(player, /playsInline/);
  assert.match(player, /loop/);
  assert.match(player, /preload=\{active && isInView \? 'metadata' : 'none'\}/);
  assert.match(player, /IntersectionObserver/);
  assert.match(player, /prefers-reduced-motion: reduce/);
  assert.match(player, /visibilitychange/);
  assert.match(player, /PRODUCT_VIDEO_PLAY_EVENT/);
  assert.match(player, /onError=\{\(\) => setHasError\(true\)\}/);
  assert.match(player, /fit\?: 'cover' \| 'contain'/);
  assert.match(player, /fit === 'contain' \? 'object-contain' : 'object-cover'/);

  assert.match(gallery, /index === 0 && video[\s\S]*kind: 'image'[\s\S]*kind: 'video'/);
  assert.match(gallery, /Play className=/);
  assert.match(gallery, /onTouchStart=\{handleTouchStart\}/);
  assert.match(page, /<UkProductGallery[\s\S]*video=\{productVideo\}/);
  assert.match(page, /Pogon in motion[\s\S]*aspect-\[9\/16\][\s\S]*fit="contain"/);
  assert.match(page, /lg:grid-cols-\[0\.85fr_1\.15fr\][\s\S]*calc\(82svh\*9\/16\)[\s\S]*max-w-lg/);
  assert.match(page, /max-w-3xl text-center lg:self-center[\s\S]*text-4xl[\s\S]*sm:text-6xl lg:text-\[4rem\]/);
  assert.match(app, /isUk \? ukLandingGalleryFor\(model\) : model\.gallery/);
  assert.match(app, /isUk \? ukLandingGalleryFor\(lightboxModel\) : lightboxModel\.gallery/);
  assert.match(serbianGallery, /index === 0 && video[\s\S]*kind: 'image'[\s\S]*kind: 'video'/);
  assert.match(serbianGallery, /<ProductVideo[\s\S]*Play className=/);
  assert.match(serbianPage, /availableProductVideo\(productKey\)/);
  assert.match(serbianPage, /<ProductGallery[^>]*video=\{productVideo\}/);
  assert.match(ukConfig, /PRODUCT_VIDEOS[\s\S]*availableProductVideo/);
  assert.match(ukPlayer, /export \{ ProductVideo \}/);
});

test('latest UK-only merchandising changes do not rewrite Serbian content', () => {
  const app = read('src/app/App.tsx');
  const page = read('src/uk/UkProductPage.tsx');

  assert.match(app, /id="accessories"[\s\S]*choose adventure\.[\s\S]*a premium european feel at the frontier of the micromobility revolution/);
  assert.match(app, /phone holder[\s\S]*free (?:—|and) included/);
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
  assert.match(read('src/uk/ukMarket.ts'), /cargo: \{ current: '£1,299', amount: 1299 \}/);
});

test('video hero is default on UK, isolated to /1 for Serbia, and defers its large R2 asset', () => {
  const main = read('src/main.tsx');
  const app = read('src/app/App.tsx');
  const video = read('src/app/components/HeroBackgroundVideo.tsx');
  const vercel = JSON.parse(read('vercel.json'));

  assert.match(main, /route === "\/uk\/1" \? "uk" : route === "\/1" \? "serbia"/);
  assert.match(main, /<App market="uk" heroVideoTest \/>/);
  assert.match(main, /<App heroVideoTest \/>/);
  assert.match(main, /route === "\/uk"[\s\S]*<App market="uk" heroVideoTest \/>/);
  assert.match(main, /robots: "noindex, nofollow, noarchive"/);
  assert.match(app, /heroVideoTest \? <HeroBackgroundVideo mediaQuery="\(min-width: 1024px\)"/);
  assert.match(app, /heroVideoTest \? <HeroBackgroundVideo mediaQuery="\(max-width: 1023px\)"/);
  assert.match(video, /website%20landing%20page\.mp4/);
  assert.match(video, /preload="none"/);
  assert.match(video, /fetchPriority="high"/);
  assert.match(video, /prefers-reduced-motion: reduce/);
  assert.match(video, /connection\?\.saveData/);
  assert.match(video, /IntersectionObserver/);
  assert.match(video, /visibilitychange/);
  assert.ok(vercel.routes.some((entry) => entry.src === '^/(1|uk/1)/?$' && entry.headers?.['X-Robots-Tag'] === 'noindex, nofollow, noarchive'));
  assert.ok(vercel.routes.some((entry) => entry.dest === '/index.html' && new RegExp(entry.src).test('/1')));
  assert.ok(vercel.routes.some((entry) => entry.dest === '/index.html' && new RegExp(entry.src).test('/uk/1')));
});
