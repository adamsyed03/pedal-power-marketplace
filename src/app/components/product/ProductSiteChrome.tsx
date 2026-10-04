import { Instagram, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { PaymentBranding } from '../PaymentBranding';
import { formatRsd, products, type ProductKey } from '../../../lib/products';
import type { SiteLanguage } from '../../../lib/productDetails';

export type ProductCartState = Partial<Record<ProductKey, number>>;

type ProductHeaderProps = {
  language: SiteLanguage;
  path: string;
  cart: ProductCartState;
  onLanguageChange: (language: SiteLanguage) => void;
  onOpenCart: () => void;
};

const headerCopy = {
  sr: { models: 'Modeli', equipment: 'Oprema', reviews: 'Iskustva', cart: 'Korpa', openCart: 'Otvori korpu' },
  en: { models: 'Models', equipment: 'Accessories', reviews: 'Reviews', cart: 'Cart', openCart: 'Open cart' },
  ru: { models: 'Модели', equipment: 'Аксессуары', reviews: 'Отзывы', cart: 'Корзина', openCart: 'Открыть корзину' },
};

export function ProductHeader({ language, path, cart, onLanguageChange, onOpenCart }: ProductHeaderProps) {
  const t = headerCopy[language];
  const count = Object.values(cart).reduce((sum, quantity) => sum + (quantity || 0), 0);
  const languageHref = (next: SiteLanguage) => next === 'sr' ? path : `${path}?lang=${next}`;

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-md" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <a href="/" aria-label="Pogon home" className="relative inline-flex h-14 w-24 shrink-0 items-center overflow-hidden">
            <img src="/Logo.png" alt="POGON" width={1024} height={1024} className="h-14 w-24 object-cover object-center" />
          </a>
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[0.72rem] font-black uppercase tracking-[0.13em] text-black/65 md:flex">
            <a href="/#modeli" className="border-b border-transparent py-2 transition-colors hover:border-black hover:text-black">{t.models}</a>
            <a href={language === 'sr' ? '/oprema/' : `/oprema/?lang=${language}`} className="border-b border-transparent py-2 transition-colors hover:border-black hover:text-black">{t.equipment}</a>
            <a href="/#iskustva" className="border-b border-transparent py-2 transition-colors hover:border-black hover:text-black">{t.reviews}</a>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onOpenCart} aria-label={t.openCart} className="inline-flex h-9 items-center gap-1.5 border border-black bg-black px-3 text-[0.68rem] font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-black">
              <ShoppingCart className="size-3.5" /><span className="hidden sm:inline">{t.cart}</span><span className="inline-grid min-h-4 min-w-4 place-items-center bg-[#7fff00] px-1 text-[0.58rem] leading-none text-black">{count}</span>
            </button>
            {(['sr', 'en', 'ru'] as SiteLanguage[]).map((item) => (
              <a key={item} href={languageHref(item)} onClick={(event) => { event.preventDefault(); onLanguageChange(item); }} className={`inline-grid h-8 min-w-8 place-items-center border px-1.5 text-[0.65rem] font-bold ${language === item ? 'border-black bg-black text-white' : 'border-black/15 bg-white text-black/55 hover:border-black hover:text-black'}`}>
                {item === 'sr' ? 'SRB' : item.toUpperCase()}
              </a>
            ))}
          </div>
      </div>
    </nav>
  );
}

type ProductCartDrawerProps = {
  open: boolean;
  language: SiteLanguage;
  cart: ProductCartState;
  onClose: () => void;
  onQuantityChange: (key: ProductKey, quantity: number) => void;
  onCheckout: () => void;
};

const drawerCopy = {
  sr: { title: 'Tvoja korpa', empty: 'Korpa je prazna.', total: 'Ukupno proizvodi', checkout: 'Nastavi na checkout', close: 'Zatvori korpu' },
  en: { title: 'Your cart', empty: 'Your cart is empty.', total: 'Products total', checkout: 'Continue to checkout', close: 'Close cart' },
  ru: { title: 'Ваша корзина', empty: 'Корзина пуста.', total: 'Сумма товаров', checkout: 'Перейти к оформлению', close: 'Закрыть корзину' },
};

export function ProductCartDrawer({ open, language, cart, onClose, onQuantityChange, onCheckout }: ProductCartDrawerProps) {
  if (!open) return null;
  const t = drawerCopy[language];
  const entries = products.map((product) => ({ product, quantity: cart[product.key] || 0 })).filter((entry) => entry.quantity > 0);
  const total = entries.reduce((sum, entry) => sum + entry.product.priceRsd * entry.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm" role="presentation">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} aria-label={t.close} />
      <aside role="dialog" aria-modal="true" aria-labelledby="pdp-cart-title" className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-[#f5f4ef] text-black shadow-2xl">
        <div className="flex items-start justify-between border-b border-black/10 px-5 py-5 sm:px-6">
          <div><p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#397700]">Pogon</p><h2 id="pdp-cart-title" className="mt-1 text-3xl font-black tracking-tight">{t.title}</h2></div>
          <button type="button" onClick={onClose} className="inline-grid size-10 place-items-center rounded-full border border-black/15 bg-white" aria-label={t.close}><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {entries.length ? (
            <div className="space-y-3">
              {entries.map(({ product, quantity }) => (
                <div key={product.key} className="flex gap-3 rounded-2xl border border-black/10 bg-white p-3">
                  <img src={product.image} alt="" width={96} height={96} className="size-20 rounded-xl bg-black object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black">{product.name}</p>
                    <p className="mt-1 text-sm text-black/55">{formatRsd(product.priceRsd)}</p>
                    <div className="mt-3 inline-flex items-center rounded-full border border-black/15">
                      <button type="button" onClick={() => onQuantityChange(product.key, quantity - 1)} aria-label={`Remove one ${product.name}`} className="inline-grid size-8 place-items-center"><Minus className="size-3.5" /></button>
                      <span className="min-w-8 text-center text-sm font-black">{quantity}</span>
                      <button type="button" onClick={() => onQuantityChange(product.key, quantity + 1)} aria-label={`Add one ${product.name}`} className="inline-grid size-8 place-items-center"><Plus className="size-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="rounded-2xl border border-dashed border-black/20 bg-white/50 p-6 text-center text-sm text-black/55">{t.empty}</p>}
        </div>
        <div className="border-t border-black/10 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><span className="text-sm text-black/55">{t.total}</span><strong className="text-xl">{formatRsd(total)}</strong></div>
          <button type="button" onClick={onCheckout} disabled={!entries.length} className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-black px-6 text-sm font-black uppercase tracking-[0.12em] text-white disabled:opacity-40">{t.checkout}</button>
        </div>
      </aside>
    </div>
  );
}

type ProductFooterProps = { language: SiteLanguage };

export function ProductFooter({ language }: ProductFooterProps) {
  const copy = {
    sr: { body: 'Premium električni bicikli za svakodnevnu gradsku mobilnost.', products: 'Proizvodi', support: 'Podrška', company: 'Kompanija', test: 'Test vožnja', service: 'Servis', warranty: 'Garancija', compare: 'Uporedi modele', rights: 'Sva prava zadržana.' },
    en: { body: 'Premium electric bikes for everyday urban mobility.', products: 'Products', support: 'Support', company: 'Company', test: 'Test ride', service: 'Service', warranty: 'Warranty', compare: 'Compare models', rights: 'All rights reserved.' },
    ru: { body: 'Премиальные электровелосипеды для ежедневной городской мобильности.', products: 'Продукты', support: 'Поддержка', company: 'Компания', test: 'Тест-драйв', service: 'Сервис', warranty: 'Гарантия', compare: 'Сравнить модели', rights: 'Все права защищены.' },
  }[language];
  return (
    <footer className="border-t border-black/10 bg-[#f3f3ef] py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-12">
          <div className="col-span-2">
            <div className="flex items-center justify-between md:block"><img src="/Logo.png" alt="POGON" width={1024} height={1024} className="h-14 w-auto sm:h-20" /><a href="https://instagram.com/pogon.rs" target="_blank" rel="noreferrer" aria-label="Pogon Instagram" className="inline-grid size-10 place-items-center rounded-full bg-black/5 md:mt-5"><Instagram className="size-5" /></a></div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/55">{copy.body}</p>
          </div>
          <div><h3 className="text-xs font-black uppercase tracking-[0.15em]">{copy.products}</h3><ul className="mt-4 space-y-3 text-sm text-black/55"><li><a href="/products/cargo/">Cargo</a></li><li><a href="/products/core/">Core</a></li><li><a href="/products/glide/">Glide</a></li><li><a href="/#modeli">{copy.compare}</a></li></ul></div>
          <div><h3 className="text-xs font-black uppercase tracking-[0.15em]">{copy.support}</h3><ul className="mt-4 space-y-3 text-sm text-black/55"><li><a href="#test-ride">{copy.test}</a></li><li><a href="https://wa.me/381631505003">{copy.service}</a></li><li><a href="/uslovi-kupovine">{copy.warranty}</a></li></ul></div>
          <div><h3 className="text-xs font-black uppercase tracking-[0.15em]">{copy.company}</h3><ul className="mt-4 space-y-3 text-sm text-black/55"><li><a href="/o-nama/">O nama</a></li><li><a href="/kontakt/">Kontakt</a></li><li><a href="/dostava/">Dostava</a></li><li><a href="/privatnost">Privatnost</a></li></ul></div>
        </div>
        <PaymentBranding compact />
        <div className="mt-7 border-t border-black/10 pt-6 text-center text-sm text-black/45 sm:text-left">© 2026 POGON. {copy.rights}</div>
      </div>
    </footer>
  );
}
