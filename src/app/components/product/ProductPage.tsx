import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Battery, Bike, CalendarCheck, CheckCircle2, ChevronDown, CircleGauge, CreditCard,
  FoldHorizontal, Lightbulb, LockKeyhole, MapPin, MessageCircle, PackageCheck,
  Shield, ShieldCheck, Sparkles, Star, Truck, Wrench,
} from 'lucide-react';
import { ProductGallery } from './ProductGallery';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import { ProductRatingStars } from './ProductRatingStars';
import { ProductCartDrawer, ProductFooter, ProductHeader, type ProductCartState } from './ProductSiteChrome';
import { ImageWithFallback } from '../ImageWithFallback';
import { formatRsd, products, type ProductKey } from '../../../lib/products';
import { bikeProductDetails, getProductDetails, localize, type BikeKey, type ProductDetails, type SiteLanguage } from '../../../lib/productDetails';
import { formatProductRating, productRatings, productReviews } from '../../../lib/productReviews';
import { submitLead } from '../../../lib/supabase';
import { trackEvent } from '../../../lib/analytics';
import { setPageMetadata } from '../../../lib/seo';

const CART_STORAGE_KEY = 'pogon-cart-v1';
const LEGACY_CART_STORAGE_KEY = 'pogon-accessory-cart-v1';

const pageCopy = {
  sr: {
    home: 'Početna', models: 'Modeli', reassurance: 'Kupovina bez nagađanja', highlights: 'Najvažnije na prvi pogled', features: 'Više razloga da izabereš ovaj model', specsEyebrow: 'Tehnički podaci', specs: 'Sve specifikacije na jednom mestu', boxEyebrow: 'Sadržaj paketa', box: 'Šta stiže uz bicikl?', boxCta: 'Potvrdi sadržaj paketa', delivery: 'Dostava u Srbiji', deliveryBody: 'Za modele na stanju objavljeni rok je 1–3 radna dana. Konačan rok i naknada potvrđuju se pre plaćanja.', warranty: '2 godine garancije', warrantyBody: 'Sačuvaj dokaz o kupovini i javi se podršci čim primetiš problem. Uslovi zavise od komponente i pravilne upotrebe.', service: 'Servis i podrška', serviceBody: 'Podrška je dostupna u više gradova. Najbližu lokaciju, usluge i radno vreme potvrdi sa Pogon timom.', testEyebrow: 'Probaj pre odluke', testTitle: 'Ne kupuj bicikl samo sa slike.', testBody: 'Provozaj Pogon pre nego što odlučiš. Test vožnje se zakazuju u Beogradu, Novom Sadu, Kragujevcu i Nišu.', name: 'Ime i prezime', phone: 'Telefon', city: 'Grad', time: 'Željeni termin', send: 'Pošalji zahtev', sending: 'Slanje...', success: 'Hvala! Javićemo ti se da potvrdimo model, termin i lokaciju.', error: 'Unesi ime, telefon i grad da bismo mogli da te kontaktiramo.', reviewsEyebrow: 'Stvarna Pogon iskustva', reviews: 'Šta kažu vozači', faqEyebrow: 'Bez sitnih slova', faq: 'Česta pitanja', compareEyebrow: 'Tri modela, tri namene', compare: 'Koji Pogon je za tebe?', price: 'Cena', range: 'Domet', battery: 'Baterija', frame: 'Ram', wheels: 'Točkovi', folding: 'Sklopiv', gps: 'GPS', bestFor: 'Najbolji za', yes: 'Da', no: 'Ne', finalTitle: 'Spreman za svoj Pogon?', finalBody: 'Kupi model odmah ili prvo zakaži test vožnju.', add: 'Kupi sada', test: 'Zakaži test vožnju', stickyAdded: 'Dodato', breadcrumb: 'Putanja', photo: 'Fotografija kupca', confirmed: 'Potvrđene informacije, jasna cena i podrška pre i posle kupovine.', payments: 'Do 12 rata', paymentsBody: 'Za kartice Banca Intesa; banka prikazuje tačne uslove pre potvrde.', testAvailable: 'Besplatna test vožnja', testAvailableBody: 'Uz unapred potvrđen termin i lokaciju u četiri grada.', support: 'Direktna podrška', supportBody: 'Telefon i WhatsApp: 063 15 05 003.',
  },
  en: {
    home: 'Home', models: 'Models', reassurance: 'A purchase without guesswork', highlights: 'The essentials at a glance', features: 'More reasons to choose this model', specsEyebrow: 'Technical data', specs: 'All specifications in one place', boxEyebrow: 'Box contents', box: 'What comes with the bike?', boxCta: 'Confirm box contents', delivery: 'Delivery in Serbia', deliveryBody: 'For in-stock models, the published delivery time is 1–3 working days. The final timing and fee are confirmed before payment.', warranty: '2-year warranty', warrantyBody: 'Keep your proof of purchase and contact support as soon as you notice a problem. Terms depend on the component and correct use.', service: 'Service and support', serviceBody: 'Support is available in several cities. Confirm the nearest location, services and opening hours with the Pogon team.', testEyebrow: 'Try before deciding', testTitle: 'Do not buy a bike from a picture alone.', testBody: 'Ride a Pogon before you decide. Test rides can be booked in Belgrade, Novi Sad, Kragujevac and Niš.', name: 'Full name', phone: 'Phone', city: 'City', time: 'Preferred time', send: 'Send request', sending: 'Sending...', success: 'Thank you! We will contact you to confirm the model, time and location.', error: 'Enter your name, phone and city so we can contact you.', reviewsEyebrow: 'Real Pogon experiences', reviews: 'What riders say', faqEyebrow: 'No fine print', faq: 'Frequently asked questions', compareEyebrow: 'Three models, three purposes', compare: 'Which Pogon is for you?', price: 'Price', range: 'Range', battery: 'Battery', frame: 'Frame', wheels: 'Wheels', folding: 'Folding', gps: 'GPS', bestFor: 'Best for', yes: 'Yes', no: 'No', finalTitle: 'Ready for your Pogon?', finalBody: 'Buy the model now or book a test ride first.', add: 'Buy now', test: 'Book a test ride', stickyAdded: 'Added', breadcrumb: 'Breadcrumb', photo: 'Customer photo', confirmed: 'Confirmed information, clear pricing and support before and after purchase.', payments: 'Up to 12 instalments', paymentsBody: 'For Banca Intesa cards; the bank shows exact terms before confirmation.', testAvailable: 'Free test ride', testAvailableBody: 'With a confirmed time and location in four cities.', support: 'Direct support', supportBody: 'Phone and WhatsApp: +381 63 15 05 003.',
  },
  ru: {
    home: 'Главная', models: 'Модели', reassurance: 'Покупка без догадок', highlights: 'Главное с первого взгляда', features: 'Больше причин выбрать эту модель', specsEyebrow: 'Технические данные', specs: 'Все характеристики в одном месте', boxEyebrow: 'Комплект', box: 'Что входит в комплект?', boxCta: 'Уточнить комплект', delivery: 'Доставка по Сербии', deliveryBody: 'Для моделей в наличии опубликованный срок — 1–3 рабочих дня. Итоговый срок и стоимость подтверждаются до оплаты.', warranty: 'Гарантия 2 года', warrantyBody: 'Сохраните подтверждение покупки и свяжитесь с поддержкой при первых признаках проблемы. Условия зависят от компонента и правильной эксплуатации.', service: 'Сервис и поддержка', serviceBody: 'Поддержка доступна в нескольких городах. Ближайшую точку, услуги и часы работы уточняйте у команды Pogon.', testEyebrow: 'Попробуйте до решения', testTitle: 'Не покупайте велосипед только по фотографии.', testBody: 'Прокатитесь на Pogon до покупки. Тест-драйвы доступны по записи в Белграде, Нови-Саде, Крагуеваце и Нише.', name: 'Имя и фамилия', phone: 'Телефон', city: 'Город', time: 'Желаемое время', send: 'Отправить заявку', sending: 'Отправка...', success: 'Спасибо! Мы свяжемся с вами и подтвердим модель, время и место.', error: 'Укажите имя, телефон и город, чтобы мы могли связаться с вами.', reviewsEyebrow: 'Реальный опыт Pogon', reviews: 'Что говорят владельцы', faqEyebrow: 'Без мелкого шрифта', faq: 'Частые вопросы', compareEyebrow: 'Три модели, три задачи', compare: 'Какой Pogon подходит вам?', price: 'Цена', range: 'Запас хода', battery: 'Батарея', frame: 'Рама', wheels: 'Колёса', folding: 'Складной', gps: 'GPS', bestFor: 'Лучше всего для', yes: 'Да', no: 'Нет', finalTitle: 'Готовы выбрать Pogon?', finalBody: 'Купите модель сейчас или сначала запишитесь на тест-драйв.', add: 'Купить сейчас', test: 'Записаться на тест-драйв', stickyAdded: 'Добавлено', breadcrumb: 'Навигация', photo: 'Фото покупателя', confirmed: 'Подтверждённые данные, ясная цена и поддержка до и после покупки.', payments: 'До 12 платежей', paymentsBody: 'Для карт Banca Intesa; банк показывает точные условия до подтверждения.', testAvailable: 'Бесплатный тест-драйв', testAvailableBody: 'По предварительной записи в четырёх городах.', support: 'Прямая поддержка', supportBody: 'Телефон и WhatsApp: +381 63 15 05 003.',
  },
};

const featureIcons = {
  battery: Battery, bike: Bike, brake: CircleGauge, fold: FoldHorizontal, gps: MapPin,
  light: Lightbulb, lock: LockKeyhole, shield: ShieldCheck, sparkles: Sparkles, wrench: Wrench,
};

function readCart(): ProductCartState {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_CART_STORAGE_KEY) || '{}') as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter(([key, quantity]) => products.some((product) => product.key === key) && Number.isSafeInteger(quantity) && Number(quantity) > 0 && Number(quantity) <= 99)) as ProductCartState;
  } catch {
    return {};
  }
}

function SectionHeading({ eyebrow, title, center = false, inverse = false }: { eyebrow: string; title: string; center?: boolean; inverse?: boolean }) {
  return <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}><p className={`text-[0.68rem] font-black uppercase tracking-[0.22em] ${inverse ? 'text-[#7fff00]' : 'text-[#397700]'}`}>{eyebrow}</p><h2 className={`mt-3 text-3xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-5xl ${inverse ? 'text-white' : 'text-black'}`}>{title}</h2></div>;
}

function ProductHighlights({ details, language }: { details: ProductDetails; language: SiteLanguage }) {
  const t = pageCopy[language];
  return (
    <section className="bg-[#030213] py-12 text-white sm:py-16" aria-labelledby="product-highlights-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <p id="product-highlights-title" className="mb-7 text-center text-[0.68rem] font-black uppercase tracking-[0.22em] text-white/45">{t.highlights}</p>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/15 sm:grid-cols-3 lg:grid-cols-6">
          {details.highlights.map((highlight) => <div key={`${highlight.value}-${localize(highlight.label, language)}`} className="bg-[#030213] px-3 py-6 text-center sm:px-5 sm:py-8"><p className="text-2xl font-black leading-none tracking-tight text-[#7fff00] sm:text-3xl">{highlight.value}</p><p className="mt-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/55">{localize(highlight.label, language)}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function ProductStories({ details, language }: { details: ProductDetails; language: SiteLanguage }) {
  return <section className="bg-white py-16 sm:py-24"><div className="mx-auto max-w-7xl space-y-8 px-5 sm:space-y-14 sm:px-6">{details.stories.map((story, index) => <article key={localize(story.title, language)} className={`grid overflow-hidden rounded-[2rem] border border-black/10 bg-[#f3f3ef] lg:grid-cols-2 ${index % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}><div className="relative min-h-[21rem] overflow-hidden sm:min-h-[30rem]"><ImageWithFallback src={story.image.src} alt={localize(story.image.alt, language)} width={story.image.width} height={story.image.height} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.025]" /></div><div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16"><p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#397700]">{localize(story.eyebrow, language)}</p><h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-black sm:text-6xl">{localize(story.title, language)}</h2><p className="mt-6 max-w-xl text-base leading-relaxed text-black/60 sm:text-lg">{localize(story.body, language)}</p></div></article>)}</div></section>;
}

function FeatureGrid({ details, language }: { details: ProductDetails; language: SiteLanguage }) {
  const t = pageCopy[language];
  return <section className="bg-[#f3f3ef] py-16 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-6"><SectionHeading eyebrow={localize(details.eyebrow, language)} title={t.features} center /><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{details.features.map((feature) => { const Icon = featureIcons[feature.icon]; return <article key={localize(feature.title, language)} className="rounded-[1.6rem] border border-black/10 bg-white p-6 sm:p-7"><span className="inline-grid size-11 place-items-center rounded-full bg-[#7fff00] text-black"><Icon className="size-5" /></span><h3 className="mt-5 text-xl font-black tracking-tight text-black">{localize(feature.title, language)}</h3><p className="mt-2 text-sm leading-relaxed text-black/55">{localize(feature.body, language)}</p></article>; })}</div></div></section>;
}

function Specifications({ details, language }: { details: ProductDetails; language: SiteLanguage }) {
  const t = pageCopy[language];
  return <section id="specifications" className="scroll-mt-24 bg-white py-16 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-6"><SectionHeading eyebrow={t.specsEyebrow} title={t.specs} /><div className="mt-10 hidden grid-cols-2 gap-4 md:grid">{details.specifications.map((group) => <section key={localize(group.title, language)} className="rounded-[1.6rem] border border-black/10 p-6 sm:p-8"><h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#397700]">{localize(group.title, language)}</h3><dl className="mt-5 divide-y divide-black/10">{group.items.map((item) => <div key={localize(item.label, language)} className="grid grid-cols-[0.8fr_1.2fr] gap-4 py-3 text-sm"><dt className="text-black/50">{localize(item.label, language)}</dt><dd className="font-bold text-black">{localize(item.value, language)}</dd></div>)}</dl></section>)}</div><div className="mt-8 space-y-3 md:hidden">{details.specifications.map((group, index) => <details key={localize(group.title, language)} open={index === 0} className="group rounded-2xl border border-black/10 bg-white"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-black uppercase tracking-[0.12em]"><span>{localize(group.title, language)}</span><ChevronDown className="size-5 transition-transform group-open:rotate-180" /></summary><dl className="border-t border-black/10 px-5 py-2">{group.items.map((item) => <div key={localize(item.label, language)} className="border-b border-black/10 py-3 last:border-0"><dt className="text-xs text-black/45">{localize(item.label, language)}</dt><dd className="mt-1 text-sm font-bold text-black">{localize(item.value, language)}</dd></div>)}</dl></details>)}</div></div></section>;
}

function Reassurance({ language }: { language: SiteLanguage }) {
  const t = pageCopy[language];
  const items = [
    { icon: CreditCard, title: t.payments, body: t.paymentsBody },
    { icon: CalendarCheck, title: t.testAvailable, body: t.testAvailableBody },
    { icon: MessageCircle, title: t.support, body: t.supportBody },
  ];
  return <section className="bg-white pb-14 sm:pb-20"><div className="mx-auto max-w-7xl px-5 sm:px-6"><div className="rounded-[1.75rem] border border-black/10 bg-[#f3f3ef] p-5 sm:p-7"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#397700]">{t.reassurance}</p><p className="mt-2 max-w-2xl text-sm text-black/55">{t.confirmed}</p></div><ShieldCheck className="size-8 text-[#397700]" /></div><div className="mt-6 grid gap-3 md:grid-cols-3">{items.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-2xl border border-black/10 bg-white p-5"><Icon className="size-5 text-[#397700]" /><h3 className="mt-3 font-black">{title}</h3><p className="mt-1 text-xs leading-relaxed text-black/50">{body}</p></article>)}</div></div></div></section>;
}

function DeliveryWarrantyService({ language }: { language: SiteLanguage }) {
  const t = pageCopy[language];
  const cards = [{ icon: Truck, title: t.delivery, body: t.deliveryBody }, { icon: Shield, title: t.warranty, body: t.warrantyBody }, { icon: Wrench, title: t.service, body: t.serviceBody }];
  return <section className="bg-[#030213] py-16 text-white sm:py-24"><div className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-6 lg:grid-cols-3">{cards.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-7"><Icon className="size-8 text-[#7fff00]" /><h2 className="mt-6 text-2xl font-black uppercase tracking-tight">{title}</h2><p className="mt-3 text-sm leading-relaxed text-white/60">{body}</p></article>)}</div></section>;
}

function ReviewsSection({ details, language }: { details: ProductDetails; language: SiteLanguage }) {
  const t = pageCopy[language];
  const rating = productRatings[details.key];
  const orderedReviews = [...productReviews].sort((left, right) => Number(right.model === details.key) - Number(left.model === details.key));
  return <section id="reviews" className="scroll-mt-24 bg-white py-16 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-6"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><SectionHeading eyebrow={t.reviewsEyebrow} title={t.reviews} /><div className="rounded-2xl bg-[#f3f3ef] px-5 py-4"><ProductRatingStars rating={rating} /><p className="mt-1 text-sm font-black">{formatProductRating(rating)} / 5 · {productReviews.length}</p></div></div><div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{orderedReviews.map((review) => <article key={review.name} className={`w-[86vw] max-w-[22rem] flex-none snap-start overflow-hidden rounded-[1.6rem] border border-black/10 bg-[#f7f7f4] ${review.image ? 'sm:max-w-[28rem]' : ''}`}>{review.image ? <figure className="relative aspect-[16/9] overflow-hidden bg-black"><ImageWithFallback src={review.image.src} alt={localize(review.image.alt, language)} width={review.image.width} height={review.image.height} loading="lazy" className="h-full w-full object-cover" /><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-10 text-xs font-black uppercase tracking-[0.14em] text-white">{t.photo} · Pogon Glide</figcaption></figure> : null}<div className="p-6"><div className="flex">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`size-4 ${index < review.rating ? 'fill-[#7fff00] stroke-black' : 'fill-black/10 stroke-black/20'}`} />)}</div><p className="mt-4 leading-relaxed text-black/70">“{localize(review.text, language)}”</p><p className="mt-5 font-black">{review.name}</p><p className="text-sm text-black/45">{review.city}{review.model ? ` · Pogon ${review.model[0].toUpperCase()}${review.model.slice(1)}` : ''}</p></div></article>)}</div></div></section>;
}

function ProductComparison({ activeKey, language }: { activeKey: BikeKey; language: SiteLanguage }) {
  const t = pageCopy[language];
  const facts = (details: ProductDetails) => [
    [t.price, formatRsd(details.product.priceRsd)], [t.range, localize(details.comparison.range, language)], [t.battery, localize(details.comparison.battery, language)], [t.frame, localize(details.comparison.frame, language)], [t.wheels, localize(details.comparison.wheels, language)], [t.folding, details.comparison.foldable ? t.yes : t.no], [t.gps, details.comparison.gps ? t.yes : t.no], [t.bestFor, localize(details.comparison.bestFor, language)],
  ];
  return <section className="bg-[#f3f3ef] py-16 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-6"><SectionHeading eyebrow={t.compareEyebrow} title={t.compare} center /><div className="mt-10 grid gap-4 lg:grid-cols-3">{bikeProductDetails.map((details) => <article key={details.key} className={`overflow-hidden rounded-[1.75rem] border-2 bg-white ${details.key === activeKey ? 'border-black shadow-xl' : 'border-black/10'}`}><div className="relative aspect-[16/10] overflow-hidden bg-black"><ImageWithFallback src={details.gallery[0].src} alt={localize(details.gallery[0].alt, language)} width={details.gallery[0].width} height={details.gallery[0].height} loading="lazy" className="h-full w-full object-cover object-center" />{details.key === activeKey ? <span className="absolute left-4 top-4 rounded-full bg-[#7fff00] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-black">{language === 'sr' ? 'Gledaš ovaj model' : language === 'en' ? 'Current model' : 'Текущая модель'}</span> : null}</div><div className="p-6"><h3 className="text-3xl font-black uppercase tracking-tight">{details.product.name}</h3><dl className="mt-5 divide-y divide-black/10">{facts(details).map(([label, value]) => <div key={label} className="grid grid-cols-[0.75fr_1.25fr] gap-3 py-2.5 text-sm"><dt className="text-black/45">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl>{details.key !== activeKey ? <a href={details.route + (language === 'sr' ? '' : `?lang=${language}`)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-black text-xs font-black uppercase tracking-[0.12em] transition-colors hover:bg-black hover:text-white">{details.product.name}</a> : null}</div></article>)}</div></div></section>;
}

export function ProductPage({ productKey, initialLanguage = 'sr' }: { productKey: BikeKey; initialLanguage?: SiteLanguage }) {
  const details = getProductDetails(productKey);
  if (!details) return null;
  const [language, setLanguage] = useState<SiteLanguage>(initialLanguage);
  const [cart, setCart] = useState<ProductCartState>({});
  const [cartRestored, setCartRestored] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showStickyPurchase, setShowStickyPurchase] = useState(false);
  const [testForm, setTestForm] = useState({ name: '', phone: '', city: '', time: '' });
  const [testStatus, setTestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const purchasePanelRef = useRef<HTMLDivElement | null>(null);
  const t = pageCopy[language];

  const cartEntries = useMemo(() => products.map((product) => ({ product, quantity: cart[product.key] || 0 })).filter((entry) => entry.quantity > 0), [cart]);

  useEffect(() => { setCart(readCart()); setCartRestored(true); }, []);
  useEffect(() => { if (cartRestored) { try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* keep in memory */ } } }, [cart, cartRestored]);
  useEffect(() => { if (!cartOpen) return; const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = old; }; }, [cartOpen]);
  useEffect(() => {
    const node = purchasePanelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyPurchase(!entry.isIntersecting && entry.boundingClientRect.bottom < 0), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setPageMetadata({
      title: localize(details.seoTitle, language), description: localize(details.seoDescription, language), path: details.route,
      image: `https://ridepogon.com${details.gallery[0].src.replace(/ /g, '%20')}`, type: 'product', language: language === 'sr' ? 'sr-Latn' : language,
      structuredData: {
        '@context': 'https://schema.org', '@graph': [
          { '@type': 'Product', '@id': `https://ridepogon.com${details.route}#product`, name: details.product.name, image: details.gallery.map((item) => `https://ridepogon.com${item.src.replace(/ /g, '%20')}`), description: localize(details.seoDescription, language), brand: { '@type': 'Brand', name: 'Pogon' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: formatProductRating(productRatings[details.key]), reviewCount: productReviews.length }, offers: { '@type': 'Offer', url: `https://ridepogon.com${details.route}`, priceCurrency: 'RSD', price: String(details.product.priceRsd), availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'Pogon Mobility d.o.o.' }, shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '3900', currency: 'RSD' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RS' }, deliveryTime: { '@type': 'ShippingDeliveryTime', transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' } } }, hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'RS', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 14, returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/ReturnShippingFees' } } },
          { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Pogon', item: 'https://ridepogon.com/' }, { '@type': 'ListItem', position: 2, name: t.models, item: 'https://ridepogon.com/#modeli' }, { '@type': 'ListItem', position: 3, name: details.product.name, item: `https://ridepogon.com${details.route}` }] },
          { '@type': 'FAQPage', mainEntity: details.faq.map((item) => ({ '@type': 'Question', name: localize(item.question, language), acceptedAnswer: { '@type': 'Answer', text: localize(item.answer, language) } })) },
        ],
      },
    });
  }, [details, language, t.models]);

  const changeLanguage = (next: SiteLanguage) => {
    setLanguage(next);
    if (typeof window !== 'undefined') window.history.replaceState(window.history.state, '', next === 'sr' ? details.route : `${details.route}?lang=${next}`);
  };
  const updateQuantity = (key: ProductKey, quantity: number) => setCart((current) => { const next = { ...current }; if (quantity <= 0) delete next[key]; else next[key] = Math.min(quantity, 99); return next; });
  const buyNow = (source = 'pdp', accessoryKeys: ProductKey[] = []) => {
    const parameter = [details.key, ...accessoryKeys].map((key) => `${key}:1`).join(',');
    trackEvent('checkout_started', { source, product: details.key, accessories: accessoryKeys.join(',') });
    window.location.assign(`/checkout?cart=${encodeURIComponent(parameter)}`);
  };
  const checkout = () => {
    const parameter = cartEntries.map(({ product, quantity }) => `${product.key}:${quantity}`).join(',');
    if (!parameter) return;
    trackEvent('checkout_started', { source: 'pdp-cart', product: details.key });
    window.location.assign(`/checkout?cart=${encodeURIComponent(parameter)}`);
  };
  const scrollToTestRide = () => document.getElementById('test-ride')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const handleTestRide = async (event: FormEvent) => {
    event.preventDefault();
    if (!testForm.name.trim() || !testForm.phone.trim() || !testForm.city.trim()) { setTestStatus('error'); return; }
    setTestStatus('submitting');
    try {
      await submitLead({ name: testForm.name.trim(), phone: testForm.phone.trim(), source: `pdp-test-ride-${details.key}`, language, city: testForm.city.trim(), country: 'RS', date_contacted: null, comment: `${details.product.name}${testForm.time.trim() ? ` · ${testForm.time.trim()}` : ''}` });
      setTestStatus('success'); trackEvent('test_ride_submitted', { source: 'pdp', product: details.key, city: testForm.city.trim() });
    } catch { setTestStatus('error'); }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-white pb-20 text-black md:pb-0">
      <ProductHeader language={language} path={details.route} cart={cart} onLanguageChange={changeLanguage} onOpenCart={() => setCartOpen(true)} />
      <ProductCartDrawer open={cartOpen} language={language} cart={cart} onClose={() => setCartOpen(false)} onQuantityChange={updateQuantity} onCheckout={checkout} />

      <main>
        <section className="mx-auto max-w-[1440px] px-5 pb-14 pt-32 sm:px-6 sm:pb-20 sm:pt-32 lg:px-10">
          <nav aria-label={t.breadcrumb} className="mb-6 flex flex-wrap items-center gap-2 border-b border-black/10 pb-4 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-black/40"><a href="/" className="hover:text-black">{t.home}</a><span>/</span><a href="/#modeli" className="hover:text-black">{t.models}</a><span>/</span><span className="text-black">{details.product.name}</span></nav>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-0">
            <ProductGallery media={details.gallery} language={language} productName={details.product.name} />
            <ProductPurchasePanel details={details} language={language} onBuyNow={(accessoryKeys) => buyNow('pdp-purchase-panel', accessoryKeys)} onTestRide={scrollToTestRide} purchasePanelRef={purchasePanelRef} />
          </div>
        </section>
        <Reassurance language={language} />
        <ProductHighlights details={details} language={language} />
        <ProductStories details={details} language={language} />
        <FeatureGrid details={details} language={language} />
        <Specifications details={details} language={language} />

        <section className="bg-[#f3f3ef] py-16 sm:py-20"><div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center"><div><SectionHeading eyebrow={t.boxEyebrow} title={t.box} /></div><div className="rounded-[1.75rem] border border-black/10 bg-white p-7 sm:p-9"><PackageCheck className="size-9 text-[#397700]" /><p className="mt-5 leading-relaxed text-black/60">{localize(details.whatsInBoxNote, language)}</p><a href={`https://wa.me/381631505003?text=${encodeURIComponent(`Zdravo, molim vas potvrdite sadržaj paketa za ${details.product.name}.`)}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-black px-5 text-xs font-black uppercase tracking-[0.12em] transition-colors hover:bg-black hover:text-white"><MessageCircle className="size-4" />{t.boxCta}</a></div></div></section>
        <DeliveryWarrantyService language={language} />

        <section id="test-ride" className="scroll-mt-20 bg-[#7fff00] py-16 sm:py-24"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"><div><p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-black/55">{t.testEyebrow}</p><h2 className="mt-4 text-5xl font-black uppercase leading-[0.88] tracking-[-0.055em] sm:text-7xl">{t.testTitle}</h2><p className="mt-6 max-w-xl text-lg leading-relaxed text-black/65">{t.testBody}</p><div className="mt-7 flex flex-wrap gap-2">{['Beograd', 'Novi Sad', 'Kragujevac', 'Niš'].map((city) => <span key={city} className="rounded-full border border-black/20 bg-white/45 px-4 py-2 text-xs font-black uppercase tracking-[0.12em]">{city}</span>)}</div></div><div className="rounded-[1.75rem] bg-white p-6 shadow-xl sm:p-8">{testStatus === 'success' ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto size-12 text-[#397700]" /><p className="mx-auto mt-5 max-w-md font-bold">{t.success}</p></div> : <form onSubmit={handleTestRide} className="grid gap-4 sm:grid-cols-2">{([{ key: 'name', label: t.name, type: 'text' }, { key: 'phone', label: t.phone, type: 'tel' }, { key: 'city', label: t.city, type: 'text' }, { key: 'time', label: t.time, type: 'text' }] as const).map((field) => <label key={field.key} className="text-xs font-black uppercase tracking-[0.12em] text-black/55">{field.label}<input value={testForm[field.key]} onChange={(event) => { setTestForm((current) => ({ ...current, [field.key]: event.target.value })); if (testStatus === 'error') setTestStatus('idle'); }} type={field.type} autoComplete={field.key === 'name' ? 'name' : field.key === 'phone' ? 'tel' : field.key === 'city' ? 'address-level2' : 'off'} className="mt-2 h-13 w-full rounded-2xl border border-black/15 bg-[#f7f7f4] px-4 text-base font-normal normal-case tracking-normal outline-none focus:border-black" /></label>)}{testStatus === 'error' ? <p className="sm:col-span-2 text-sm font-bold text-red-700" role="alert">{t.error}</p> : null}<button type="submit" disabled={testStatus === 'submitting'} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-black uppercase tracking-[0.12em] text-white disabled:opacity-45 sm:col-span-2"><CalendarCheck className="size-5" />{testStatus === 'submitting' ? t.sending : t.send}</button></form>}</div></div></section>

        <ReviewsSection details={details} language={language} />
        <section className="bg-[#030213] py-16 text-white sm:py-24"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]"><SectionHeading eyebrow={t.faqEyebrow} title={t.faq} inverse /><div className="space-y-3">{details.faq.map((item, index) => <details key={localize(item.question, language)} open={index === 0} className="group rounded-2xl border border-white/15 bg-white/[0.06]"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold"><span>{localize(item.question, language)}</span><ChevronDown className="size-5 shrink-0 text-[#7fff00] transition-transform group-open:rotate-180" /></summary><p className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-white/60">{localize(item.answer, language)}</p></details>)}</div></div></section>
        <ProductComparison activeKey={details.key} language={language} />
        <section className="bg-white py-16 sm:py-24"><div className="mx-auto max-w-5xl px-5 text-center sm:px-6"><p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#397700]">{details.product.name}</p><h2 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] sm:text-7xl">{t.finalTitle}</h2><p className="mx-auto mt-5 max-w-xl text-black/55">{t.finalBody}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => buyNow('pdp-final-cta')} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-black px-8 text-sm font-black uppercase tracking-[0.12em] text-white"><CreditCard className="size-5" />{t.add}</button><button type="button" onClick={scrollToTestRide} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-black px-8 text-sm font-black uppercase tracking-[0.12em]"><CalendarCheck className="size-5" />{t.test}</button></div></div></section>
      </main>

      <ProductFooter language={language} />
      {showStickyPurchase ? <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-black/10 bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center gap-3"><img src={details.product.image} alt="" width={56} height={56} className="hidden size-12 rounded-xl bg-black object-cover sm:block" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black sm:text-base">{details.product.name}</p><p className="text-xs font-bold text-black/55 sm:text-sm">{formatRsd(details.product.priceRsd)}</p></div><button type="button" onClick={() => buyNow('pdp-sticky-bar')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-xs font-black uppercase tracking-[0.1em] text-white sm:px-8"><CreditCard className="size-4" />{t.add}</button></div></div> : null}
    </div>
  );
}
