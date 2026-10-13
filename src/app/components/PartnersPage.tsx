import { useEffect, useState } from 'react';
import { languageFromSearch, localizedSiteHref, persistSiteLanguage, type SiteLanguage } from '../../lib/productDetails';

const pageCopy = {
  sr: {
    nav: { models: 'Modeli', equipment: 'Oprema', contact: 'Kontakt' },
    eyebrow: 'Partneri i saradnja',
    title: 'Pogon programi za kompanije i institucije',
    intro: 'Razvijamo jednostavne programe kupovine električnih bicikala za zaposlene, članove i penzionere širom Srbije.',
    partners: [
      { name: 'Stellantis', detail: 'Kompanija · Kragujevac' },
      { name: 'Univerzitet u Novom Sadu', detail: 'Filozofski fakultet', blurred: true },
      { name: 'Policijska sindikalna organizacija (MUP)', detail: 'Program za članove' },
      { name: 'PIO fond', detail: 'Program za penzionere' },
    ],
    ctaTitle: 'Želite program za svoju organizaciju?',
    ctaBody: 'Javite nam se i pripremićemo predlog saradnje.',
    cta: 'Kontaktirajte nas →',
  },
  en: {
    nav: { models: 'Models', equipment: 'Accessories', contact: 'Contact' },
    eyebrow: 'Partners and cooperation',
    title: 'Pogon programs for companies and institutions',
    intro: 'We create straightforward electric-bike purchase programs for employees, members, and pensioners across Serbia.',
    partners: [
      { name: 'Stellantis', detail: 'Company · Kragujevac' },
      { name: 'University of Novi Sad', detail: 'Faculty of Philosophy', blurred: true },
      { name: 'Police Trade Union Organization (MUP)', detail: 'Members’ program' },
      { name: 'PIO Fund', detail: 'Program for pensioners' },
    ],
    ctaTitle: 'Would you like a program for your organization?',
    ctaBody: 'Contact us and we will prepare a cooperation proposal.',
    cta: 'Contact us →',
  },
  ru: {
    nav: { models: 'Модели', equipment: 'Аксессуары', contact: 'Контакты' },
    eyebrow: 'Партнёры и сотрудничество',
    title: 'Программы Pogon для компаний и организаций',
    intro: 'Мы создаём простые программы покупки электровелосипедов для сотрудников, участников и пенсионеров по всей Сербии.',
    partners: [
      { name: 'Stellantis', detail: 'Компания · Крагуевац' },
      { name: 'Университет Нови-Сада', detail: 'Философский факультет', blurred: true },
      { name: 'Полицейская профсоюзная организация (MUP)', detail: 'Программа для участников' },
      { name: 'Фонд PIO', detail: 'Программа для пенсионеров' },
    ],
    ctaTitle: 'Нужна программа для вашей организации?',
    ctaBody: 'Свяжитесь с нами, и мы подготовим предложение о сотрудничестве.',
    cta: 'Связаться с нами →',
  },
} as const;

export function PartnersPage() {
  const [language, setLanguage] = useState<SiteLanguage>('sr');
  const copy = pageCopy[language];

  useEffect(() => {
    const restored = languageFromSearch(window.location.search);
    setLanguage(restored);
    if (new URLSearchParams(window.location.search).has('lang')) persistSiteLanguage(restored);
  }, []);

  const changeLanguage = (next: SiteLanguage) => {
    persistSiteLanguage(next);
    setLanguage(next);
    window.history.replaceState(window.history.state, '', next === 'sr' ? '/partneri/' : `/partneri/?lang=${next}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f4ef] text-black">
      <header className="border-b border-black/10 bg-[#f5f4ef]">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label={language === 'sr' ? 'Glavna navigacija' : language === 'en' ? 'Main navigation' : 'Главная навигация'}>
          <a href={localizedSiteHref('/', language)} aria-label="Pogon"><img src="/Logo.png" alt="Pogon" className="h-9 w-24 object-cover object-center" /></a>
          <div className="flex items-center gap-2 text-sm font-bold sm:gap-5">
            <a href={localizedSiteHref('/#modeli', language)} className="hidden transition-opacity hover:opacity-55 sm:block">{copy.nav.models}</a>
            <a href={localizedSiteHref('/oprema/', language)} className="hidden transition-opacity hover:opacity-55 sm:block">{copy.nav.equipment}</a>
            <div className="flex items-center gap-1" aria-label={language === 'sr' ? 'Jezik' : language === 'en' ? 'Language' : 'Язык'}>
              {(['sr', 'en', 'ru'] as SiteLanguage[]).map((item) => <button key={item} type="button" onClick={() => changeLanguage(item)} className={`h-8 min-w-8 border px-1.5 text-[0.65rem] font-bold ${language === item ? 'border-black bg-black text-white' : 'border-black/15 bg-transparent text-black/55'}`}>{item === 'sr' ? 'SRB' : item.toUpperCase()}</button>)}
            </div>
            <a href={localizedSiteHref('/kontakt/', language)} className="rounded-full bg-black px-4 py-2.5 text-white transition-opacity hover:opacity-75 sm:px-5">{copy.nav.contact}</a>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-7xl px-5 pb-9 pt-10 sm:px-8 sm:pb-10 sm:pt-12 lg:pb-8 lg:pt-9">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">{copy.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-6 text-black/60">{copy.intro}</p>
        </section>

        <section className="border-y border-black/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
            {copy.partners.map((partner) => <article key={partner.name} className="bg-white px-5 py-8 sm:px-7 lg:py-7"><p className={`text-xs font-black uppercase tracking-[0.18em] text-black/40 ${'blurred' in partner && partner.blurred ? 'select-none blur-[4px]' : ''}`}>{partner.detail}</p><h2 className={`mt-3 text-xl font-black leading-tight tracking-[-0.03em] lg:text-2xl ${'blurred' in partner && partner.blurred ? 'select-none blur-[5px]' : ''}`}>{partner.name}</h2></article>)}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-5 px-5 py-9 sm:flex-row sm:items-center sm:px-8 lg:py-8">
          <div><h2 className="text-2xl font-black tracking-[-0.03em]">{copy.ctaTitle}</h2><p className="mt-1 text-sm text-black/55 sm:text-base">{copy.ctaBody}</p></div>
          <a href={localizedSiteHref('/kontakt/', language)} className="inline-flex rounded-full bg-black px-6 py-3.5 text-sm font-black text-white transition-opacity hover:opacity-75">{copy.cta}</a>
        </section>
      </main>

      <footer className="border-t border-black/10 px-5 py-4 text-sm text-black/45 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3"><span>© {new Date().getFullYear()} Pogon Mobility</span><a href="mailto:pogonmobility@gmail.com" className="hover:text-black">pogonmobility@gmail.com</a></div></footer>
    </div>
  );
}
