const SITE_URL = 'https://ridepogon.com';
const DEFAULT_IMAGE = `${SITE_URL}/Excellent4.optimized.jpg`;

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  image?: string;
  type?: 'website' | 'article';
  language?: string;
  structuredData?: Record<string, unknown> | null;
};

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value));
};

const setCanonical = (path: string) => {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  canonical.href = `${SITE_URL}${path}`;
};

export function setPageMetadata({
  title,
  description,
  path,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  image = DEFAULT_IMAGE,
  type = 'website',
  language = 'sr-Latn',
  structuredData,
}: PageMetadata) {
  document.title = title;
  document.documentElement.lang = language;
  setCanonical(path);

  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Pogon' });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: `${SITE_URL}${path}` });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
  upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: title });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
  upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: title });

  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => element.remove());
  document.head.querySelector('script[type="application/ld+json"]:not(#route-structured-data)')?.remove();

  const existingStructuredData = document.getElementById('route-structured-data');
  existingStructuredData?.remove();

  if (structuredData) {
    const script = document.createElement('script');
    script.id = 'route-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}

export function setHomeMetadata(language: 'sr' | 'en' | 'ru', path = '/') {
  const content = {
    sr: {
      title: 'Pogon | Električni bicikli za grad',
      description: 'Pogon električni bicikli za gradsku vožnju. Uporedi Glide, Core i Cargo i zakaži test vožnju u Beogradu, Novom Sadu, Kragujevcu ili Nišu.',
      htmlLanguage: 'sr-Latn',
      locale: 'sr_RS',
    },
    en: {
      title: 'Pogon | Electric bikes for the city',
      description: 'Explore Pogon Glide, Core and Cargo electric bikes and book a test ride in Belgrade, Novi Sad, Kragujevac or Niš.',
      htmlLanguage: 'en',
      locale: 'en_US',
    },
    ru: {
      title: 'Pogon | Электровелосипеды для города',
      description: 'Сравните электровелосипеды Pogon Glide, Core и Cargo и запишитесь на тест-драйв в Белграде.',
      htmlLanguage: 'ru',
      locale: 'ru_RU',
    },
  }[language];

  const canonicalPath = language === 'sr' ? path : `${path}?lang=${language}`;
  document.title = content.title;
  document.documentElement.lang = content.htmlLanguage;
  setCanonical(canonicalPath);

  upsertMeta('meta[name="description"]', { name: 'description', content: content.description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
  upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: content.locale });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: content.title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: content.description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: `${SITE_URL}${canonicalPath}` });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: content.title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: content.description });
}

export const breadcrumbStructuredData = (name: string, path: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${path}#webpage`,
      url: `${SITE_URL}${path}`,
      name,
      inLanguage: 'sr-Latn',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Pogon', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name },
      ],
    },
  ],
});
