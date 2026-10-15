import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Bike, Check, CloudRain, Compass, MapPin, MessageCircle, ShieldCheck, Smartphone, Wrench } from 'lucide-react';
import { ImageWithFallback } from '../app/components/ImageWithFallback';
import { ProductGallery } from '../app/components/product/ProductGallery';
import { PromotionBanner } from '../app/components/PromotionBanner';
import { publicAsset } from '../lib/assets';
import { productDetails, type ProductMedia } from '../lib/productDetails';
import { setPageMetadata } from '../lib/seo';
import { trackEvent } from '../lib/analytics';
import { UkInterestForm } from './UkInterestForm';
import { UK_PRODUCT_COPY, UK_PRODUCT_PRICES, UK_WHATSAPP_DISPLAY, UK_WHATSAPP_HREF, type UkProductKey } from './ukMarket';

const english = (value: string): { sr: string; en: string; ru: string } => ({ sr: value, en: value, ru: value });

const foldGallery: ProductMedia[] = [
  { src: publicAsset('Cargo fold.jpg'), alt: english('Pogon Fold in its compact folded format'), width: 1122, height: 1402 },
];

const galleryFor = (model: UkProductKey) => model === 'fold' ? foldGallery : productDetails[model].gallery;

const ukHighlights: Record<UkProductKey, Array<{ value: string; label: string }>> = {
  cargo: [{ value: 'App', label: 'Phone control' }, { value: 'Premium', label: 'Utility design' }, { value: 'Single', label: 'UK battery configuration' }],
  core: [{ value: 'App', label: 'Phone control' }, { value: 'Folding', label: 'Versatile frame' }, { value: 'Single', label: 'UK battery configuration' }],
  glide: [{ value: 'App', label: 'Phone control' }, { value: 'NFC', label: 'Connected access' }, { value: 'Single', label: 'UK battery configuration' }],
  fold: [{ value: 'Compact', label: 'Folding format' }, { value: 'Single', label: 'UK battery configuration' }, { value: 'Soon', label: 'Availability updates' }],
};

const storyImages: Record<UkProductKey, string[]> = {
  cargo: ['/Core 1.jpg', '/Core 2.jpg'],
  core: ['/Cargo fold.jpg', '/Cargo 1.jpg'],
  glide: ['/Glide 1.jpg', '/Glide 2.jpg'],
  fold: ['/Cargo fold.jpg'],
};

const productOrder: UkProductKey[] = ['cargo', 'core', 'glide', 'fold'];

const ukFaq = [
  { question: 'Can I buy or reserve a Pogon online now?', answer: 'Not yet. The UK pages are validating demand and collecting expressions of interest only. No payment or reservation is taken.' },
  { question: 'Which battery configuration is shown for the UK?', answer: 'Every model on the UK site is presented in a single-battery configuration. Final confirmed specifications will be shared before launch.' },
  { question: 'How will UK servicing work?', answer: 'Pogon is developing its UK service partner network. The UK team will explain the options available for your location before any purchase decision.' },
  { question: 'Are the displayed prices inclusive of VAT?', answer: 'Yes. The displayed UK prices include VAT and are recorded with your expression of interest.' },
];

export function UkProductPage({ productKey }: { productKey: UkProductKey }) {
  const product = UK_PRODUCT_COPY[productKey];
  const price = UK_PRODUCT_PRICES[productKey];
  const unavailable = productKey === 'fold';
  const formId = unavailable ? 'notify' : 'interest';

  useEffect(() => {
    setPageMetadata({
      title: `Pogon ${product.name} UK | Premium European electric bike`,
      description: `${product.description} ${price.current}, VAT included. Register your interest for the Pogon UK launch.`,
      path: `/uk/products/${productKey}/`,
      language: 'en-GB',
      image: `https://ridepogon.com${galleryFor(productKey)[0].src}`,
      structuredData: null,
    });
    trackEvent('uk_product_view', { market: 'UK', model: productKey, displayed_price_gbp: price.amount });
  }, [price.amount, price.current, product.description, product.name, productKey]);

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-[#111]">
      <PromotionBanner language="en" market="uk" modelsHref="/uk/#modeli" />
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <a href="/uk" aria-label="Pogon UK home" className="flex items-center gap-3"><ImageWithFallback src={publicAsset('Logo.png')} alt="Pogon" width={483} height={187} className="h-8 w-auto object-contain" /><span className="rounded-full bg-black px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#7fff00]">UK</span></a>
          <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.12em] md:flex"><a href="/uk/#modeli" className="hover:opacity-55">Models</a><a href="#technology" className="hover:opacity-55">Technology</a><a href="#service" className="hover:opacity-55">Support</a></nav>
          <a href={UK_WHATSAPP_HREF} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-black text-white"><MessageCircle className="size-3.5 text-[#7fff00]" /><span className="hidden sm:inline">WhatsApp {UK_WHATSAPP_DISPLAY}</span><span className="sm:hidden">WhatsApp</span></a>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-12">
          <a href="/uk/#modeli" className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-black/50 hover:text-black"><ArrowLeft className="size-4" />All UK models</a>
          <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <ProductGallery media={galleryFor(productKey)} language="en" productName={`Pogon ${product.name}`} />
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-black/45">{product.category}</p>
              <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] sm:text-7xl">Pogon {product.name}</h1>
              <div className="relative">
                <div className={unavailable ? 'select-none blur-[6px] opacity-35' : ''}>
                  <p className="mt-5 max-w-xl text-xl font-semibold leading-8 text-black/65">{product.positioning}</p>
                  <p className="mt-5 max-w-xl leading-7 text-black/55">{product.description}</p>
                  <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2"><span className="text-4xl font-black tracking-tight">{price.current}</span><span className="pb-1 text-sm font-bold text-black/45">VAT included</span></div>
                  <div className="mt-8 grid grid-cols-3 border-y border-black/10">
                    {ukHighlights[productKey].map((item) => <div key={item.label} className="border-r border-black/10 px-2 py-5 text-center last:border-r-0"><div className="text-sm font-black sm:text-lg">{item.value}</div><div className="mt-1 text-[0.58rem] font-bold uppercase leading-4 tracking-[0.1em] text-black/40">{item.label}</div></div>)}
                  </div>
                </div>
                {unavailable ? <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"><div className="rounded-full bg-black px-8 py-4 text-center text-base font-black leading-tight text-white shadow-xl"><span className="block">sold out</span><span className="block">more coming soon</span></div></div> : null}
              </div>
              <a href={`#${formId}`} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#7fff00] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-black shadow-lg transition hover:bg-[#70e600]">{unavailable ? 'Notify me' : 'Register interest'}<ArrowRight className="size-4" /></a>
              <p className="mt-3 text-center text-xs leading-5 text-black/45">No payment or reservation is taken. UK availability will be confirmed by the Pogon team.</p>

              <section className="mt-8" aria-labelledby="uk-included-heading">
                <h2 id="uk-included-heading" className="text-lg font-black tracking-tight">included at no extra cost</h2>
                <div className="mt-3 space-y-2">
                  {[
                    { icon: ShieldCheck, name: 'two-year warranty' },
                    { icon: Bike, name: 'rear rack' },
                    { icon: CloudRain, name: 'mudguards' },
                    { icon: Smartphone, name: 'phone holder' },
                  ].map(({ icon: Icon, name }) => <div key={name} className="grid grid-cols-[auto_3rem_1fr_auto] items-center gap-3 border border-[#397700]/30 bg-[#7fff00]/[0.08] px-3 py-2.5"><Check className="size-4 text-[#397700]" /><span className="grid size-12 place-items-center bg-[#7fff00]/20 text-[#397700]"><Icon className="size-5" /></span><strong className="text-sm">{name}</strong><span className="text-sm font-black text-[#397700]">free</span></div>)}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="bg-black px-5 py-16 text-white sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1180px]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7fff00]">European premium series</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">A different lens on every journey.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">Pogon brings together distinctive European design, considered technology and the freedom to turn an ordinary route into something worth remembering.</p>
            <div className={`mt-12 grid gap-5 ${productKey === 'fold' ? '' : 'md:grid-cols-2'}`}>
              <article className="overflow-hidden rounded-3xl bg-white/5"><ImageWithFallback src={storyImages[productKey][0]} alt={`${product.name} design detail`} width={1122} height={1402} loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="p-7"><Compass className="size-6 text-[#7fff00]" /><h3 className="mt-5 text-2xl font-black">Made for more than the commute</h3><p className="mt-3 leading-7 text-white/55">A premium ride for new routes, unplanned turns and the kind of everyday adventure that changes how you see your surroundings.</p></div></article>
              {productKey !== 'fold' ? <article className="overflow-hidden rounded-3xl bg-white/5"><ImageWithFallback src={storyImages[productKey][1]} alt={`${product.name} premium component detail`} width={1122} height={1402} loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="p-7"><ShieldCheck className="size-6 text-[#7fff00]" /><h3 className="mt-5 text-2xl font-black">A considered UK configuration</h3><p className="mt-3 leading-7 text-white/55">The UK range is presented only in its single-battery configuration. Final model specifications and availability are confirmed before launch.</p></div></article> : null}
            </div>
          </div>
        </section>

        <section id="technology" className="mx-auto max-w-[1180px] scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-black/40">Cutting-edge connected technology</p>
          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Control your bike from your phone.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/55">The Pogon app puts supported bike controls, useful ride information and connected security in your pocket, creating a smarter relationship between you and your bike. Feature availability varies by model and is confirmed with the final UK specification.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[{ icon: Smartphone, title: 'App control', body: 'Manage supported bike controls and connected functions directly from your phone.' }, { icon: MapPin, title: 'Bike visibility', body: 'Check your bike location and connected status wherever supported services are available.' }, { icon: ShieldCheck, title: 'Smart security', body: 'GPS-backed visibility, connected protection and NFC access on supported models bring cutting-edge confidence to every ride.' }].map(({ icon: Icon, title, body }) => <article key={title} className="rounded-3xl border border-black/10 bg-white p-7"><Icon className="size-7" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-black/55">{body}</p></article>)}
          </div>
        </section>

        <section id="specifications" className="border-y border-black/10 bg-white px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1180px]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-black/40">UK product details</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">The essentials, clearly stated.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                ['Model', `Pogon ${product.name}`],
                ['Positioning', product.category],
                ['UK configuration', 'Single battery'],
                ['Displayed price', `${price.current}, VAT included`],
                ['Availability', unavailable ? 'Currently unavailable. More coming soon' : 'Registering UK interest'],
                ['Final specification', 'Confirmed with the UK team before launch'],
              ].map(([label, value]) => <div key={label} className="grid grid-cols-[0.8fr_1.2fr] gap-4 rounded-2xl border border-black/10 bg-[#f5f5f2] px-5 py-4 text-sm"><span className="text-black/45">{label}</span><span className="font-black">{value}</span></div>)}
            </div>
          </div>
        </section>

        <section id="service" className="border-y border-black/10 bg-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-2 lg:items-center">
            <div><Wrench className="size-8" /><h2 className="mt-5 text-4xl font-black tracking-tight">UK support, built with care.</h2><p className="mt-5 max-w-xl leading-7 text-black/55">Our UK service partner network is being developed. Register your interest and the UK team will explain the support and servicing options available for your location before any purchase decision.</p></div>
            <div className="grid gap-3"><a href={UK_WHATSAPP_HREF} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-black p-5 text-white"><span className="inline-flex items-center gap-3 font-black"><MessageCircle className="size-5 text-[#7fff00]" />WhatsApp {UK_WHATSAPP_DISPLAY}</span><ArrowRight className="size-4" /></a></div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.22em] text-black/40">Four models. Four perspectives.</p><h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Which Pogon is yours?</h2></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {productOrder.map((key) => {
                const item = UK_PRODUCT_COPY[key];
                const itemPrice = UK_PRODUCT_PRICES[key];
                const current = key === productKey;
                return <article key={key} className={`overflow-hidden rounded-3xl border-2 bg-white ${current ? 'border-black shadow-xl' : 'border-black/10'}`}><div className="relative aspect-[4/3] overflow-hidden bg-black"><ImageWithFallback src={galleryFor(key)[0].src} alt={`Pogon ${item.name}`} width={galleryFor(key)[0].width} height={galleryFor(key)[0].height} loading="lazy" className="h-full w-full object-cover" />{current ? <span className="absolute left-3 top-3 rounded-full bg-[#7fff00] px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em]">Current model</span> : null}{key === 'fold' ? <span className="absolute bottom-3 left-3 rounded-full bg-black px-3 py-1 text-[0.55rem] font-black uppercase tracking-[0.08em] text-white">Unavailable</span> : null}</div><div className="p-5"><h3 className="text-2xl font-black">{item.name}</h3><p className="mt-1 text-sm font-bold text-black/45">{itemPrice.current} · VAT included</p><p className="mt-3 min-h-16 text-sm leading-6 text-black/55">{item.positioning}</p>{current ? <span className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-black px-4 text-xs font-black uppercase tracking-[0.1em] text-white">You’re viewing this model</span> : <a href={`/uk/products/${key}/`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-black px-4 text-xs font-black uppercase tracking-[0.1em] transition-colors hover:bg-black hover:text-white">Discover {item.name}</a>}</div></article>;
              })}
            </div>
          </div>
        </section>

        <section className="bg-black px-5 py-16 text-white sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#7fff00]">No fine print</p><h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Frequently asked questions</h2></div>
            <div className="space-y-3">{ukFaq.map((item, index) => <details key={item.question} open={index === 0} className="group rounded-2xl border border-white/15 bg-white/[0.06]"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold"><span>{item.question}</span><span className="text-xl text-[#7fff00] transition-transform group-open:rotate-45">+</span></summary><p className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-7 text-white/60">{item.answer}</p></details>)}</div>
          </div>
        </section>

        <section id={formId} className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div><p className="text-xs font-black uppercase tracking-[0.22em] text-black/40">Pogon UK</p><h2 className="mt-4 text-4xl font-black tracking-tight">{unavailable ? 'Be first to hear when Fold returns.' : `Take the next step with ${product.name}.`}</h2><ul className="mt-7 space-y-3 text-sm text-black/60">{['No payment is taken', 'Saved with a clear UK landing page label', 'The UK team will contact you on WhatsApp'].map((item) => <li key={item} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-[#7fff00]"><Check className="size-3.5 text-black" /></span>{item}</li>)}</ul></div>
            <UkInterestForm model={productKey} notifyOnly={unavailable} />
          </div>
        </section>
      </main>

      <footer className="bg-black px-5 py-10 text-white sm:px-8"><div className="mx-auto flex max-w-[1180px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><a href="/uk"><ImageWithFallback src={publicAsset('Logo.png')} alt="Pogon" width={483} height={187} className="h-9 w-auto brightness-0 invert" /></a><div className="flex flex-wrap gap-5 text-sm font-bold text-white/65"><a href="/uk/#modeli">UK models</a><a href={UK_WHATSAPP_HREF} target="_blank" rel="noreferrer">WhatsApp {UK_WHATSAPP_DISPLAY}</a></div></div></footer>
    </div>
  );
}
