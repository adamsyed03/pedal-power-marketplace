import { ArrowRight, Gift } from 'lucide-react';
import type { SiteLanguage } from '../../lib/productDetails';

const promotionCopy = {
  sr: {
    label: 'Online ponuda',
    online: 'Online porudžbina',
    order: 'Poruči preko sajta:',
    discount: '5.000 RSD popusta',
    models: 'na Cargo i Glide',
    gift: 'Kaciga, rukavice ili lanac na poklon',
    action: 'Pogledaj modele',
  },
  en: {
    label: 'Online offer',
    online: 'Online order',
    order: 'Order through the site:',
    discount: 'RSD 5,000 off',
    models: 'Cargo and Glide',
    gift: 'Free helmet, gloves, or chain',
    action: 'View models',
  },
  ru: {
    label: 'Онлайн-предложение',
    online: 'Онлайн-заказ',
    order: 'Закажите на сайте:',
    discount: 'Скидка 5 000 RSD',
    models: 'на Cargo и Glide',
    gift: 'Шлем, перчатки или цепь в подарок',
    action: 'Смотреть модели',
  },
} as const;

type PromotionBannerProps = {
  language: SiteLanguage;
  modelsHref?: string;
};

export function PromotionBanner({ language, modelsHref = '/#modeli' }: PromotionBannerProps) {
  const copy = promotionCopy[language];

  return (
    <aside className="border-b border-black bg-[#7fff00] text-black" aria-label={copy.label}>
      <a href={modelsHref} className="mx-auto flex min-h-[52px] max-w-[1440px] flex-col items-center justify-center px-3 py-1.5 text-center font-sans transition-colors hover:bg-black/5 sm:h-10 sm:min-h-0 sm:flex-row sm:gap-3 sm:px-6 sm:py-0">
        <span className="flex items-center justify-center gap-1.5 sm:hidden">
          <strong className="inline-flex rounded-sm bg-black px-2 py-1 text-[0.72rem] font-extrabold leading-none tracking-[-0.01em] text-[#7fff00]">{copy.discount}</strong>
          <span className="text-[0.69rem] font-semibold leading-none">{copy.models}</span>
        </span>
        <span className="mt-1 flex items-center justify-center gap-1 text-[0.58rem] font-medium leading-none text-black/75 sm:hidden">
          <Gift className="size-2.5 shrink-0" />
          <span>{copy.online} · {copy.gift}</span>
        </span>
        <span className="hidden items-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.04em] text-white sm:inline-flex">
          <Gift className="size-3" />{copy.label}
        </span>
        <span className="hidden items-center justify-center gap-1.5 text-[0.72rem] font-semibold leading-none sm:flex">
          <span>{copy.order}</span>
          <strong className="inline-flex border-2 border-black bg-black px-2.5 py-1 text-sm font-extrabold leading-none tracking-[-0.01em] text-[#7fff00] shadow-[2px_2px_0_rgba(255,255,255,0.75)]">{copy.discount}</strong>
          <span>{copy.models}</span>
          <span className="mx-0.5 text-sm leading-none" aria-hidden="true">+</span>
          <span>{copy.gift}</span>
        </span>
        <span className="hidden items-center gap-1 text-[0.68rem] font-bold underline underline-offset-2 lg:inline-flex">
          {copy.action}<ArrowRight className="size-3" />
        </span>
      </a>
    </aside>
  );
}
