import { ChevronDown } from 'lucide-react';
import { localize, type ProductDetails, type SiteLanguage } from '../../../lib/productDetails';

const copy: Record<SiteLanguage, { title: string; pending: string }> = {
  sr: {
    title: 'Specifikacije',
    pending: 'Konačne specifikacije biće potvrđene pre početka prodaje.',
  },
  en: {
    title: 'Specifications',
    pending: 'Final specifications will be confirmed before launch.',
  },
  ru: {
    title: 'Характеристики',
    pending: 'Окончательные характеристики будут подтверждены до начала продаж.',
  },
};

export function ProductSpecificationsDropdown({
  details,
  language,
  className = '',
}: {
  details?: ProductDetails;
  language: SiteLanguage;
  className?: string;
}) {
  const t = copy[language];

  return (
    <details className={`group border border-black/10 bg-white ${className}`}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-black marker:content-none">
        <span>{t.title}</span>
        <ChevronDown className="size-5 shrink-0 text-[#397700] transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-black/10 px-5 pb-5 pt-2">
        {details ? (
          <div className="grid gap-x-8 md:grid-cols-2">
            {details.specifications.map((group) => (
              <section key={localize(group.title, language)} className="pt-4">
                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#397700]">{localize(group.title, language)}</h3>
                <dl className="mt-2 divide-y divide-black/10">
                  {group.items.map((item) => (
                    <div key={localize(item.label, language)} className="grid grid-cols-[0.85fr_1.15fr] gap-4 py-2.5 text-xs sm:text-sm">
                      <dt className="text-black/45">{localize(item.label, language)}</dt>
                      <dd className="font-bold text-black">{localize(item.value, language)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        ) : <p className="pt-3 text-sm leading-6 text-black/55">{t.pending}</p>}
      </div>
    </details>
  );
}
