type PaymentBrandingProps = {
  dark?: boolean;
  compact?: boolean;
};

const visaSecureUrl = 'https://rs.visa.com/pay-with-visa/security-and-assistance/protected-everywhere.html';
const mastercardIdentityCheckUrl = 'https://www.mastercard.rs/sr-rs/korisnici/pronadite-karticu.html';

const acceptedCards = [
  ['/payment-brands/bib-maestro.png', 'Maestro'],
  ['/payment-brands/bib-mastercard.png', 'Mastercard'],
  ['/payment-brands/bib-dinacard.png', 'DinaCard'],
  ['/payment-brands/bib-visa.png', 'Visa'],
  ['/payment-brands/bib-amex.png', 'American Express'],
] as const;

const securityPrograms = [
  ['/payment-brands/bib-mastercard-id-check.png', 'Mastercard Identity Check', mastercardIdentityCheckUrl],
  ['/payment-brands/bib-visa-secure.png', 'Visa Secure', visaSecureUrl],
  ['/payment-brands/bib-amex-safekey.png', 'American Express SafeKey', null],
  ['/payment-brands/bib-dinacard-secure.png', 'DinaCard Secure', null],
] as const;

function BrandAsset({ src, alt, security = false }: { src: string; alt: string; security?: boolean }) {
  return (
    <span
      className={`${security ? 'h-12 w-[80px]' : 'h-12 w-[74px]'} inline-flex shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white p-2 shadow-sm`}
    >
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
    </span>
  );
}

export function PaymentBranding({ dark = false, compact = false }: PaymentBrandingProps) {
  const muted = dark ? 'text-white/55' : 'text-black/55';
  const panel = dark ? 'border-white/10 bg-white/[0.035]' : 'border-black/10 bg-black/[0.02]';

  return (
    <section aria-label="Banka, prihvaćene kartice i programi sigurnosti" className={`${compact ? 'mt-8' : 'mt-6'} rounded-2xl border p-4 ${panel}`}>
      <a href="https://www.bancaintesa.rs/" target="_blank" rel="noreferrer" aria-label="Banca Intesa">
        <img src="/payment-brands/bib-banca-intesa.png" alt="Banca Intesa — Intesa Sanpaolo Group" className="h-auto w-[220px] max-w-full object-contain" />
      </a>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${muted}`}>Prihvaćene kartice</h3>
          <div className="mt-3 flex flex-wrap gap-3" role="list" aria-label="Prihvaćene kartice">
            {acceptedCards.map(([src, alt]) => <span key={src} role="listitem"><BrandAsset src={src} alt={alt} /></span>)}
          </div>
        </div>

        <div>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${muted}`}>Programi sigurnosti</h3>
          <div className="mt-3 flex flex-wrap gap-3" role="list" aria-label="Programi sigurnosti kartica">
            {securityPrograms.map(([src, alt, href]) => href ? (
              <a key={src} role="listitem" href={href} target="_blank" rel="noreferrer"><BrandAsset src={src} alt={alt} security /></a>
            ) : (
              <span key={src} role="listitem"><BrandAsset src={src} alt={alt} security /></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
