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
] as const;

function BrandAsset({ src, alt, security = false }: { src: string; alt: string; security?: boolean }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${security ? 'h-[52px] w-[110px]' : 'h-[42px] w-[66px]'} shrink-0 object-contain`}
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
      <div className={`flex flex-col items-start gap-8 ${compact ? '' : 'xl:flex-row xl:items-center'}`}>
        <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Prihvaćene kartice">
          {acceptedCards.map(([src, alt]) => <span key={src} role="listitem"><BrandAsset src={src} alt={alt} /></span>)}
        </div>

        <a href="https://www.bancaintesa.rs/" target="_blank" rel="noreferrer" aria-label="Banca Intesa" className="shrink-0">
          <img src="/payment-brands/bib-banca-intesa.png" alt="Banca Intesa — Intesa Sanpaolo Group" className="h-auto w-[220px] max-w-full object-contain" />
        </a>

        <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Programi sigurnosti kartica">
          {securityPrograms.map(([src, alt, href]) => (
            <a key={src} role="listitem" href={href} target="_blank" rel="noreferrer"><BrandAsset src={src} alt={alt} security /></a>
          ))}
        </div>
      </div>
    </section>
  );
}
