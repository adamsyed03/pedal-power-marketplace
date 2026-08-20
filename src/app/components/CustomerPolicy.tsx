import type { ReactNode } from 'react';
import { PaymentBranding } from './PaymentBranding';

const policyLinks = [
  ['/informacije-o-trgovcu', 'Podaci o trgovcu'],
  ['/kontakt', 'Kontakt'],
  ['/dostava', 'Dostava'],
  ['/reklamacije', 'Reklamacije'],
  ['/povracaj-sredstava', 'Povraćaj sredstava'],
  ['/privatnost', 'Privatnost'],
  ['/bezbednost-placanja', 'Bezbednost plaćanja'],
  ['/uslovi-kupovine', 'Opšti uslovi kupovine'],
] as const;

function PolicyLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f3f2ed] px-5 py-12 text-[#030213]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <a href="/" className="text-sm font-bold text-black/50">← Pogon</a>
        <h1 className="mt-6 text-4xl font-black tracking-tight">{title}</h1>
        <div className="mt-8 space-y-7 leading-7 text-black/70">{children}</div>
        <nav aria-label="Informacije za kupce" className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/10 pt-6 text-sm">
          {policyLinks.map(([href, label]) => <a key={href} href={href} className="font-bold underline">{label}</a>)}
        </nav>
      </article>
    </main>
  );
}

function ContactLinks() {
  return <p>Kontaktirajte nas telefonom na <a className="font-bold underline" href="tel:+38169692345">+381 69 692 345</a> ili emailom na <a className="font-bold underline" href="mailto:pogonmobility@gmail.com">pogonmobility@gmail.com</a>.</p>;
}

export function CustomerPolicy({ page }: { page: 'contact' | 'delivery' | 'complaints' | 'refunds' | 'privacy' | 'security' }) {
  if (page === 'contact') return (
    <PolicyLayout title="Kontakt i korisnička podrška">
      <section><h2 className="text-2xl font-black text-black">Pogon Mobility d.o.o.</h2><p className="mt-3">Temišvarska 25B, Beograd · PIB 115472260 · MB 22162721</p></section>
      <section><h2 className="text-2xl font-black text-black">Kako da nas kontaktirate</h2><div className="mt-3"><ContactLinks /></div><p className="mt-3">Za pitanje o porudžbini navedite broj porudžbine kako bismo je lakše pronašli.</p></section>
    </PolicyLayout>
  );

  if (page === 'delivery') return (
    <PolicyLayout title="Dostava i preuzimanje">
      <section><h2 className="text-2xl font-black text-black">Kurirska dostava</h2><p className="mt-3">Dostava je dostupna na teritoriji cele Srbije. Za modele koji su na stanju očekivani rok dostave je 1–3 radna dana. Naknada za kurirsku dostavu iznosi 3.500 RSD po porudžbini i prikazuje se u konačnoj specifikaciji pre plaćanja.</p></section>
      <section><h2 className="text-2xl font-black text-black">Lično preuzimanje</h2><p className="mt-3">Lično preuzimanje na adresi Save Maskovica 3, Beograd je bez naknade. Termin se potvrđuje nakon provere dostupnosti modela.</p></section>
      <section><h2 className="text-2xl font-black text-black">Dostupnost robe</h2><p className="mt-3">Rok dostave važi kada je izabrani model na stanju. Ako isporuka nije moguća u očekivanom roku, Pogon kontaktira kupca radi dogovora pre dalje obrade.</p></section>
      <section><h2 className="text-2xl font-black text-black">Ograničenja dostave</h2><p className="mt-3">Porudžbine putem ove prodavnice isporučuju se isključivo u Republici Srbiji. Međunarodna dostava i izvoz nisu dostupni, pa se na ove porudžbine ne primenjuju carinski ni uvozni troškovi.</p></section>
    </PolicyLayout>
  );

  if (page === 'complaints') return (
    <PolicyLayout title="Reklamacije">
      <section><h2 className="text-2xl font-black text-black">Podnošenje reklamacije</h2><div className="mt-3"><ContactLinks /></div><p className="mt-3">Navedite ime i prezime, broj porudžbine ili drugi dokaz o kupovini, opis problema i željeni način rešavanja. Fotografije možete priložiti kada pomažu da se problem utvrdi.</p></section>
      <section><h2 className="text-2xl font-black text-black">Postupak</h2><p className="mt-3">Potvrdićemo prijem i odgovoriti bez odlaganja, najkasnije u roku navedenom u <a className="font-bold underline" href="/uslovi-kupovine">Opštim uslovima kupovine</a>. Prihvaćena reklamacija rešava se u zakonskom roku i u dogovoru sa kupcem. Zakonska prava potrošača ostaju nepromenjena.</p></section>
    </PolicyLayout>
  );

  if (page === 'refunds') return (
    <PolicyLayout title="Povraćaj sredstava">
      <section><h2 className="text-2xl font-black text-black">Odustanak i refundacija</h2><p className="mt-3">Pravila o odustanku od ugovora, reklamacijama i rokovima povraćaja detaljno su navedena u <a className="font-bold underline" href="/uslovi-kupovine">Opštim uslovima kupovine</a>.</p></section>
      <section><h2 className="text-2xl font-black text-black">Kartično plaćanje</h2><p className="mt-3">Povraćaj sredstava za robu plaćenu karticom vrši se isključivo preko Banca Intesa/NestPay sistema, storniranjem ili refundacijom originalne kartične transakcije na račun kartice kojom je plaćeno. Gotovinski povraćaj i uplata na drugi račun nisu mogući. Vidljivost vraćenih sredstava zavisi i od banke koja je izdala karticu.</p></section>
      <section><h2 className="text-2xl font-black text-black">Zahtev</h2><div className="mt-3"><ContactLinks /></div><p className="mt-3">Uz zahtev navedite broj porudžbine kako bismo mogli da proverimo status kupovine.</p></section>
    </PolicyLayout>
  );

  if (page === 'privacy') return (
    <PolicyLayout title="Zaštita privatnosti">
      <section><h2 className="text-2xl font-black text-black">Podaci koje obrađujemo</h2><p className="mt-3">Za obradu porudžbine prikupljamo ime i prezime, email, telefon, adresu kupca/isporuke, podatke o izabranim proizvodima i neophodne tehničke podatke. Koristimo ih za kupovinu, dostavu ili preuzimanje, podršku, reklamacije, zakonske obaveze i zaštitu legitimnih poslovnih interesa.</p></section>
      <section><h2 className="text-2xl font-black text-black">Primaoci i čuvanje</h2><p className="mt-3">Podacima pristupaju samo ovlašćena lica i pružaoci usluga kojima su potrebni za izvršenje usluge, uključujući dostavu, obradu plaćanja i slanje transakcione potvrde. Podaci se čuvaju samo koliko zahteva svrha ili važeći propisi.</p></section>
      <section id="kolacici"><h2 className="text-2xl font-black text-black">Podaci kartice i kolačići</h2><p className="mt-3">Pogon ne čuva broj kartice, sigurnosni kod ni datum isteka kartice u svojoj bazi, analitici ili emailovima. Neophodni kolačići i lokalno skladište mogu se koristiti za funkcionisanje sajta; analitika se koristi u skladu sa primenljivim pravilima i podešavanjima.</p></section>
      <section><h2 className="text-2xl font-black text-black">Zahtevi u vezi sa podacima</h2><div className="mt-3"><ContactLinks /></div></section>
    </PolicyLayout>
  );

  return (
    <PolicyLayout title="Bezbednost kartičnog plaćanja">
      <section><h2 className="text-2xl font-black text-black">Poverljivost transakcije</h2><p className="mt-3">Pogon ne čuva niti beleži puni broj kartice, sigurnosni kod ili datum isteka kartice. StoreKey, API lozinka i druga tajna sredstva za pristup ostaju isključivo na serveru. U Pogon bazi čuvaju se samo podaci o porudžbini i nesenzitivni identifikatori i statusi transakcije potrebni za potvrdu i podršku.</p></section>
      <section><h2 className="text-2xl font-black text-black">Valuta i konverzija</h2><p className="mt-3">Sva plaćanja izvršavaju se u dinarima (RSD). Ako je kartica vezana za račun u drugoj valuti, banka izdavalac ili kartična organizacija može izvršiti konverziju po svom kursu, koji Pogonu nije poznat u trenutku transakcije. Zbog toga iznos zaduženja u valuti računa kartice može neznatno odstupati od cene iskazane u RSD.</p></section>
      <section><h2 className="text-2xl font-black text-black">3D Secure informacije</h2><p className="mt-3">Dodatna autentifikacija može biti zatražena u sigurnom toku banke i kartičnog sistema. Informacije kartičnih sistema dostupne su na stranicama <a className="font-bold underline" href="https://rs.visa.com/pay-with-visa/security-and-assistance/protected-everywhere.html" target="_blank" rel="noreferrer">Visa zaštita pri plaćanju</a> i <a className="font-bold underline" href="https://www.mastercard.rs/sr-rs/korisnici/pronadite-karticu.html" target="_blank" rel="noreferrer">Mastercard kartice i sigurnost</a>. Ovi linkovi služe samo kao informacije o kartičnim sistemima.</p></section>
      <PaymentBranding />
    </PolicyLayout>
  );
}
