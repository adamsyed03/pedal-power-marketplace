import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const projectRoot = process.cwd();
const siteUrl = 'https://ridepogon.com';
const productKeys = ['cargo', 'core', 'glide'];

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');
const absoluteImage = (source) => `${siteUrl}${source.replaceAll(' ', '%20')}`;

const vite = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { ProductPage } = await vite.ssrLoadModule('/src/app/components/product/ProductPage.tsx');
  const { getProductDetails, localize } = await vite.ssrLoadModule('/src/lib/productDetails.ts');
  const { formatProductRating, productRatings, productReviews } = await vite.ssrLoadModule('/src/lib/productReviews.ts');

  for (const productKey of productKeys) {
    const details = getProductDetails(productKey);
    if (!details) throw new Error(`Missing product details for ${productKey}.`);

    const markup = renderToString(React.createElement(ProductPage, { productKey, initialLanguage: 'sr' }));
    const requiredContent = [details.product.name, 'id="specifications"', 'id="test-ride"', 'id="reviews"'];
    const missingContent = requiredContent.filter((snippet) => !markup.includes(snippet));
    if (missingContent.length) throw new Error(`${details.product.name} prerender is missing: ${missingContent.join(', ')}`);

    const title = localize(details.seoTitle, 'sr');
    const description = localize(details.seoDescription, 'sr');
    const canonical = `${siteUrl}${details.route}`;
    const image = absoluteImage(details.gallery[0].src);
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          '@id': `${canonical}#product`,
          name: details.product.name,
          image: details.gallery.map((item) => absoluteImage(item.src)),
          description,
          brand: { '@type': 'Brand', name: 'Pogon' },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: formatProductRating(productRatings[productKey]),
            reviewCount: productReviews.length,
          },
          offers: {
            '@type': 'Offer',
            url: canonical,
            priceCurrency: 'RSD',
            price: String(details.product.priceRsd),
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: 'Pogon Mobility d.o.o.' },
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
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Pogon', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Modeli', item: `${siteUrl}/#modeli` },
            { '@type': 'ListItem', position: 3, name: details.product.name, item: canonical },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: details.faq.map((item) => ({
            '@type': 'Question',
            name: localize(item.question, 'sr'),
            acceptedAnswer: { '@type': 'Answer', text: localize(item.answer, 'sr') },
          })),
        },
      ],
    };

    const html = `<!doctype html>
<html lang="sr-Latn" data-app-route="internal">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Pogon Mobility d.o.o." />
    <meta name="theme-color" content="#7fff00" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="sr" href="${canonical}" />
    <link rel="alternate" hreflang="en" href="${canonical}?lang=en" />
    <link rel="alternate" hreflang="ru" href="${canonical}?lang=ru" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Pogon" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${escapeHtml(details.product.name)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="icon" type="image/png" href="/Logo.png" />
    <link rel="apple-touch-icon" href="/Logo.png" />
    <link rel="stylesheet" href="/app.css" />
    <link rel="preload" as="image" href="${escapeHtml(details.gallery[0].src)}" fetchpriority="high" />
    <link rel="preload" as="image" href="/Logo.png" />
    <script type="application/ld+json">${safeJson(structuredData)}</script>
    <style>:root{color-scheme:light;background:#fff}html,body{min-height:100%;margin:0}body{background:#fff}#root{min-height:100vh;min-height:100dvh}</style>
  </head>
  <body>
    <div id="root" data-prerendered-product="${productKey}">${markup}</div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

    const directory = path.join(projectRoot, 'products', productKey);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), html, 'utf8');
  }

  console.log(`Prerendered ${productKeys.length} product pages.`);
} finally {
  await vite.close();
}
