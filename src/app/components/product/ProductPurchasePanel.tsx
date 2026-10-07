import { useEffect, useState, type RefObject } from 'react';
import { CalendarCheck, CheckCircle2, CreditCard, Eye, MessageCircle, Truck, Wrench } from 'lucide-react';
import { formatRsd, products, type Product, type ProductKey } from '../../../lib/products';
import { localize, type BikeKey, type ProductDetails, type SiteLanguage } from '../../../lib/productDetails';
import { formatProductRating, productRatings, productReviews } from '../../../lib/productReviews';
import { ProductRatingStars } from './ProductRatingStars';

type ProductPurchasePanelProps = {
  details: ProductDetails;
  language: SiteLanguage;
  onBuyNow: (accessoryKeys: ProductKey[]) => void;
  onTestRide: () => void;
  purchasePanelRef: RefObject<HTMLDivElement | null>;
};

const copy = {
  sr: { reviews: 'iskustava kupaca', installments: 'Plaćanje do 12 rata', installmentsNote: 'Za kartice Banca Intesa. Banka prikazuje broj rata i tačan iznos pre potvrde.', test: 'Zakaži test vožnju', whatsapp: 'Pitaj na WhatsApp-u', warranty: '2 godine garancije', delivery: 'Dostava 1–3 radna dana', service: 'Servis i podrška', vat: 'Cena uključuje PDV' },
  en: { reviews: 'customer reviews', installments: 'Pay in up to 12 instalments', installmentsNote: 'For Banca Intesa cards. The bank shows the instalment count and exact amount before confirmation.', test: 'Book a test ride', whatsapp: 'Ask on WhatsApp', warranty: '2-year warranty', delivery: 'Delivery in 1–3 working days', service: 'Service and support', vat: 'VAT included' },
  ru: { reviews: 'отзывов покупателей', installments: 'До 12 платежей', installmentsNote: 'Для карт Banca Intesa. Банк показывает число платежей и точную сумму до подтверждения.', test: 'Записаться на тест-драйв', whatsapp: 'Спросить в WhatsApp', warranty: 'Гарантия 2 года', delivery: 'Доставка 1–3 рабочих дня', service: 'Сервис и поддержка', vat: 'НДС включён' },
};

const extrasCopy = {
  sr: { together: 'Često kupljeno zajedno', equipment: 'Sva oprema', selectedTotal: 'Bicikl + izabrana oprema', buyNow: 'Kupi sada', watching: (count: number) => `${count} ljudi trenutno gleda ovaj model` },
  en: { together: 'Frequently bought together', equipment: 'All accessories', selectedTotal: 'Bike + selected accessories', buyNow: 'Buy now', watching: (count: number) => `${count} people are viewing this model now` },
  ru: { together: 'Часто покупают вместе', equipment: 'Все аксессуары', selectedTotal: 'Велосипед + выбранные аксессуары', buyNow: 'Купить сейчас', watching: (count: number) => `${count} человек сейчас смотрят эту модель` },
};

const accessoryRecommendations: Record<BikeKey, readonly ProductKey[]> = {
  cargo: ['helmet', 'rearview-mirror', 'chain'],
  core: ['helmet', 'rearview-mirror', 'chain'],
  glide: ['helmet', 'rearview-mirror', 'chain'],
};

export function ProductPurchasePanel({ details, language, onBuyNow, onTestRide, purchasePanelRef }: ProductPurchasePanelProps) {
  const t = copy[language];
  const extras = extrasCopy[language];
  const rating = productRatings[details.key];
  const recommendations = accessoryRecommendations[details.key]
    .map((key) => products.find((product) => product.key === key))
    .filter((product): product is Product => Boolean(product));
  const [selectedAccessoryKeys, setSelectedAccessoryKeys] = useState<ProductKey[]>(() => [...accessoryRecommendations[details.key].slice(0, 2)]);
  const [watchingNow, setWatchingNow] = useState(5);
  const selectedTotal = details.product.priceRsd + recommendations
    .filter((product) => selectedAccessoryKeys.includes(product.key))
    .reduce((sum, product) => sum + product.priceRsd, 0);

  useEffect(() => {
    const randomWatchingCount = () => setWatchingNow(Math.floor(Math.random() * 21) + 5);
    randomWatchingCount();
    const interval = window.setInterval(randomWatchingCount, 60_000);
    return () => window.clearInterval(interval);
  }, [details.key]);

  const toggleAccessory = (key: ProductKey) => {
    setSelectedAccessoryKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };
  const whatsappText = language === 'sr'
    ? `Zdravo, zanima me ${details.product.name}.`
    : language === 'en'
    ? `Hi, I would like to know more about ${details.product.name}.`
    : `Здравствуйте, меня интересует ${details.product.name}.`;

  return (
    <div ref={purchasePanelRef} className="min-w-0 lg:border-l lg:border-black/10 lg:pl-10 xl:pl-14">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#397700]">{localize(details.eyebrow, language)}</p>
      <h1 className="mt-3 text-[clamp(2.5rem,4vw,3.75rem)] font-black leading-[0.94] tracking-[-0.045em] text-black">{details.product.name}</h1>
      <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-black/62 sm:text-base">{localize(details.valueProposition, language)}</p>

      <div className="mt-5 flex w-fit items-center gap-2 border border-dashed border-[#397700]/45 bg-[#7fff00]/10 px-3.5 py-2.5 text-sm font-bold text-black/75" aria-live="polite">
        <span className="relative flex size-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#397700] opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-[#397700]" /></span>
        <Eye className="size-4 text-[#397700]" />
        <span>{extras.watching(watchingNow)}</span>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm text-black/60">
        <ProductRatingStars rating={rating} />
        <strong className="text-black">{formatProductRating(rating)}</strong>
        <span>· {productReviews.length} {t.reviews}</span>
      </div>

      <div className="mt-6 border-y border-black/10 py-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {details.product.listPriceRsd ? <p className="text-lg font-bold text-black/35 line-through decoration-2">{formatRsd(details.product.listPriceRsd)}</p> : null}
          <p className="text-3xl font-black tracking-[-0.035em] text-black sm:text-[2.45rem]">{formatRsd(details.product.priceRsd)}</p>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-black/40">{t.vat}</p>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-black text-black/75"><CreditCard className="size-4 text-[#397700]" />{t.installments}</p>
        <p className="mt-1 max-w-lg text-[0.7rem] leading-relaxed text-black/45">{t.installmentsNote}</p>
      </div>

      <section className="mt-6" aria-labelledby="frequently-bought-heading">
        <div className="flex items-end justify-between gap-3">
          <h2 id="frequently-bought-heading" className="text-lg font-black tracking-[-0.02em]">{extras.together}</h2>
          <a href={language === 'sr' ? '/oprema/' : `/oprema/?lang=${language}`} className="shrink-0 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[#397700] hover:underline">{extras.equipment}</a>
        </div>
        <div className="mt-3 space-y-2">
          {recommendations.map((product) => {
            const selected = selectedAccessoryKeys.includes(product.key);
            return (
              <label key={product.key} className={`grid cursor-pointer grid-cols-[auto_3.25rem_minmax(0,1fr)_auto] items-center gap-3 border px-3 py-2.5 transition-colors ${selected ? 'border-black bg-[#7fff00]/[0.07]' : 'border-black/12 bg-white hover:border-black/35'}`}>
                <input type="checkbox" checked={selected} onChange={() => toggleAccessory(product.key)} className="size-4 accent-black" />
                <img src={product.image} alt="" width={52} height={52} loading="lazy" className="size-[3.25rem] bg-[#f2f2ef] object-cover" />
                <span className="min-w-0 text-sm font-bold leading-tight text-black/75">{product.name}</span>
                <span className="whitespace-nowrap text-sm font-black">{formatRsd(product.priceRsd)}</span>
              </label>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/10 pt-3 text-sm">
          <span className="text-black/50">{extras.selectedTotal}</span>
          <strong className="text-base">{formatRsd(selectedTotal)}</strong>
        </div>
      </section>

      <button type="button" onClick={() => onBuyNow(selectedAccessoryKeys)} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-md bg-[#030213] px-6 text-sm font-black uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#22212f] active:bg-black">
        <CreditCard className="size-5" />
        {extras.buyNow}
      </button>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        <button type="button" onClick={onTestRide} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-black px-4 text-xs font-black uppercase tracking-[0.1em] text-black transition-colors hover:bg-black hover:text-white">
          <CalendarCheck className="size-4" />{t.test}
        </button>
        <a href={`https://wa.me/381631505003?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-black/15 px-4 text-xs font-black uppercase tracking-[0.1em] text-black transition-colors hover:border-[#25D366] hover:bg-[#25D366]">
          <MessageCircle className="size-4" />{t.whatsapp}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-black/10 border-y border-black/10 py-4 text-[0.68rem] font-bold leading-tight text-black/60">
        <div className="flex flex-col items-center gap-2 px-2 text-center"><CheckCircle2 className="size-5 text-[#397700]" />{t.warranty}</div>
        <div className="flex flex-col items-center gap-2 px-2 text-center"><Truck className="size-5 text-[#397700]" />{t.delivery}</div>
        <div className="flex flex-col items-center gap-2 px-2 text-center"><Wrench className="size-5 text-[#397700]" />{t.service}</div>
      </div>
    </div>
  );
}
