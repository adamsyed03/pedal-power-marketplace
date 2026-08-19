export function PurchaseTerms() {
  return (
    <main className="min-h-screen bg-[#f3f2ed] px-5 py-12 text-[#030213]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <a href="/" className="text-sm font-bold text-black/50">← Pogon</a>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Uslovi kupovine i dostave</h1>
        <p className="mt-4 text-sm text-black/55">Pogon Mobility d.o.o. · Temišvarska 25B, Beograd · PIB 115472260 · MB 22162721 · šifra delatnosti 4690</p>

        <h2 className="mt-10 text-2xl font-black">Cene i PDV</h2>
        <p className="mt-3 leading-7 text-black/70">
          Sve cene su sa uračunatim PDV-om i nema dodatnih ili skrivenih troškova.
          Prodavnica naplaćuje isključivo u RSD. Trošak dostave je zasebna, unapred
          prikazana stavka konačne specifikacije porudžbine.
        </p>
        <p className="mt-3 leading-7 text-black/70">
          Sva plaćanja izvršavaju se u lokalnoj valuti Republike Srbije — dinarima (RSD).
          Ako je platna kartica vezana za račun u drugoj valuti, banka izdavalac ili
          kartična organizacija može izvršiti konverziju po svom kursu, koji Pogonu nije
          poznat u trenutku transakcije. Zbog toga iznos zaduženja u valuti računa kartice
          može neznatno odstupati od cene iskazane u RSD.
        </p>

        <h2 className="mt-8 text-2xl font-black">Dostava</h2>
        <p className="mt-3 leading-7 text-black/70">
          Dostava je dostupna na teritoriji cele Srbije. Očekivani rok dostave je 1–3 radna
          dana, pod uslovom da je izabrani model na stanju.
        </p>
        <p className="mt-3 leading-7 text-black/70">
          Kurirska dostava naplaćuje se 3.500 RSD po porudžbini i nije uključena u
          prikazanu cenu bicikla. Naknada za dostavu i konačan iznos prikazuju se pre
          potvrde porudžbine i pre bilo kakvog plaćanja.
        </p>

        <h2 className="mt-8 text-2xl font-black">Lično preuzimanje</h2>
        <p className="mt-3 leading-7 text-black/70">
          Lično preuzimanje dostupno je na adresi Save Maskovica 3, Beograd. Termin
          preuzimanja potvrđuje se sa Pogon timom nakon provere dostupnosti modela.
        </p>

        <h2 className="mt-8 text-2xl font-black">Potvrda porudžbine</h2>
        <p className="mt-3 leading-7 text-black/70">
          Pre plaćanja kupac dobija konačnu specifikaciju sa proizvodom, količinom,
          jediničnom cenom, PDV tretmanom, troškom dostave i ukupnim iznosom. Plaćanje se
          ne pokreće dok kupac izričito ne prihvati konačnu specifikaciju i uslove kupovine.
        </p>

        <h2 className="mt-8 text-2xl font-black">Reklamacije</h2>
        <div className="mt-3 space-y-3 leading-7 text-black/70">
          <p>Kupac može izjaviti reklamaciju u slučaju nesaobraznosti robe, pogrešno obračunate cene ili drugih nedostataka u skladu sa važećim propisima Republike Srbije.</p>
          <p>Reklamacija se podnosi na <a className="font-bold underline" href="mailto:pogonmobility@gmail.com">pogonmobility@gmail.com</a> i treba da sadrži ime i prezime, broj porudžbine ili drugi dokaz o kupovini, opis problema i željeni način rešavanja.</p>
          <p>Pogon Mobility d.o.o. potvrdiće prijem i odgovoriti bez odlaganja, najkasnije u roku od 8 dana. Prihvaćena reklamacija rešava se u zakonskom roku; kada se primenjuje rok za tehničku robu, ne duže od 30 dana, osim kada zakon dopušta produženje i kupac je sa njim saglasan.</p>
          <p>Kod prihvaćene reklamacije koja zahteva vraćanje proizvoda, Pogon snosi razumne, prethodno dogovorene troškove povratnog transporta. Kupac ne treba samostalno organizovati skup transport bez prethodnog dogovora, osim kada je to neophodno radi ostvarivanja zakonskih prava.</p>
          <p>Nedostatak originalne ambalaže sam po sebi nije razlog za odbijanje reklamacije kada to zakon ne dopušta. Kod odbijanja kupac dobija odluku i informaciju o vansudskom rešavanju potrošačkog spora.</p>
        </div>

        <h2 className="mt-8 text-2xl font-black">Pravo na odustanak od ugovora</h2>
        <div className="mt-3 space-y-3 leading-7 text-black/70">
          <p>Potrošač koji zaključi ugovor na daljinu putem internet prodavnice može odustati u roku od 14 dana od dana kada roba dospe u njegovu državinu, odnosno državinu trećeg lica koje je odredio, a koje nije prevoznik, osim kada zakon isključuje ovo pravo. Kupac nije dužan da navede razlog.</p>
          <p>Jasna izjava o odustanku šalje se na <a className="font-bold underline" href="mailto:pogonmobility@gmail.com">pogonmobility@gmail.com</a>. Pogon će omogućiti i zakonom propisani obrazac.</p>
          <p>Roba se vraća bez nepotrebnog odlaganja, najkasnije 14 dana od slanja izjave. Kod običnog odustanka bez nesaobraznosti direktne troškove vraćanja snosi kupac, osim ako Pogon izričito prihvati te troškove.</p>
          <p>Kupac odgovara za umanjenje vrednosti nastalo rukovanjem koje prevazilazi proveru prirode, karakteristika i funkcionalnosti proizvoda. Originalna ambalaža nije bezuslovno obavezna. Zakonski izuzeci primenjuju se kada su ispunjeni propisani uslovi.</p>
        </div>

        <h2 className="mt-8 text-2xl font-black">Otkazivanje porudžbine</h2>
        <p className="mt-3 leading-7 text-black/70">Kupac može zatražiti otkazivanje pre isporuke na <a className="font-bold underline" href="mailto:pogonmobility@gmail.com">pogonmobility@gmail.com</a>. Ako plaćanje nije završeno, porudžbina se otkazuje bez naplate. Ako je kartica zadužena i otkaz je moguć, Pogon pokreće odgovarajući Void ili Refund, prema statusu transakcije. Ovo ne utiče na prava na odustanak i prava zbog nesaobraznosti.</p>

        <h2 className="mt-8 text-2xl font-black">Povraćaj sredstava</h2>
        <div className="mt-3 space-y-3 leading-7 text-black/70">
          <p>Pogon vrši povraćaj u rokovima propisanim važećim propisima Republike Srbije. Kod odustanka od ugovora na daljinu, povraćaj se vrši u zakonskom roku, uz pravo trgovca da, kada je dozvoljeno, sačeka prijem robe ili dokaz da je poslata.</p>
          <p>Povraćaj kartične transakcije obavlja se kroz Banca Intesa/NestPay i, kada je primenljivo, na isto sredstvo plaćanja, prema pravilima banke, kartičnih sistema i propisa.</p>
          <p>Kod prihvaćene reklamacije zbog nedostatka za koji odgovara prodavac, Pogon snosi dogovoreni trošak povratnog transporta. Vidljivost sredstava nakon pokretanja povraćaja zavisi i od banke izdavaoca i kartičnog sistema.</p>
        </div>

        <h2 className="mt-8 text-2xl font-black">Zaštita privatnosti</h2>
        <div className="mt-3 space-y-3 leading-7 text-black/70">
          <p>Pogon prikuplja samo podatke potrebne za porudžbinu, plaćanje, isporuku, podršku, reklamacije, zakonske obaveze i zaštitu legitimnih poslovnih interesa: identitet, kontakt, adresu, podatke o porudžbini i neophodne tehničke podatke.</p>
          <p>Podaci platne kartice ne čuvaju se u Pogon bazi. Lični podaci čuvaju se samo koliko je potrebno za svrhu prikupljanja ili koliko nalažu propisi i obaveze čuvanja dokumentacije. Pristup imaju samo ovlašćena lica i pružaoci usluga kojima su potrebni radi izvršenja usluge.</p>
          <p>Za zahteve u vezi sa podacima: <a className="font-bold underline" href="mailto:pogonmobility@gmail.com">pogonmobility@gmail.com</a>. Podaci se ne koriste za direktni marketing bez odgovarajućeg pravnog osnova ili potrebne saglasnosti; kupac može zatražiti prestanak marketinških poruka.</p>
        </div>
        <nav aria-label="Informacije za kupce" className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/10 pt-6 text-sm">
          <a href="/informacije-o-trgovcu" className="font-bold underline">Podaci o trgovcu</a>
          <a href="/kontakt" className="font-bold underline">Kontakt</a>
          <a href="/dostava" className="font-bold underline">Dostava</a>
          <a href="/reklamacije" className="font-bold underline">Reklamacije</a>
          <a href="/povracaj-sredstava" className="font-bold underline">Povraćaj sredstava</a>
          <a href="/privatnost" className="font-bold underline">Privatnost</a>
          <a href="/bezbednost-placanja" className="font-bold underline">Bezbednost plaćanja</a>
        </nav>
      </article>
    </main>
  );
}
