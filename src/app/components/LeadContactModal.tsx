import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle2, MessageCircle, Phone, X } from 'lucide-react';
import { submitLead } from '../../lib/supabase';

type LeadContactModalProps = {
  isOpen: boolean;
  lang: 'en' | 'sr';
  source: string;
  intent?: 'test-ride' | 'purchase' | 'consultation';
  whatsappHref: string;
  onClose: () => void;
};

const getLocalPhoneDigits = (value: string) => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('381')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 9);
};

const formatLocalPhone = (value: string) => {
  const digits = getLocalPhoneDigits(value);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)].filter(Boolean).join(' ');
};

export function LeadContactModal({ isOpen, lang, source, intent = 'test-ride', whatsappHref, onClose }: LeadContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const isSerbian = lang === 'sr';
  const isPurchase = intent === 'purchase';
  const isConsultation = intent === 'consultation';
  const isNameValid = name.trim().length >= 2;
  const localPhoneDigits = getLocalPhoneDigits(phone);
  const isPhoneValid = localPhoneDigits.length >= 8;
  const isFormValid = isNameValid && isPhoneValid;

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setPhone('');
    setError('');
    setSubmitted(false);
    setIsSubmitting(false);
    const handleEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = `+381 ${formatLocalPhone(phone)}`;

    if (!isFormValid) {
      setError(isSerbian ? 'Unesite ime i ispravan broj telefona.' : 'Enter your name and a valid phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitLead({ name: cleanName, phone: cleanPhone, source, language: lang, city: null, country: null, date_contacted: null, comment: null });
      setSubmitted(true);
      setError('');
    } catch {
      setError(isSerbian ? 'Čuvanje trenutno nije uspelo. Pokušajte putem WhatsApp-a.' : 'We could not save your details. Please try WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#111] p-6 text-white shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} aria-label={isSerbian ? 'Zatvori' : 'Close'} className="absolute right-4 top-4 rounded-full p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white">
          <X className="size-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-5 size-12 text-[#7fff00]" />
            <h2 id="lead-modal-title" className="text-2xl font-black">{isSerbian ? 'Hvala!' : 'Thank you!'}</h2>
            <p className="mt-3 text-white/65">{isConsultation
              ? (isSerbian ? 'Naš stručnjak će vas uskoro kontaktirati.' : 'One of our specialists will contact you soon.')
              : isPurchase
              ? (isSerbian ? 'Javićemo vam se uskoro sa svim informacijama o kupovini.' : 'We will call you soon with the purchase details.')
              : (isSerbian ? 'Javićemo vam se uskoro da dogovorimo test vožnju.' : 'We will call you soon to arrange your test ride.')}</p>
            <button type="button" onClick={onClose} className="mt-7 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wider text-black">
              {isSerbian ? 'Završi' : 'Done'}
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7fff00]">POGON</p>
            <h2 id="lead-modal-title" className="mt-2 pr-10 text-2xl font-black">{isConsultation
              ? (isSerbian ? 'Zakažite razgovor sa stručnjakom' : 'Book a call with a specialist')
              : isPurchase
              ? (isSerbian ? 'Zainteresovani ste za kupovinu?' : 'Interested in buying?')
              : (isSerbian ? 'Zakaži test vožnju' : 'Book a test ride')}</h2>
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
                <div className="relative mt-2">
                  <input
                    autoFocus
                    value={name}
                    onChange={(event) => { setName(event.target.value); setError(''); }}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === 'Enter' && isNameValid) {
                        event.preventDefault();
                        phoneInputRef.current?.focus();
                      }
                    }}
                    enterKeyHint="next"
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-11 text-base font-normal normal-case tracking-normal text-white outline-none transition-all placeholder:text-white/25 focus:border-[#7fff00]/60 focus:bg-white/[0.07]"
                    placeholder={isSerbian ? 'Vaše ime' : 'Your name'}
                  />
                  {isNameValid && <CheckCircle2 className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#7fff00]" aria-hidden="true" />}
                </div>
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                {isSerbian ? 'Broj telefona' : 'Phone number'}
                <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/5 transition-all focus-within:border-[#7fff00]/60 focus-within:bg-white/[0.07]">
                  <div className="flex shrink-0 items-center gap-2 border-r border-white/10 px-3.5 py-3 text-base font-semibold text-white">
                    <span aria-hidden="true">🇷🇸</span>
                    <span>+381</span>
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" aria-hidden="true" />
                    <input
                      ref={phoneInputRef}
                      value={phone}
                      onChange={(event) => { setPhone(formatLocalPhone(event.target.value)); setError(''); }}
                      type="tel"
                      inputMode="numeric"
                      enterKeyHint="done"
                      autoComplete="tel-national"
                      aria-describedby="phone-help"
                      className="w-full bg-transparent py-3 pl-10 pr-10 text-base font-normal normal-case tracking-[0.04em] text-white outline-none placeholder:text-white/25"
                      placeholder="6x xxx xxxx"
                    />
                    {isPhoneValid && <CheckCircle2 className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#7fff00]" aria-hidden="true" />}
                  </div>
                </div>
                <span id="phone-help" className="mt-2 block text-[0.68rem] font-normal normal-case tracking-normal text-white/35">
                  {isSerbian ? 'Unesite broj bez početne nule — mi ćemo dodati pozivni broj.' : 'Enter the number without the leading zero — we add the country code.'}
                </span>
              </label>
              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
              <button type="submit" disabled={!isFormValid || isSubmitting} className="w-full rounded-full bg-white px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100">
                {isSubmitting ? (isSerbian ? 'Čuvanje…' : 'Saving…') : (isSerbian ? 'Nastavi' : 'Continue')}
              </button>
              <p className="text-center text-[0.68rem] leading-relaxed text-white/30">
                {isSerbian ? 'Vaše podatke koristimo samo da vas kontaktiramo u vezi sa Pogon biciklima.' : 'We only use your details to contact you about Pogon bikes.'}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
