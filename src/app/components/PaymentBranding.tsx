type PaymentBrandingProps = {
  dark?: boolean;
  compact?: boolean;
};

const visaSecureUrl = 'https://rs.visa.com/pay-with-visa/security-and-assistance/protected-everywhere.html';
const mastercardIdentityCheckUrl = 'https://www.mastercard.rs/sr-rs/korisnici/pronadite-karticu.html';

function BrandAsset({ src, alt, security = false }: { src: string; alt: string; security?: boolean }) {
  return (
    <span
      className={`${security ? 'h-14 w-[120px]' : 'h-[56px] w-[90px]'} inline-flex shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white px-3 shadow-sm`}
    >
      <img
        src={src}
        alt={alt}
        className={`${security ? 'max-h-10' : 'max-h-8'} max-w-full object-contain`}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

export function PaymentBranding({ dark = false, compact = false }: PaymentBrandingProps) {
  const muted = dark ? 'text-white/55' : 'text-black/55';
  const panel = dark ? 'border-white/10 bg-white/[0.035]' : 'border-black/10 bg-black/[0.02]';

  return (
    <section aria-label="Banka, prihvaćene kartice i programi sigurnosti" className={`${compact ? 'mt-8' : 'mt-6'} rounded-2xl border p-4 ${panel}`}>
      <a href="https://www.bancaintesa.rs" target="_blank" rel="noreferrer" aria-label="Banca Intesa">
        <img src="/payment-brands/banca-intesa.png" alt="Banca Intesa — Intesa Sanpaolo Group" className="h-auto w-[180px] max-w-full object-contain" />
      </a>

      <div className="mt-5 grid gap-8 xl:grid-cols-2">
        <div>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${muted}`}>Prihvaćene kartice</h3>
          <div className="mt-3 flex flex-wrap gap-3" role="list" aria-label="Prihvaćene kartice">
            <span role="listitem"><BrandAsset src="/payment-brands/visa.png" alt="Visa" /></span>
            <span role="listitem"><BrandAsset src="/payment-brands/mastercard.png" alt="Mastercard" /></span>
          </div>
        </div>

        <div>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${muted}`}>Programi sigurnosti</h3>
          <div className="mt-3 flex flex-wrap gap-3" role="list" aria-label="Programi sigurnosti kartica">
            <a role="listitem" href={visaSecureUrl} target="_blank" rel="noreferrer"><BrandAsset src="/payment-brands/visa-secure.png" alt="Visa Secure" security /></a>
            <a role="listitem" href={mastercardIdentityCheckUrl} target="_blank" rel="noreferrer"><BrandAsset src="/payment-brands/mastercard-identity-check.svg" alt="Mastercard Identity Check" security /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
