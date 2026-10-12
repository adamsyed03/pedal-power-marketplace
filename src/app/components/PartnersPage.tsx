const partners = [
  {
    name: 'Stellantis',
    detail: 'Kompanija · Kragujevac',
  },
  {
    name: 'Univerzitet u Novom Sadu',
    detail: 'Filozofski fakultet',
    blurred: true,
  },
  {
    name: 'Policijska sindikalna organizacija (MUP)',
    detail: 'Program za članove',
  },
  {
    name: 'PIO fond',
    detail: 'Program za penzionere',
  },
] as const;

export function PartnersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f4ef] text-black">
      <header className="border-b border-black/10 bg-[#f5f4ef]">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Glavna navigacija">
          <a href="/" aria-label="Pogon početna">
            <img src="/Logo.png" alt="Pogon" className="h-9 w-24 object-cover object-center" />
          </a>
          <div className="flex items-center gap-5 text-sm font-bold sm:gap-8">
            <a href="/#modeli" className="transition-opacity hover:opacity-55">Modeli</a>
            <a href="/oprema/" className="hidden transition-opacity hover:opacity-55 sm:block">Oprema</a>
            <a href="/kontakt/" className="rounded-full bg-black px-5 py-3 text-white transition-opacity hover:opacity-75">Kontakt</a>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-7xl px-5 pb-9 pt-10 sm:px-8 sm:pb-10 sm:pt-12 lg:pb-8 lg:pt-9">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">Partneri i saradnja</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Pogon programi za kompanije i institucije
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-6 text-black/60">
            Razvijamo jednostavne programe kupovine električnih bicikala za zaposlene, članove i penzionere širom Srbije.
          </p>
        </section>

        <section className="border-y border-black/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner) => (
              <article
                key={partner.name}
                className="bg-white px-5 py-8 sm:px-7 lg:py-7"
              >
                <p className={`text-xs font-black uppercase tracking-[0.18em] text-black/40 ${'blurred' in partner && partner.blurred ? 'select-none blur-[4px]' : ''}`}>{partner.detail}</p>
                <h2 className={`mt-3 text-xl font-black leading-tight tracking-[-0.03em] lg:text-2xl ${'blurred' in partner && partner.blurred ? 'select-none blur-[5px]' : ''}`}>{partner.name}</h2>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-5 px-5 py-9 sm:flex-row sm:items-center sm:px-8 lg:py-8">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em]">Želite program za svoju organizaciju?</h2>
            <p className="mt-1 text-sm text-black/55 sm:text-base">Javite nam se i pripremićemo predlog saradnje.</p>
          </div>
          <a href="/kontakt/" className="inline-flex rounded-full bg-black px-6 py-3.5 text-sm font-black text-white transition-opacity hover:opacity-75">
            Kontaktirajte nas →
          </a>
        </section>
      </main>

      <footer className="border-t border-black/10 px-5 py-4 text-sm text-black/45 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} Pogon Mobility</span>
          <a href="mailto:pogonmobility@gmail.com" className="hover:text-black">pogonmobility@gmail.com</a>
        </div>
      </footer>
    </div>
  );
}
