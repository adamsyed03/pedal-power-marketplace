type PaymentBrandingProps = {
  dark?: boolean;
  compact?: boolean;
};

const visaSecureUrl = 'https://rs.visa.com/pay-with-visa/security-and-assistance/protected-everywhere.html';
const mastercardIdentityCheckUrl = 'https://www.mastercard.rs/sr-rs/korisnici/pronadite-karticu.html';

function MissingAsset({ label, security = false, dark = false }: { label: string; security?: boolean; dark?: boolean }) {
  return (
    <span
      role="img"
      aria-label={`${label}: zvanični logo čeka dostavu banke`}
      className={`${security ? 'h-14 w-[120px]' : 'h-[56px] w-[90px]'} inline-flex shrink-0 items-center justify-center rounded-lg border border-dashed px-2 text-center text-[10px] font-bold leading-3 ${dark ? 'border-white/25 bg-white/[0.04] text-white/55' : 'border-black/20 bg-black/[0.025] text-black/45'}`}
    >
      {label}<br />zvanični asset nedostaje
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
            <span role="listitem"><MissingAsset label="Visa" dark={dark} /></span>
            <span role="listitem"><MissingAsset label="Mastercard" dark={dark} /></span>
          </div>
        </div>

        <div>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${muted}`}>Programi sigurnosti</h3>
          <div className="mt-3 flex flex-wrap gap-3" role="list" aria-label="Programi sigurnosti kartica">
            <a role="listitem" href={visaSecureUrl} target="_blank" rel="noreferrer"><MissingAsset label="Visa Secure" security dark={dark} /></a>
            <a role="listitem" href={mastercardIdentityCheckUrl} target="_blank" rel="noreferrer"><MissingAsset label="MC ID Check" security dark={dark} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
