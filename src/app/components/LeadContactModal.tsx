import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, MessageCircle, Phone, X } from 'lucide-react';

type LeadContactModalProps = {
  isOpen: boolean;
  lang: 'en' | 'sr';
  source: string;
  whatsappHref: string;
  onClose: () => void;
};

type StoredLead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  language: 'en' | 'sr';
  createdAt: string;
};

const STORAGE_KEY = 'pogon_test_ride_leads';

export function LeadContactModal({ isOpen, lang, source, whatsappHref, onClose }: LeadContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isSerbian = lang === 'sr';

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setPhone('');
    setError('');
    setSubmitted(false);
    const handleEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');

    if (cleanName.length < 2 || phoneDigits.length < 7) {
      setError(isSerbian ? 'Unesite ime i ispravan broj telefona.' : 'Enter your name and a valid phone number.');
      return;
    }

    const lead: StoredLead = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: cleanName,
      phone: cleanPhone,
      source,
      language: lang,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      const leads = Array.isArray(existing) ? existing : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...leads, lead]));
      setSubmitted(true);
      setError('');
    } catch {
      setError(isSerbian ? 'Čuvanje trenutno nije uspelo. Pokušajte putem WhatsApp-a.' : 'We could not save your details. Please try WhatsApp.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111] p-6 text-white shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} aria-label={isSerbian ? 'Zatvori' : 'Close'} className="absolute right-4 top-4 rounded-full p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white">
          <X className="size-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-5 size-12 text-[#7fff00]" />
            <h2 id="lead-modal-title" className="text-2xl font-black">{isSerbian ? 'Hvala!' : 'Thank you!'}</h2>
            <p className="mt-3 text-white/65">{isSerbian ? 'Javićemo vam se uskoro da dogovorimo test vožnju.' : 'We will call you soon to arrange your test ride.'}</p>
            <button type="button" onClick={onClose} className="mt-7 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wider text-black">
              {isSerbian ? 'Završi' : 'Done'}
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7fff00]">POGON</p>
            <h2 id="lead-modal-title" className="mt-2 pr-10 text-2xl font-black">{isSerbian ? 'Zakaži test vožnju' : 'Book a test ride'}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{isSerbian ? 'Izaberite kako želite da vas kontaktiramo.' : 'Choose how you would like to get in touch.'}</p>

            <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-black transition-transform hover:scale-[1.02]">
              <MessageCircle className="size-5" />
              {isSerbian ? 'Nastavi putem WhatsApp-a' : 'Continue with WhatsApp'}
            </a>

            <div className="my-6 flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/35">
              <span className="h-px flex-1 bg-white/10" />
              {isSerbian ? 'ili ostavite broj' : 'or leave your number'}
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                {isSerbian ? 'Ime' : 'Name'}
                <input autoFocus value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-normal normal-case tracking-normal text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#7fff00]/60" placeholder={isSerbian ? 'Vaše ime' : 'Your name'} />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                {isSerbian ? 'Broj telefona' : 'Phone number'}
                <div className="relative mt-2">
                  <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" inputMode="tel" autoComplete="tel" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-base font-normal normal-case tracking-normal text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#7fff00]/60" placeholder="+381 6x xxx xxxx" />
                </div>
              </label>
              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
              <button type="submit" className="w-full rounded-full bg-white px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-transform hover:scale-[1.02]">
                {isSerbian ? 'Pozovite me' : 'Call me'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
