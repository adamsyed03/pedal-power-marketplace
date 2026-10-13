import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { languageFromSearch, localizedSiteHref, persistSiteLanguage, type SiteLanguage } from '../../lib/productDetails';

const copy = {
  sr: {
    nav: { models: 'Modeli', equipment: 'Oprema', partners: 'Partneri' }, title: 'Pošaljite poruku', name: 'Ime i prezime', email: 'Email', phone: 'Telefon', type: 'Tip upita', city: 'Grad', message: 'Poruka', send: 'Pošaljite', sending: 'Slanje...',
    types: ['Pitanje o proizvodu', 'Test vožnja', 'Kupovina na rate', 'Poslovna saradnja', 'Servis i podrška'], cities: ['Izaberite grad', 'Beograd', 'Novi Sad', 'Kragujevac', 'Niš', 'Drugi grad'],
    success: 'Poruka je poslata. Javićemo vam se uskoro.', invalid: 'Proverite obavezna polja i pokušajte ponovo.', error: 'Poruku trenutno nije moguće poslati. Pokušajte ponovo.',
    directEmail: 'Email', directPhone: 'Telefon', business: 'Za kompanije i ustanove', businessTitle: 'Poslovna saradnja', businessBody: 'Želite program kupovine za zaposlene ili članove?', businessLink: 'Partneri i saradnja →',
  },
  en: {
    nav: { models: 'Models', equipment: 'Accessories', partners: 'Partners' }, title: 'Send us a message', name: 'Full name', email: 'Email', phone: 'Phone', type: 'Enquiry type', city: 'City', message: 'Message', send: 'Send', sending: 'Sending...',
    types: ['Product question', 'Test ride', 'Instalment purchase', 'Business cooperation', 'Service and support'], cities: ['Select a city', 'Belgrade', 'Novi Sad', 'Kragujevac', 'Niš', 'Other city'],
    success: 'Your message has been sent. We will get back to you soon.', invalid: 'Please check the required fields and try again.', error: 'Your message could not be sent right now. Please try again.',
    directEmail: 'Email', directPhone: 'Phone', business: 'For companies and institutions', businessTitle: 'Business cooperation', businessBody: 'Would you like a purchase program for employees or members?', businessLink: 'Partners and cooperation →',
  },
  ru: {
    nav: { models: 'Модели', equipment: 'Аксессуары', partners: 'Партнёры' }, title: 'Отправьте сообщение', name: 'Имя и фамилия', email: 'Email', phone: 'Телефон', type: 'Тип запроса', city: 'Город', message: 'Сообщение', send: 'Отправить', sending: 'Отправка...',
    types: ['Вопрос о товаре', 'Тест-драйв', 'Покупка в рассрочку', 'Деловое сотрудничество', 'Сервис и поддержка'], cities: ['Выберите город', 'Белград', 'Нови-Сад', 'Крагуевац', 'Ниш', 'Другой город'],
    success: 'Сообщение отправлено. Мы скоро свяжемся с вами.', invalid: 'Проверьте обязательные поля и попробуйте снова.', error: 'Сейчас сообщение отправить не удалось. Попробуйте снова.',
    directEmail: 'Email', directPhone: 'Телефон', business: 'Для компаний и организаций', businessTitle: 'Деловое сотрудничество', businessBody: 'Хотите программу покупки для сотрудников или участников?', businessLink: 'Партнёры и сотрудничество →',
  },
} as const;

const requestValues = ['Pitanje o proizvodu', 'Test vožnja', 'Kupovina na rate', 'Poslovna saradnja', 'Servis i podrška'] as const;
const cityValues = ['', 'Beograd', 'Novi Sad', 'Kragujevac', 'Niš', 'Drugi grad'] as const;

export function ContactPage() {
  const [language, setLanguage] = useState<SiteLanguage>('sr');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'invalid' | 'error'>('idle');
  const t = copy[language];
  const inputClass = 'min-h-10 w-full rounded-lg border-2 border-black/15 bg-white px-3 py-2 font-normal outline-none focus:border-black';

  useEffect(() => {
    const restored = languageFromSearch(window.location.search);
    setLanguage(restored);
    if (new URLSearchParams(window.location.search).has('lang')) persistSiteLanguage(restored);
  }, []);

  const changeLanguage = (next: SiteLanguage) => {
    persistSiteLanguage(next);
    setLanguage(next);
    window.history.replaceState(window.history.state, '', next === 'sr' ? '/kontakt/' : `/kontakt/?lang=${next}`);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    const form = event.currentTarget;
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      if (!response.ok) { setStatus(response.status === 400 ? 'invalid' : 'error'); return; }
      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-black">
      <header className="border-b border-black/10">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label={language === 'en' ? 'Main navigation' : language === 'ru' ? 'Главная навигация' : 'Glavna navigacija'}>
          <a href={localizedSiteHref('/', language)} aria-label="Pogon"><img src="/Logo.png" alt="Pogon" className="h-9 w-24 object-cover object-center" /></a>
          <div className="flex items-center gap-2 text-sm font-bold sm:gap-5">
            <a href={localizedSiteHref('/#modeli', language)} className="hidden sm:block">{t.nav.models}</a><a href={localizedSiteHref('/oprema/', language)} className="hidden sm:block">{t.nav.equipment}</a><a href={localizedSiteHref('/partneri/', language)} className="hidden md:block">{t.nav.partners}</a>
            <div className="flex gap-1" aria-label={language === 'en' ? 'Language' : language === 'ru' ? 'Язык' : 'Jezik'}>{(['sr', 'en', 'ru'] as SiteLanguage[]).map((item) => <button key={item} type="button" onClick={() => changeLanguage(item)} className={`h-8 min-w-8 border px-1.5 text-[0.65rem] font-bold ${language === item ? 'border-black bg-black text-white' : 'border-black/15 text-black/55'}`}>{item === 'sr' ? 'SRB' : item.toUpperCase()}</button>)}</div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-8">
        <h1 className="text-center text-4xl font-black tracking-[-0.045em] sm:text-5xl">{t.title}</h1>
        <form onSubmit={submit} className="mx-auto mt-6 grid max-w-4xl gap-x-5 gap-y-3 sm:grid-cols-2">
          <label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <Field label={t.name} required><input name="name" autoComplete="name" required className={inputClass} /></Field>
          <Field label={t.email} required><input name="email" type="email" autoComplete="email" required className={inputClass} /></Field>
          <Field label={t.phone}><input name="phone" type="tel" autoComplete="tel" className={inputClass} /></Field>
          <Field label={t.type}><select name="requestType" className={inputClass}>{requestValues.map((value, index) => <option key={value} value={value}>{t.types[index]}</option>)}</select></Field>
          <Field label={t.city} wide><select name="city" className={inputClass}>{cityValues.map((value, index) => <option key={value || 'none'} value={value}>{t.cities[index]}</option>)}</select></Field>
          <Field label={t.message} required wide><textarea name="message" rows={3} minLength={3} required className={`${inputClass} min-h-20 resize-y`} /></Field>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2"><button type="submit" disabled={status === 'sending'} className="min-h-10 min-w-36 rounded-lg bg-[#7fff00] px-6 font-black disabled:opacity-60">{status === 'sending' ? t.sending : t.send}</button>{status !== 'idle' && status !== 'sending' ? <p role="status" className={`text-sm font-bold ${status === 'success' ? 'text-[#397700]' : 'text-red-700'}`}>{t[status]}</p> : null}</div>
        </form>

        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-between gap-3 border-t border-black/10 pt-3 text-sm text-black/55"><p>{t.directEmail}: <a className="font-bold text-black underline" href="mailto:pogonmobility@gmail.com">pogonmobility@gmail.com</a></p><p>{t.directPhone}: <a className="font-bold text-black underline" href="tel:+381631505003">063 15 05 003</a></p></div>
        <section className="mx-auto mt-8 flex max-w-4xl flex-col justify-between gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-black/40">{t.business}</p><h2 className="mt-2 text-2xl font-black">{t.businessTitle}</h2><p className="mt-1 text-sm text-black/55">{t.businessBody}</p></div><a href={localizedSiteHref('/partneri/', language)} className="text-sm font-black underline underline-offset-4">{t.businessLink}</a></section>
      </main>
    </div>
  );
}

function Field({ label, required = false, wide = false, children }: { label: string; required?: boolean; wide?: boolean; children: ReactNode }) {
  return <label className={`grid gap-1 text-sm font-black ${wide ? 'sm:col-span-2' : ''}`}><span>{label}{required ? ' *' : ''}</span>{children}</label>;
}
