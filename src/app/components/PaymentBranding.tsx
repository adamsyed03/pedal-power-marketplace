type PaymentBrandingProps = {
  dark?: boolean;
  compact?: boolean;
};

const visaSecureUrl = 'https://rs.visa.com/pay-with-visa/security-and-assistance/protected-everywhere.html';
const mastercardIdentityCheckUrl = 'https://www.mastercard.rs/sr-rs/korisnici/pronadite-karticu.html';

const acceptedCards = [
  ['/payment-brands/bib-mastercard.png', 'Mastercard'],
  ['/payment-brands/bib-maestro.png', 'Maestro'],
  ['/payment-brands/bib-visa.png', 'Visa'],
  ['/payment-brands/bib-amex.png', 'American Express'],
  ['/payment-brands/bib-dinacard.png', 'DinaCard'],
] as const;

const securityPrograms = [
  ['/payment-brands/bib-visa-secure.png', 'Visa Secure', visaSecureUrl],
  ['/payment-brands/bib-mastercard-id-check.png', 'Mastercard Identity Check', mastercardIdentityCheckUrl],
  ['/payment-brands/bib-amex-safekey.png', 'American Express SafeKey', null],
  ['/payment-brands/bib-dinacard-secure.png', 'DinaCard Secure', null],
] as const;

function BrandAsset({ src, alt, security = false, compact = false }: { src: string; alt: string; security?: boolean; compact?: boolean }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${compact
        ? security ? 'h-[40px] w-[60px]' : 'h-[32px] w-[50px]'
        : security ? 'h-[52px] w-[110px]' : 'h-[42px] w-[66px]'} shrink-0 object-contain`}
      loading="lazy"
      decoding="async"
    />
  );
}

export function PaymentBranding({ dark = false, compact = false }: PaymentBrandingProps) {
  return (
    <section
      aria-label="Banka, prihvaćene kartice i programi sigurnosti"
      className={`${compact ? 'mt-8' : 'mt-6'} rounded-2xl border border-black/10 bg-white p-5 text-black`}
      data-theme-context={dark ? 'dark' : 'light'}
    >
      <div className="flex flex-col items-start gap-8">
        <div className={`flex flex-nowrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`} role="list" aria-label="Prihvaćene kartice">
          {acceptedCards.map(([src, alt]) => <span key={src} role="listitem"><BrandAsset src={src} alt={alt} compact={compact} /></span>)}
        </div>

        <a href="https://www.bancaintesa.rs/" target="_blank" rel="noreferrer" aria-label="Banca Intesa" className="shrink-0">
          <img src="/payment-brands/bib-banca-intesa.png" alt="Banca Intesa — Intesa Sanpaolo Group" className={`${compact ? 'w-[200px]' : 'w-[220px]'} h-auto max-w-full object-contain`} />
        </a>

        <div className={`flex flex-nowrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`} role="list" aria-label="Programi sigurnosti kartica">
          {securityPrograms.map(([src, alt, href]) => (
            href
              ? <a key={src} role="listitem" href={href} target="_blank" rel="noreferrer"><BrandAsset src={src} alt={alt} security compact={compact} /></a>
              : <span key={src} role="listitem"><BrandAsset src={src} alt={alt} security compact={compact} /></span>
          ))}
        </div>
      </div>
    </section>
  );
}
