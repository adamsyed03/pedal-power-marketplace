export function BusinessInfo() {
  return (
    <main className="min-h-screen bg-[#f3f2ed] px-5 py-12 text-[#030213]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <a href="/" className="text-sm font-bold text-black/50">← Pogon</a>
        <h1 className="mt-6 text-4xl font-black">Podaci o trgovcu i kupovini</h1>
        <dl className="mt-8 grid gap-3 rounded-2xl bg-black/[0.03] p-5 text-sm sm:grid-cols-2">
          <div><dt className="text-black/50">Trgovac</dt><dd className="font-bold">Pogon Mobility d.o.o.</dd></div>
          <div><dt className="text-black/50">PIB</dt><dd className="font-bold">115472260</dd></div>
          <div><dt className="text-black/50">Matični broj</dt><dd className="font-bold">22162721</dd></div>
          <div><dt className="text-black/50">Delatnost i šifra</dt><dd className="font-bold">Nespecijalizovana trgovina na veliko (4690)</dd></div>
          <div><dt className="text-black/50">Registrovano sedište</dt><dd className="font-bold">Temišvarska 25B, Beograd</dd></div>
          <div><dt className="text-black/50">Web</dt><dd className="font-bold">ridepogon.com</dd></div>
          <div><dt className="text-black/50">Telefon</dt><dd className="font-bold"><a href="tel:+381631505003">063 15 05 003</a></dd></div>
          <div><dt className="text-black/50">Email</dt><dd className="font-bold"><a href="mailto:pogonmobility@gmail.com">pogonmobility@gmail.com</a></dd></div>
          <div><dt className="text-black/50">Podrška, test vožnje i preuzimanje</dt><dd className="font-bold">Ponedeljak–subota, 09–18 h; test vožnja i preuzimanje uz potvrđen termin</dd></div>
        </dl>
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Registrovano sedište nije prodajni salon, test centar, servis niti mesto za lično preuzimanje. Na toj adresi nema izloženih bicikala i posete kupaca nisu moguće.</p>
        <h2 className="mt-10 text-2xl font-black">Dostava i preuzimanje</h2>
        <p className="mt-3 leading-7 text-black/70">Dostava je dostupna na teritoriji cele Srbije. Za modele koji su na stanju, očekivani rok dostave je 1–3 radna dana. Kurirska dostava iznosi 3.900,00 RSD po porudžbini i prikazuje se pre plaćanja.</p>
        <p className="mt-3 leading-7 text-black/70">Porudžbine putem ove prodavnice isporučuju se isključivo u Republici Srbiji. Međunarodna dostava i izvoz nisu dostupni, pa se na ove porudžbine ne primenjuju carinski ni uvozni troškovi.</p>
        <p className="mt-3 leading-7 text-black/70">Lično preuzimanje iz skladišta na adresi Save Maskovica 3, Beograd dostupno je bez troška dostave, isključivo nakon unapred dogovorenog i potvrđenog termina. Lokacija nije prodajni salon i nenajavljene posete nisu moguće.</p>
        <h2 className="mt-10 text-2xl font-black">Reklamacije, otkaz i povraćaj</h2>
        <p className="mt-3 leading-7 text-black/70">Reklamacije, odustanak, otkazivanje i povraćaj uređeni su u javnim <a href="/uslovi-kupovine" className="font-bold underline">Uslovima kupovine</a>, bez ograničavanja zakonskih prava potrošača.</p>
        <h2 className="mt-10 text-2xl font-black">Privatnost i sigurnost transakcije</h2>
        <p className="mt-3 leading-7 text-black/70">Podaci iz porudžbine koriste se za obradu kupovine, isporuku, korisničku podršku i ispunjavanje zakonskih obaveza. Pogon ne čuva broj kartice, sigurnosni kod ni datum isteka kartice u svojoj bazi, analitici ili emailovima.</p>
        <nav aria-label="Informacije za kupce" className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/10 pt-6 text-sm">
          <a href="/kontakt" className="font-bold underline">Kontakt</a>
          <a href="/dostava" className="font-bold underline">Dostava</a>
          <a href="/reklamacije" className="font-bold underline">Reklamacije</a>
          <a href="/povracaj-sredstava" className="font-bold underline">Povraćaj sredstava</a>
          <a href="/privatnost" className="font-bold underline">Privatnost</a>
          <a href="/bezbednost-placanja" className="font-bold underline">Bezbednost plaćanja</a>
          <a href="/uslovi-kupovine" className="font-bold underline">Opšti uslovi kupovine</a>
        </nav>
      </article>
    </main>
  );
}
