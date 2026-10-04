import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cities, deliveryRegions, guides, models, site } from './seo-content.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const absolute = (path) => `${site.url}${path}`;
const encodedImage = (path) => absolute(path.split('/').map((part) => encodeURIComponent(part)).join('/'));
const jsonLd = (value) => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script>`;

const organization = {
  '@type': 'Organization',
  '@id': `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  url: `${site.url}/`,
  logo: `${site.url}/Logo.png`,
  email: site.email,
  telephone: site.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.registeredAddress.street,
    addressLocality: site.registeredAddress.city,
    addressCountry: site.registeredAddress.country,
  },
  areaServed: { '@type': 'Country', name: 'Srbija' },
  sameAs: [site.instagram],
};

const testRideService = {
  '@type': 'Service',
  '@id': `${site.url}/#test-ride-service`,
  name: 'Pogon test vožnja električnih bicikala',
  serviceType: 'Besplatna test vožnja električnih bicikala uz prethodno zakazivanje',
  provider: { '@id': `${site.url}/#organization` },
  areaServed: cities.map((city) => ({ '@type': 'City', name: city.name })),
  url: `${site.url}/kontakt/`,
};

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path ? absolute(item.path) : undefined,
    })),
  };
}

function faqSchema(faq) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

function documentHead({ title, description, path, image = '/Excellent4.optimized.jpg', type = 'website', schema = [] }) {
  const canonical = absolute(path);
  return `<!doctype html>
<html lang="sr-Latn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="author" content="${esc(site.legalName)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/Logo.png">
  <link rel="stylesheet" href="/seo-content.css">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Pogon">
  <meta property="og:locale" content="sr_RS">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${encodedImage(image)}">
  <meta property="og:image:alt" content="${esc(title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${encodedImage(image)}">
  <meta name="twitter:image:alt" content="${esc(title)}">
  ${jsonLd({ '@context': 'https://schema.org', '@graph': schema })}
</head>`;
}

function siteHeader(current) {
  const link = (path, label, key) => `<a href="${path}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<a class="skip-link" href="#sadrzaj">Pređi na sadržaj</a>
<header class="site-header">
  <nav class="site-nav wrap" aria-label="Glavna navigacija">
    <a class="site-logo" href="/" aria-label="Pogon početna"><img src="/Logo.png" alt="Pogon" width="1024" height="1024"></a>
    <div class="site-links">
      ${link('/elektricni-bicikli/', 'Modeli', 'models')}
      ${link('/oprema/', 'Oprema', 'equipment')}
      ${link('/vodici/', 'Vodiči', 'guides')}
      ${link('/o-nama/', 'O nama', 'about')}
      <a class="site-contact" href="/kontakt/">Kontakt</a>
    </div>
  </nav>
</header>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs wrap" aria-label="Putanja stranice"><ol>${items.map((item, index) => `<li>${item.path && index < items.length - 1 ? `<a href="${item.path}">${esc(item.name)}</a>` : esc(item.name)}</li>`).join('')}</ol></nav>`;
}

function footer() {
  return `<footer><div class="wrap"><strong>${esc(site.legalName)}</strong><p>Električni bicikli i oprema za gradsku mobilnost u Srbiji · ${esc(site.phoneDisplay)}</p><div class="footer-links"><a href="/elektricni-bicikli/">Modeli</a><a href="/vodici/">Vodiči</a><a href="/dostava/">Dostava širom Srbije</a><a href="/o-nama/">O nama</a><a href="/kontakt/">Kontakt</a><a href="/uslovi-kupovine">Uslovi kupovine</a></div></div></footer>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=AW-18415875509';document.head.appendChild(s);gtag('js',new Date());gtag('config','AW-18415875509')},1200)},{once:true});</script>`;
}

function faqHtml(faq, heading = 'Česta pitanja') {
  return `<section class="faq wrap" aria-labelledby="faq-title"><h2 id="faq-title">${heading}</h2>${faq.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</section>`;
}

function relatedGuideLinks(slugs) {
  return slugs.map((slug) => {
    const guide = guides.find((entry) => entry.slug === slug);
    return guide ? `<a href="/vodici/${guide.slug}/"><strong>${esc(guide.title)}</strong><span>${esc(guide.description)}</span></a>` : '';
  }).join('');
}

function modelLinks(currentSlug) {
  return models.map((model) => `<a href="/products/${model.slug}/"${currentSlug === model.slug ? ' aria-current="page"' : ''}><strong>${esc(model.name)}</strong><span>${esc(model.summary)}</span></a>`).join('');
}

function renderProduct(model) {
  const path = `/elektricni-bicikli/${model.slug}/`;
  const productSchema = {
    '@type': 'Product',
    '@id': `${absolute(path)}#product`,
    url: absolute(path),
    name: model.name,
    image: [model.image, ...model.gallery.map(([image]) => image)].map(encodedImage),
    description: model.description,
    brand: { '@type': 'Brand', name: 'Pogon' },
    category: model.type,
    additionalProperty: [
      ['Tip', model.type], ['Motor', model.motor], ['Baterija', model.battery], ['Domet', model.range],
      ['Ram', model.frame], ['Kočnice', model.brakes], ['Gume', model.tyres], ['Sigurnost', model.security],
    ].map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    offers: {
      '@type': 'Offer',
      url: absolute(path),
      priceCurrency: 'RSD',
      price: String(model.price),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${site.url}/#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '3900', currency: 'RSD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RS' },
        deliveryTime: { '@type': 'ShippingDeliveryTime', transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' } },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'RS',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnShippingFees',
      },
    },
  };
  const schema = [
    organization,
    productSchema,
    breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'Električni bicikli', path: '/elektricni-bicikli/' }, { name: model.name, path }]),
    faqSchema(model.faq),
  ];
  const price = model.listPrice ? `<p class="price"><del>${model.listPrice}</del> ${model.priceDisplay}</p>` : `<p class="price">${model.priceDisplay}</p>`;
  const facts = [
    ['Model', model.name], ['Tip', model.type], ['Motor', model.motor], ['Baterija', model.battery], ['Deklarisani domet', model.range],
    ['Ram', model.frame], ['Kočnice', model.brakes], ['Gume', model.tyres], ['Sigurnost', model.security], [model.extraLabel, model.extraValue], ['Cena', model.priceDisplay],
  ];
  return `${documentHead({ title: model.title, description: model.description, path, image: model.image, type: 'product', schema })}
<body>
${siteHeader('models')}
<main id="sadrzaj">
  ${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'Električni bicikli', path: '/elektricni-bicikli/' }, { name: model.name }])}
  <section class="page-hero page-hero--split wrap">
    <div><div class="eyebrow">${esc(model.type)}</div><h1>${esc(model.name)}</h1><p class="lead">${esc(model.intro)}</p>${price}<div class="button-row"><a class="button" href="/checkout?model=${model.slug}">Naruči ${esc(model.name)}</a><a class="button-secondary" href="/#test-voznja">Zakaži test vožnju</a></div><div class="meta-line"><span>Dve godine garancije</span><span>Dostava 1–3 radna dana</span><span>Plaćanje u RSD</span></div></div>
    <figure><img src="${encodedImage(model.image).replace(site.url, '')}" alt="${esc(model.imageAlt)}" width="${model.imageWidth}" height="${model.imageHeight}" fetchpriority="high" decoding="async"><figcaption>Prikaz modela ${esc(model.name)}</figcaption></figure>
  </section>
  <section class="topic-section topic-section--white"><div class="wrap"><div class="section-heading"><div class="eyebrow">Činjenice o modelu</div><h2>${esc(model.name)} — brzi pregled</h2><p>Ključni podaci su navedeni eksplicitno kako bi poređenje bilo jednostavno. Neobjavljene specifikacije nisu pretpostavljene.</p></div><dl class="fact-list">${facts.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></div></section>
  <article class="wrap prose topic-section">
    ${model.body.map(([heading, html], index) => `<section aria-labelledby="deo-${index + 1}"><h2 id="deo-${index + 1}">${esc(heading)}</h2>${html}</section>`).join('')}
    <section><h2>Garancija, dostava, plaćanje i test vožnja</h2><p>Pogon za ovaj model navodi dve godine garancije. Kurirska dostava je dostupna na teritoriji Srbije; objavljeni rok je 1–3 radna dana, a naknada za dostavu prikazuje se pre plaćanja. Lično preuzimanje moguće je samo po unapred potvrđenom terminu.</p><p>Onlajn cena je izražena u RSD. Za kupovinu na rate ili preko administrativne zabrane pozovite <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a> kako biste dobili uslove koji važe za vaš slučaj. Ova informativna stranica ne menja obračun u checkout-u.</p><p>Besplatna test vožnja zakazuje se u Beogradu, Novom Sadu, Kragujevcu ili Nišu, od ponedeljka do subote od 09 do 18 h. Pogon tim potvrđuje tačan termin i lokaciju.</p></section>
    <section><h2>Kako se ${esc(model.name)} poredi sa drugim Pogon modelima?</h2><p>${esc(model.name)} je namenjen ${esc(model.forWhom)}. Za odluku uporedite namenu, ram, bateriju i način odlaganja, a zatim proverite položaj i kontrolu na test vožnji.</p><div class="related-links">${modelLinks(model.slug)}</div></section>
    <section><h2>Fotografije modela</h2><div class="cards">${model.gallery.map(([src, alt, width, height]) => `<figure class="card"><img src="${encodedImage(src).replace(site.url, '')}" alt="${esc(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"><figcaption class="card-body">${esc(alt)}</figcaption></figure>`).join('')}</div></section>
  </article>
  <section class="related"><div class="wrap"><div class="section-heading"><h2>Povezani vodiči</h2><p>Praktična objašnjenja za bateriju, domet, tip bicikla i održavanje.</p></div><div class="related-links">${relatedGuideLinks(model.related)}</div></div></section>
  ${faqHtml(model.faq, `Pitanja o modelu ${model.name.replace('Pogon ', '')}`)}
  <section class="final-cta wrap"><h2>Proverite da li vam ${esc(model.name)} odgovara</h2><p>Uporedite specifikacije, zakažite test vožnju ili nastavite na postojeći siguran proces poručivanja.</p><div class="button-row"><a class="button" href="/checkout?model=${model.slug}">Naruči ${esc(model.name.replace('Pogon ', ''))}</a><a class="button-secondary" href="/#test-voznja">Zakaži test vožnju</a></div></section>
</main>
${footer()}
</body></html>`;
}

function renderHub() {
  const path = '/elektricni-bicikli/';
  const title = 'Električni bicikli i e-bike modeli | Pogon';
  const description = 'Uporedite Pogon električne bicikle Core, Cargo i Glide. Saznajte kako rade e-bicikli, kako birati domet, bateriju, ram i model za grad ili dostavu.';
  const faq = [
    ['Šta je električni bicikl?', 'Električni bicikl je bicikl sa motorom i baterijom koji pružaju asistenciju vozaču. Način aktiviranja asistencije zavisi od sistema konkretnog modela.'],
    ['Koliki domet je potreban za grad?', 'Izmerite dnevni odlazak i povratak, dodajte neplanirane obaveze i ostavite rezervu za teren, temperaturu, vetar i starenje baterije.'],
    ['Koliko traje punjenje?', 'Objavljene Pogon informacije navode da potpuno punjenje obično traje do šest sati, u zavisnosti od baterije i početnog nivoa napunjenosti. Pratite uputstvo konkretnog modela.'],
    ['Gde mogu da probam Pogon električni bicikl?', 'Besplatna test vožnja zakazuje se u Beogradu, Novom Sadu, Kragujevcu ili Nišu, od ponedeljka do subote od 09 do 18 h, uz potvrđen termin i lokaciju.'],
  ];
  const itemList = {
    '@type': 'ItemList',
    numberOfItems: models.length,
    itemListElement: models.map((model, index) => ({ '@type': 'ListItem', position: index + 1, url: absolute(`/products/${model.slug}/`), name: model.name })),
  };
  const schema = [organization, testRideService, {
    '@type': 'CollectionPage', '@id': `${absolute(path)}#webpage`, url: absolute(path), name: title, description, inLanguage: 'sr-Latn',
    isPartOf: { '@id': `${site.url}/#website` }, mainEntity: itemList,
  }, itemList, breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'Električni bicikli', path }]), faqSchema(faq)];
  return `${documentHead({ title, description, path, image: '/Cargo Main.jpg', schema })}
<body>${siteHeader('models')}<main id="sadrzaj">
${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'Električni bicikli' }])}
<section class="page-hero page-hero--split wrap"><div><div class="eyebrow">Pogon Mobility · Srbija</div><h1>Električni bicikli za grad, posao i dostavu</h1><p class="lead">Pogon električni bicikli kombinuju električnu asistenciju sa praktičnim ramovima, baterijama i opremom za svakodnevne rute. Uporedite gradski, sklopivi i cargo model bez nagađanja o neobjavljenim specifikacijama.</p><div class="button-row"><a class="button" href="#modeli">Uporedite modele</a><a class="button-secondary" href="/#test-voznja">Zakažite test vožnju</a></div></div><aside class="hero-card"><strong>Tri modela, tri jasne namene.</strong><p>Glide za grad, Core za sklapanje i duže rute, Cargo za rad i prevoz stvari.</p></aside></section>
<section class="topic-section topic-section--white" id="modeli"><div class="wrap"><div class="section-heading"><h2>Pogon modeli električnih bicikala</h2><p>Svaka kartica vodi na potpunu statičku stranicu modela sa specifikacijama, realnim ograničenjima dometa i odgovorima na česta pitanja.</p></div><div class="cards">${models.map((model) => `<article class="card"><img src="${encodedImage(model.image).replace(site.url, '')}" alt="${esc(model.imageAlt)}" width="${model.imageWidth}" height="${model.imageHeight}" loading="lazy" decoding="async"><div class="card-body"><div class="eyebrow">${esc(model.type)}</div><h2>${esc(model.name)}</h2><p>${esc(model.intro)}</p><p><strong>${esc(model.priceDisplay)}</strong></p><a href="/elektricni-bicikli/${model.slug}/">Pogledajte ${esc(model.name)} →</a></div></article>`).join('')}</div></div></section>
<section class="related" aria-labelledby="test-centri"><div class="wrap"><div class="section-heading"><div class="eyebrow">Probajte pre kupovine</div><h2 id="test-centri">Test vožnje u četiri grada</h2><p>Besplatna test vožnja dostupna je uz prethodno zakazivanje. Izaberite grad, a Pogon tim će potvrditi model, termin i tačnu lokaciju.</p></div><div class="location-links">${cities.map((city) => `<a href="/elektricni-bicikli/${city.slug}/"><strong>${esc(city.name)}</strong><span>Test vožnja uz potvrđen termin →</span></a>`).join('')}</div></div></section>
<section class="topic-section wrap prose"><h2>Šta je električni bicikl i kako radi asistencija?</h2><p>Električni bicikl, e-bicikl ili e-bike ima bateriju, motor, kontroler i senzore koji pružaju asistenciju. Osećaj vožnje zavisi od načina na koji sistem prepoznaje pedalanje, izabranog nivoa pomoći, prenosa i podešavanja konkretnog modela.</p><p>Motor ne uklanja potrebu za pažljivim izborom brzine, kočenjem i održavanjem. Za tehnički kontekst pročitajte <a href="/vodici/250w-elektricni-bicikl/">šta oznaka 250 W zaista znači</a>.</p>
<h2>Kako izabrati e-bicikl?</h2><p>Krenite od namene: svakodnevni grad, sklopivo odlaganje ili dostava. Izmerite povratnu rutu, procenite teret, proverite gde ćete puniti i čuvati bicikl, pa tek onda poređujte brojke. <a href="/vodici/kako-izabrati-elektricni-bicikl/">Praktičan vodič za izbor električnog bicikla</a> prolazi kroz ceo proces.</p>
<h2>Koliki domet je potreban?</h2><p>Ne birajte bateriju tako da deklarisani maksimum jedva pokriva dnevnu kilometražu. Masa, uspon, hladnoća, vetar, pritisak u gumama, nivo asistencije i teret menjaju potrošnju. Pogledajte <a href="/vodici/domet-elektricnog-bicikla/">kako se procenjuje stvarni domet</a>.</p>
<h2>Jedna ili dve baterije?</h2><p>Dve baterije daju više ukupne energije i fleksibilnosti tokom dugog dana, ali povećavaju masu i broj komponenti koje punite i održavate. Jedna baterija može biti bolji izbor za kraće gradske relacije. Za poređenje koristite Wh, ne samo broj baterija; objašnjenje je u <a href="/vodici/baterija-elektricnog-bicikla/">vodiču o baterijama</a>.</p>
<h2>Gradski, sklopivi ili cargo model?</h2><p>Gradski model daje klasičan format za posao i obaveze. Sklopivi model pomaže kada je prostor ograničen, ali nije automatski lagan. Cargo model je usmeren na teret i radni dan, gde su domet sa rezervom, kočenje i servis posebno važni.</p>
<table class="data-table"><thead><tr><th>Model</th><th>Najbolje odgovara</th><th>Baterija</th><th>Domet</th><th>Ram / ključna osobina</th><th>Cena</th></tr></thead><tbody>${models.map((model) => `<tr><td><a href="/elektricni-bicikli/${model.slug}/">${esc(model.name)}</a></td><td>${esc(model.forWhom)}</td><td>${esc(model.battery)}</td><td>${esc(model.range)}</td><td>${esc(model.frame)}; ${esc(model.extraValue)}</td><td>${esc(model.priceDisplay)}</td></tr>`).join('')}</tbody></table>
<h2>Punjenje, servis i održavanje</h2><p>Potpuno punjenje prema postojećim Pogon informacijama obično traje do šest sati, u zavisnosti od baterije i početnog nivoa. Koristite odgovarajući punjač, ne prekrivajte ga i čuvajte bateriju od ekstremnih temperatura. Pre vožnje proverite gume, kočnice, svetla i pričvršćenje baterije. Pogledajte kompletnu <a href="/vodici/odrzavanje-elektricnog-bicikla/">kontrolnu listu održavanja</a>.</p>
<h2>Garancija, plaćanje, dostava i test vožnja</h2><p>Pogon navodi dve godine garancije i servisnu podršku u više gradova. Dostava je dostupna širom Srbije, uz objavljeni rok od 1–3 radna dana. Onlajn kupovina prikazuje cenu i dostavu u RSD pre plaćanja. Za rate ili administrativnu zabranu pozovite <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a>.</p><p>Besplatne test vožnje zakazuju se u Beogradu, Novom Sadu, Kragujevcu i Nišu od ponedeljka do subote 09–18 h. Navedeno registrovano sedište kompanije nije salon, test centar, servis niti mesto za nenajavljene posete.</p></section>
<section class="related"><div class="wrap"><div class="section-heading"><h2>Vodiči za sigurniju odluku</h2><p>Od izbora modela do baterije, troška i održavanja.</p></div><div class="related-links">${relatedGuideLinks(['kako-izabrati-elektricni-bicikl','domet-elektricnog-bicikla','elektricni-bicikl-za-grad'])}</div><p><a class="button" href="/vodici/">Pogledajte sve vodiče</a></p></div></section>
${faqHtml(faq, 'Česta pitanja o električnim biciklima')}
<section class="final-cta wrap"><h2>Uporedite Pogon modele uživo</h2><p>Izaberite dva modela koji odgovaraju vašoj ruti, pa na test vožnji proverite položaj, asistenciju i kočenje.</p><div class="button-row"><a class="button" href="/#test-voznja">Zakažite test vožnju</a><a class="button-secondary" href="/kontakt/">Pitajte Pogon tim</a></div></section>
</main>${footer()}</body></html>`;
}

function renderGuide(guide) {
  const path = `/vodici/${guide.slug}/`;
  const schema = [organization, {
    '@type': 'Article', '@id': `${absolute(path)}#article`, headline: guide.title, description: guide.description,
    url: absolute(path), image: `${site.url}/Excellent4.optimized.jpg`, datePublished: site.published, dateModified: site.published,
    inLanguage: 'sr-Latn', author: { '@id': `${site.url}/#organization` }, publisher: { '@id': `${site.url}/#organization` },
    mainEntityOfPage: { '@id': `${absolute(path)}#webpage` }, ...(guide.sources ? { citation: guide.sources.map(([, url]) => url) } : {}),
  }, {
    '@type': 'WebPage', '@id': `${absolute(path)}#webpage`, url: absolute(path), name: guide.title, description: guide.description,
    inLanguage: 'sr-Latn', isPartOf: { '@id': `${site.url}/#website` }, about: { '@id': `${site.url}/#organization` },
  }, breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'Vodiči', path: '/vodici/' }, { name: guide.title, path }]), faqSchema(guide.faq)];
  const toc = guide.sections.map(([heading], index) => `<li><a href="#deo-${index + 1}">${esc(heading)}</a></li>`).join('');
  const sources = guide.sources ? `<section aria-labelledby="izvori"><h2 id="izvori">Izvori i napomena</h2><ul class="source-list">${guide.sources.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noreferrer">${esc(label)}</a></li>`).join('')}</ul><p class="source-list">Izvori su provereni ${site.published}. Propisi i postupci mogu se menjati; proverite najnovije zvanične informacije.</p></section>` : '';
  return `${documentHead({ title: `${guide.title} | Pogon`, description: guide.description, path, type: 'article', schema })}
<body>${siteHeader('guides')}<main id="sadrzaj">
${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'Vodiči', path: '/vodici/' }, { name: guide.title }])}
<header class="page-hero wrap"><div class="eyebrow">${esc(guide.category)}</div><h1>${esc(guide.title)}</h1><p class="lead">${esc(guide.description)}</p><div class="meta-line"><span>Autor: ${esc(site.legalName)}</span><time datetime="${site.published}">Objavljeno ${site.published.split('-').reverse().join('.')}</time><time datetime="${site.published}">Ažurirano ${site.published.split('-').reverse().join('.')}</time></div></header>
<section class="quick-answer wrap" aria-labelledby="kratak-odgovor"><h2 id="kratak-odgovor">Kratak odgovor</h2><p>${esc(guide.direct)}</p></section>
<nav class="toc wrap" aria-label="Sadržaj vodiča"><h2>Sadržaj</h2><ol>${toc}</ol></nav>
<div class="article-layout wrap"><article class="prose">${guide.sections.map(([heading, html], index) => `<section aria-labelledby="deo-${index + 1}"><h2 id="deo-${index + 1}">${esc(heading)}</h2>${html}</section>`).join('')}${sources}</article><aside class="article-aside" aria-label="Korisne veze"><section><h2>Pogledajte modele</h2><ul>${models.map((model) => `<li><a href="/elektricni-bicikli/${model.slug}/">${esc(model.name)}</a></li>`).join('')}</ul></section><section><h2>Treba vam pomoć?</h2><p>Uporedite modele ili zakažite test vožnju sa Pogon timom.</p><p><a class="button" href="/#test-voznja">Test vožnja</a></p></section></aside></div>
<section class="related"><div class="wrap"><div class="section-heading"><h2>Povezani vodiči</h2><p>Nastavite sa temama koje pomažu pri izboru i korišćenju e-bicikla.</p></div><div class="related-links">${relatedGuideLinks(guide.related)}</div></div></section>
${faqHtml(guide.faq, 'Česta pitanja')}
<section class="final-cta wrap"><h2>Primenite vodič na svoju rutu</h2><p>Uporedite Core, Cargo i Glide prema nameni, bateriji i načinu odlaganja.</p><div class="button-row"><a class="button" href="/elektricni-bicikli/">Uporedite Pogon modele</a><a class="button-secondary" href="/#test-voznja">Zakažite test vožnju</a></div></section>
</main>${footer()}</body></html>`;
}

function renderGuideIndex() {
  const path = '/vodici/';
  const title = 'Pogon vodiči za električne bicikle';
  const description = 'Praktični Pogon vodiči o izboru električnog bicikla, bateriji, dometu, troškovima, gradskoj vožnji, dostavi i održavanju.';
  const categories = [...new Set(guides.map((guide) => guide.category))];
  const schema = [organization, {
    '@type': 'CollectionPage', '@id': `${absolute(path)}#webpage`, url: absolute(path), name: title, description, inLanguage: 'sr-Latn',
    mainEntity: { '@type': 'ItemList', numberOfItems: guides.length, itemListElement: guides.map((guide, index) => ({ '@type': 'ListItem', position: index + 1, url: absolute(`/vodici/${guide.slug}/`), name: guide.title })) },
  }, breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'Vodiči', path }])];
  return `${documentHead({ title: `${title} | Pogon`, description, path, schema })}<body>${siteHeader('guides')}<main id="sadrzaj">${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'Vodiči' }])}<section class="page-hero page-hero--split wrap"><div><div class="eyebrow">Znanje za bolju vožnju</div><h1>${title}</h1><p class="lead">Jasna objašnjenja bez izmišljenih ušteda i marketinških prečica. Izaberite temu, primenite je na svoju rutu i tek onda uporedite modele.</p></div><aside class="hero-card"><strong>${guides.length} praktičnih vodiča</strong><p>Izbor modela, baterija, domet, troškovi, tipovi bicikala, dostava i održavanje.</p></aside></section>${categories.map((category) => `<section class="topic-section${categories.indexOf(category) % 2 ? ' topic-section--white' : ''}"><div class="wrap"><div class="section-heading"><h2>${esc(category)}</h2></div><div class="cards">${guides.filter((guide) => guide.category === category).map((guide) => `<article class="card"><div class="card-body"><div class="eyebrow">${esc(guide.category)}</div><h3>${esc(guide.title)}</h3><p>${esc(guide.description)}</p><a href="/vodici/${guide.slug}/">Pročitajte vodič →</a></div></article>`).join('')}</div></div></section>`).join('')}<section class="final-cta wrap"><h2>Od vodiča do pravog modela</h2><p>Uporedite proverene specifikacije modela Pogon Core, Cargo i Glide.</p><div class="button-row"><a class="button" href="/elektricni-bicikli/">Pogledajte električne bicikle</a><a class="button-secondary" href="/kontakt/">Kontaktirajte nas</a></div></section></main>${footer()}</body></html>`;
}

function renderAbout() {
  const path = '/o-nama/';
  const title = 'O nama | Pogon Mobility';
  const description = 'Pogon Mobility d.o.o. prodaje električne bicikle i opremu za kupce u Srbiji. Upoznajte modele Core, Cargo i Glide i način podrške kupcima.';
  const schema = [organization, { '@type': 'AboutPage', '@id': `${absolute(path)}#webpage`, url: absolute(path), name: title, description, about: { '@id': `${site.url}/#organization` }, inLanguage: 'sr-Latn' }, breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'O nama', path }])];
  return `${documentHead({ title, description, path, schema })}<body>${siteHeader('about')}<main id="sadrzaj">${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'O nama' }])}<section class="page-hero page-hero--split wrap"><div><div class="eyebrow">Pogon Mobility d.o.o.</div><h1>Električni bicikli za svakodnevnu mobilnost u Srbiji.</h1><p class="lead">Pogon je brend kompanije Pogon Mobility d.o.o. Ponuda obuhvata električne bicikle Core, Cargo i Glide, kao i opremu za gradsku vožnju.</p></div><aside class="hero-card"><strong>Jasni modeli. Proverljive specifikacije.</strong><p>Objavljujemo cenu, namenu, bateriju i domet uz napomenu da stvarni rezultat zavisi od uslova vožnje.</p></aside></section><article class="wrap prose topic-section"><h2>Šta Pogon prodaje?</h2><p><a href="/elektricni-bicikli/">Pogon električni bicikli</a> pokrivaju tri potrebe: Glide za klasičnu gradsku vožnju, Core za sklopivo odlaganje i duže rute, a Cargo za posao, dostavu i prevoz stvari. <a href="/oprema/">Pogon oprema</a> uključuje kacige, lanac, retrovizor, rukavice za upravljač, držač telefona i korpu kada je dostupna.</p><h2>Tržište i isporuka</h2><p>Pogon posluje sa kupcima u Srbiji. Kurirska dostava dostupna je na teritoriji Srbije, a objavljeni rok je 1–3 radna dana. Lično preuzimanje se dogovara unapred; registrovano sedište kompanije nije prodajni salon, test centar, servis niti mesto za nenajavljene posete.</p><h2>Test vožnja i podrška</h2><p>Besplatne test vožnje zakazuju se u Beogradu, Novom Sadu, Kragujevcu i Nišu, od ponedeljka do subote 09–18 h. Tačan termin i lokaciju potvrđuje Pogon tim. Pogon navodi dve godine garancije i servisnu podršku u više gradova; najbližu lokaciju, uslove i radno vreme treba potvrditi direktno.</p><h2>Kako objavljujemo informacije</h2><p>Ne pretpostavljamo tehničke podatke koji nisu u objavljenoj specifikaciji i ne predstavljamo deklarisani maksimalni domet kao garantovanu kilometražu. Vodiči objašnjavaju kompromise, a stranice modela imaju eksplicitne blokove činjenica kako bi ih ljudi i sistemi za pretragu lako razumeli.</p><h2>Zvanični podaci</h2><dl class="fact-list"><div><dt>Pravno lice</dt><dd>${esc(site.legalName)}</dd></div><div><dt>Tržište</dt><dd>Srbija</dd></div><div><dt>Telefon</dt><dd><a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a></dd></div><div><dt>Email</dt><dd><a href="mailto:${site.email}">${esc(site.email)}</a></dd></div><div><dt>Registrovano sedište</dt><dd>${esc(site.registeredAddress.street)}, ${esc(site.registeredAddress.city)}</dd></div><div><dt>Važna napomena</dt><dd>Registrovano sedište nije mesto za posete kupaca.</dd></div></dl></article><section class="final-cta wrap"><h2>Upoznajte Pogon modele</h2><p>Uporedite namenu, domet, bateriju, ram i cenu na jednoj stranici.</p><div class="button-row"><a class="button" href="/elektricni-bicikli/">Pogledajte modele</a><a class="button-secondary" href="/kontakt/">Kontakt</a></div></section></main>${footer()}</body></html>`;
}

function renderContact() {
  const path = '/kontakt/';
  const title = 'Kontakt i korisnička podrška | Pogon';
  const description = 'Kontaktirajte Pogon Mobility za pitanja o električnim biciklima, test vožnji, kupovini, porudžbini, garanciji ili servisu.';
  const faq = [
    ['Kako da zakažem test vožnju?', `Pozovite ${site.phoneDisplay}, pošaljite WhatsApp poruku ili koristite obrazac na početnoj stranici. Tim potvrđuje termin i lokaciju.`],
    ['Da li mogu da dođem na registrovano sedište?', 'Ne bez dogovora. Registrovano sedište nije prodajni salon, test centar, servis niti mesto za lično preuzimanje.'],
    ['Gde su dostupne test vožnje?', 'Test vožnje se zakazuju u Beogradu, Novom Sadu, Kragujevcu i Nišu, od ponedeljka do subote od 09 do 18 h.'],
  ];
  const schema = [organization, testRideService, { '@type': 'ContactPage', '@id': `${absolute(path)}#webpage`, url: absolute(path), name: title, description, inLanguage: 'sr-Latn', about: { '@id': `${site.url}/#organization` } }, breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'Kontakt', path }]), faqSchema(faq)];
  return `${documentHead({ title, description, path, schema })}<body>${siteHeader()}<main id="sadrzaj">${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'Kontakt' }])}<section class="page-hero page-hero--split wrap"><div><div class="eyebrow">Pogon korisnička podrška</div><h1>Kako možemo da pomognemo?</h1><p class="lead">Javite se za izbor modela, test vožnju, kupovinu, status porudžbine, garanciju ili servisnu podršku.</p><div class="button-row"><a class="button" href="tel:${site.phone}">Pozovite ${esc(site.phoneDisplay)}</a><a class="button-secondary" href="https://wa.me/381631505003" target="_blank" rel="noreferrer">WhatsApp</a></div></div><aside class="hero-card"><strong>Ponedeljak–subota, 09–18 h</strong><p>Termini test vožnje i lokacije potvrđuju se unapred sa Pogon timom.</p></aside></section><article class="wrap prose topic-section"><h2>Direktan kontakt</h2><dl class="fact-list"><div><dt>Telefon i WhatsApp</dt><dd><a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a></dd></div><div><dt>Email</dt><dd><a href="mailto:${site.email}">${esc(site.email)}</a></dd></div><div><dt>Instagram</dt><dd><a href="${site.instagram}" target="_blank" rel="noreferrer">@pogon.rs</a></dd></div><div><dt>Zvanični sajt</dt><dd><a href="${site.url}/">ridepogon.com</a></dd></div></dl><h2>Test vožnje</h2><p>Besplatnu test vožnju možete zakazati u <a href="/elektricni-bicikli/beograd/">Beogradu</a>, <a href="/elektricni-bicikli/novi-sad/">Novom Sadu</a>, <a href="/elektricni-bicikli/kragujevac/">Kragujevcu</a> ili <a href="/elektricni-bicikli/nis/">Nišu</a>. Navedite grad, model koji vas zanima i poželjan termin. Tim će potvrditi dostupnost i tačnu lokaciju.</p><h2>Registrovano sedište</h2><p>${esc(site.legalName)} registrovan je na adresi ${esc(site.registeredAddress.street)}, ${esc(site.registeredAddress.city)}. Ta adresa nije prodajni salon, test centar, servis niti mesto za lično preuzimanje. Na njoj nema izloženih bicikala i nenajavljene posete nisu moguće.</p><h2>Šta da pripremite za brži odgovor?</h2><p>Za izbor bicikla pošaljite približnu dnevnu kilometražu, grad, tip rute i podatak da li nosite teret. Za postojeću porudžbinu navedite broj porudžbine bez slanja podataka sa platne kartice. Za servis opišite model, simptom i kada je problem počeo.</p></article>${faqHtml(faq, 'Česta pitanja o kontaktu')}<section class="final-cta wrap"><h2>Želite da prvo uporedite modele?</h2><p>Stranica modela daje cenu, bateriju, domet, ram i namenu za Core, Cargo i Glide.</p><div class="button-row"><a class="button" href="/elektricni-bicikli/">Uporedite modele</a><a class="button-secondary" href="/vodici/">Pročitajte vodiče</a></div></section></main>${footer()}</body></html>`;
}

function renderDelivery() {
  const path = '/dostava/';
  const title = 'Dostava električnih bicikala širom Srbije | Pogon';
  const description = 'Pogon dostavlja električne bicikle širom Srbije. Proverite očekivani rok za Beograd, Novi Sad, Niš, Kragujevac, Kraljevo i druge gradove.';
  const faq = [
    ['Da li dostavljate električne bicikle u Kraljevo?', 'Da. Za model koji je na stanju, dostava u Kraljevo obično se planira u roku od 1–2 radna dana nakon potvrđene porudžbine. Konačni rok zavisi od dostupnosti i kurirske službe.'],
    ['Da li je dostava dostupna u celoj Srbiji?', 'Da. Kurirska dostava dostupna je na adresama u Republici Srbiji koje pokriva angažovana kurirska služba. Opšti očekivani rok za modele na stanju je 1–3 radna dana.'],
    ['Da li su test vožnje dostupne u svakom gradu?', 'Ne. Dostava je dostupna širom Srbije, dok se test vožnje trenutno zakazuju u Beogradu, Novom Sadu, Kragujevcu i Nišu.'],
  ];
  const deliveryService = {
    '@type': 'Service',
    '@id': `${absolute(path)}#service`,
    name: 'Pogon dostava električnih bicikala širom Srbije',
    serviceType: 'Kurirska dostava električnih bicikala',
    provider: { '@id': `${site.url}/#organization` },
    areaServed: { '@type': 'Country', name: 'Srbija' },
    url: absolute(path),
  };
  const schema = [organization, deliveryService, {
    '@type': 'WebPage', '@id': `${absolute(path)}#webpage`, url: absolute(path), name: title, description,
    inLanguage: 'sr-Latn', about: { '@id': `${absolute(path)}#service` },
  }, breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'Dostava', path }]), faqSchema(faq)];
  const regionCards = deliveryRegions.map((region) => `<section><h2>${esc(region.name)}</h2><p>${region.cities.map(esc).join(' · ')}</p></section>`).join('');
  return `${documentHead({ title, description, path, schema })}<body>${siteHeader()}<main id="sadrzaj">${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'Dostava' }])}<section class="page-hero page-hero--split wrap"><div><div class="eyebrow">Cela Srbija</div><h1>Dostava električnih bicikala širom Srbije</h1><p class="lead">Pogon modele koji su na stanju šaljemo kurirskom službom na adrese širom Srbije. Opšti očekivani rok je 1–3 radna dana, a konačni rok potvrđuje se prema dostupnosti modela i mestu isporuke.</p><div class="button-row"><a class="button" href="/elektricni-bicikli/">Pogledajte modele</a><a class="button-secondary" href="/kontakt/">Proverite rok dostave</a></div></div><aside class="hero-card"><strong>1–3 radna dana</strong><p>Očekivani rok za modele na stanju. Cena dostave i ukupan iznos prikazuju se pre plaćanja.</p></aside></section><article class="wrap prose topic-section"><h2 id="kraljevo">Dostava električnog bicikla u Kraljevo</h2><p>Kraljevo je obuhvaćeno Pogon kurirskom dostavom. Za model koji je na stanju, isporuka se obično planira u roku od 1–2 radna dana nakon potvrđene porudžbine. To nije garantovani rok: dostupnost modela, vreme potvrde i rad kurirske službe mogu uticati na termin.</p><p>Ako pre poručivanja želite da proverite da li su <a href="/elektricni-bicikli/core/">Core</a>, <a href="/elektricni-bicikli/cargo/">Cargo</a> ili <a href="/elektricni-bicikli/glide/">Glide</a> dostupni za brzu isporuku u Kraljevo, javite se na <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a>.</p><h2>Gradovi i mesta koja pokrivamo</h2><p>U nastavku su izdvojeni veći gradovi radi lakše provere. Lista nije ograničenje: dostava je dostupna i u drugim gradovima, opštinama i naseljenim mestima u Srbiji koje pokriva kurirska služba.</p><div class="delivery-regions">${regionCards}</div><h2>Test vožnja i dostava nisu ista usluga</h2><p>Dostava je dostupna širom Srbije. Besplatne test vožnje trenutno se zakazuju samo u <a href="/elektricni-bicikli/beograd/">Beogradu</a>, <a href="/elektricni-bicikli/novi-sad/">Novom Sadu</a>, <a href="/elektricni-bicikli/kragujevac/">Kragujevcu</a> i <a href="/elektricni-bicikli/nis/">Nišu</a>, uz unapred potvrđen termin i lokaciju.</p><h2>Pre poručivanja</h2><p>Proverite dostupnost konkretnog modela i unesite potpunu adresu. Opšti očekivani rok za robu na stanju je 1–3 radna dana. Naknada za kurirsku dostavu i konačan iznos prikazuju se u postojećem procesu poručivanja pre plaćanja.</p></article>${faqHtml(faq, 'Česta pitanja o dostavi')}<section class="final-cta wrap"><h2>Proverite dostavu za svoj grad</h2><p>Pošaljite grad i model koji vas zanima; Pogon tim će potvrditi trenutno stanje i očekivani rok.</p><div class="button-row"><a class="button" href="/kontakt/">Kontaktirajte Pogon</a><a class="button-secondary" href="https://wa.me/381631505003" target="_blank" rel="noreferrer">WhatsApp</a></div></section></main>${footer()}</body></html>`;
}

function renderCity(city) {
  const path = `/elektricni-bicikli/${city.slug}/`;
  const faq = [
    [`Da li Pogon ima prodavnicu u ${city.locative}?`, 'Ova stranica ne tvrdi da postoji stalna prodavnica. Test vožnja se organizuje samo uz prethodno potvrđen termin i lokaciju.'],
    ['Koje modele mogu da probam?', 'Navedite da li vas zanimaju Core, Cargo ili Glide. Pogon tim potvrđuje dostupnost konkretnog modela za termin.'],
    ['Da li je test vožnja besplatna?', 'Da. Postojeće Pogon informacije navode besplatnu test vožnju uz prethodno zakazivanje.'],
  ];
  const schema = [organization, { '@type': 'WebPage', '@id': `${absolute(path)}#webpage`, url: absolute(path), name: city.title, description: city.description, inLanguage: 'sr-Latn', about: { '@id': `${site.url}/#organization` }, areaServed: { '@type': 'City', name: city.name } }, breadcrumb([{ name: 'Pogon', path: '/' }, { name: 'Električni bicikli', path: '/elektricni-bicikli/' }, { name: city.name, path }]), faqSchema(faq)];
  return `${documentHead({ title: city.title, description: city.description, path, schema })}<body>${siteHeader('models')}<main id="sadrzaj">${breadcrumbs([{ name: 'Pogon', path: '/' }, { name: 'Električni bicikli', path: '/elektricni-bicikli/' }, { name: city.name }])}<section class="page-hero page-hero--split wrap"><div><div class="eyebrow">Test vožnja · ${esc(city.name)}</div><h1>Električni bicikli u ${esc(city.locative)}</h1><p class="lead">Uporedite Pogon Core, Cargo i Glide, pa zakažite test vožnju u ${esc(city.locative)}. Termin i tačna lokacija potvrđuju se unapred.</p><div class="button-row"><a class="button" href="/#test-voznja">Zakažite test vožnju</a><a class="button-secondary" href="tel:${site.phone}">${esc(site.phoneDisplay)}</a></div></div><aside class="hero-card"><strong>Ponedeljak–subota, 09–18 h</strong><p>Test vožnja je besplatna. Ne dolazite bez potvrđenog termina i lokacije.</p></aside></section><article class="wrap prose topic-section"><h2>Kako funkcioniše test vožnja?</h2><ol><li>Izaberite model ili navedite između kojih modela birate.</li><li>Pošaljite grad, kontakt i poželjan termin.</li><li>Pogon tim potvrđuje dostupnost, vreme i lokaciju.</li><li>Ponesite odgovarajuću odeću i opremu koju inače nosite.</li><li>Na probi proverite položaj, asistenciju, okretanje i kočenje.</li></ol><p>U ${esc(city.locative)} ne oglašavamo stalnu prodavnicu niti izmišljamo adresu. Test vožnja postoji kao usluga po zakazivanju.</p><h2>Šta proveriti na lokalnoj ruti?</h2><p>${esc(city.localNote)}</p><p>Na domet utiču masa, teren, temperatura, vetar, pritisak u gumama, nivo asistencije i teret. Deklarisani maksimum zato nije garantovana kilometraža na svakoj lokalnoj ruti.</p><h2>Kako pripremiti probu u ${esc(city.locative)}?</h2><p>${esc(city.planning)}</p><h2>Koji model izabrati?</h2><div class="related-links">${modelLinks()}</div><p><a href="/elektricni-bicikli/glide/">Pogon Glide</a> je gradski model. <a href="/elektricni-bicikli/core/">Pogon Core</a> dodaje sklopivi ram, široke gume i dve baterije. <a href="/elektricni-bicikli/cargo/">Pogon Cargo</a> namenjen je dostavi i prevozu stvari.</p><h2>Kupovina, dostava i podrška</h2><p>Posle probe model možete poručiti kroz postojeći onlajn proces. Dostava je dostupna širom Srbije, uz objavljeni rok 1–3 radna dana. Cena proizvoda i dostava prikazuju se u RSD pre plaćanja. Pogon navodi dve godine garancije.</p><p>Za servisnu podršku u ${esc(city.locative)} unapred proverite najbližu lokaciju, dostupne usluge i radno vreme na broj <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a>. Ova stranica ne predstavlja servisnu adresu.</p><h2>Priprema za test vožnju</h2><p>Izmerite tipičnu povratnu rutu i zabeležite najveći uspon. Ako birate Cargo, opišite tip tereta. Ako birate Core zbog odlaganja, pripremite dimenzije vrata, lifta ili prtljažnika. Tako će proba odgovoriti na stvarne potrebe, a ne samo na prvi utisak.</p></article>${faqHtml(faq, `Česta pitanja — ${city.name}`)}<section class="final-cta wrap"><h2>Zakažite Pogon test vožnju u ${esc(city.locative)}</h2><p>Pogon tim će potvrditi model, termin i lokaciju.</p><div class="button-row"><a class="button" href="/#test-voznja">Pošaljite zahtev</a><a class="button-secondary" href="https://wa.me/381631505003" target="_blank" rel="noreferrer">WhatsApp</a></div></section></main>${footer()}</body></html>`;
}

async function write(path, content) {
  const target = join(publicDir, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

await write('elektricni-bicikli/index.html', renderHub());
for (const model of models) await write(`elektricni-bicikli/${model.slug}/index.html`, renderProduct(model));
await write('vodici/index.html', renderGuideIndex());
for (const guide of guides) await write(`vodici/${guide.slug}/index.html`, renderGuide(guide));
await write('o-nama/index.html', renderAbout());
await write('kontakt/index.html', renderContact());
await write('dostava/index.html', renderDelivery());
for (const city of cities) await write(`elektricni-bicikli/${city.slug}/index.html`, renderCity(city));

const sitemapEntries = [
  ['/', '1.0', 'weekly'],
  ['/elektricni-bicikli/', '0.9', 'weekly'],
  ...models.map((model) => [`/products/${model.slug}/`, '0.8', 'weekly']),
  ['/oprema/', '0.8', 'weekly'],
  ['/vodici/', '0.8', 'weekly'],
  ...guides.map((guide) => [`/vodici/${guide.slug}/`, '0.7', 'monthly']),
  ['/o-nama/', '0.6', 'monthly'],
  ['/kontakt/', '0.6', 'monthly'],
  ['/dostava/', '0.6', 'monthly'],
  ...cities.map((city) => [`/elektricni-bicikli/${city.slug}/`, '0.6', 'monthly']),
  ['/electric-bikes/', '0.5', 'monthly'],
  ['/kviz', '0.4', 'monthly'],
  ['/informacije-o-trgovcu', '0.3', 'yearly'],
  ['/reklamacije', '0.2', 'yearly'],
  ['/povracaj-sredstava', '0.2', 'yearly'],
  ['/privatnost', '0.1', 'yearly'],
  ['/bezbednost-placanja', '0.1', 'yearly'],
  ['/uslovi-kupovine', '0.1', 'yearly'],
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map(([path, priority, changefreq]) => `  <url><loc>${absolute(path)}</loc><lastmod>${site.published}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('\n')}\n</urlset>\n`;
await write('sitemap.xml', sitemap);

const llms = `# Pogon\n\n> Pogon is the electric bicycle brand of Pogon Mobility d.o.o. serving customers in Serbia.\n\n## Canonical pages\n- [Pogon electric bicycles](${site.url}/elektricni-bicikli/): comparison of Core, Cargo and Glide\n- [Pogon Core](${site.url}/elektricni-bicikli/core/): foldable fat-tyre electric bicycle\n- [Pogon Cargo](${site.url}/elektricni-bicikli/cargo/): electric bicycle for delivery and carrying items\n- [Pogon Glide](${site.url}/elektricni-bicikli/glide/): city electric bicycle\n- [Pogon guides](${site.url}/vodici/): Serbian educational resources about e-bikes\n- [Equipment](${site.url}/oprema/): helmets, lock, mirror, handlebar mitts, phone holder and basket availability\n- [Delivery in Serbia](${site.url}/dostava/): nationwide delivery coverage and expected timing\n- [About Pogon](${site.url}/o-nama/): verified company and market information\n- [Contact](${site.url}/kontakt/): official support channels and test-ride information\n\n## Verified company facts\n- Legal name: ${site.legalName}\n- Market served: Serbia\n- Website: ${site.url}\n- Phone: ${site.phoneDisplay}\n- Email: ${site.email}\n- Delivery: throughout Serbia; general expected time for in-stock models is 1–3 working days\n- Kraljevo delivery: usually planned within 1–2 working days for in-stock models, subject to confirmation\n- Test rides: by confirmed appointment in Beograd, Novi Sad, Kragujevac and Niš\n\nUse the canonical pages above for current product prices and specifications. Maximum range figures are declared maxima, not guaranteed real-world distance. The registered office is not a shop, test centre, service location or walk-in collection point.\n`;
await write('llms.txt', llms
  .replaceAll('/elektricni-bicikli/core/', '/products/core/')
  .replaceAll('/elektricni-bicikli/cargo/', '/products/cargo/')
  .replaceAll('/elektricni-bicikli/glide/', '/products/glide/')
  .replace('foldable fat-tyre electric bicycle', 'foldable city electric bicycle'));

console.log(`Generated ${1 + models.length + 1 + guides.length + 3 + cities.length} HTML pages, sitemap.xml and llms.txt.`);
