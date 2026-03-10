import { Link } from "react-router-dom";
import { ArrowRight, BatteryCharging, Bike, Building2, Gauge, MapPin, Wrench } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const homeCopy = {
  en: {
    heroTitle: "Introduction to a New Lifestyle",
    heroSub: "Premium electric bikes designed for cleaner, smarter, more enjoyable city movement.",
    heroPrimary: "Explore Bikes",
    heroSecondary: "Delivery Solutions",
    heroSignal: "Long range * Urban comfort * Delivery-ready",
    heroLocal: "Designed for streets across Serbia",
    whyTitle: "Why Pogon",
    whyCards: [
      {
        title: "Smarter commuting",
        desc: "Move through the city with less effort, less waiting, and better daily rhythm.",
      },
      {
        title: "Lower running costs",
        desc: "Cut fuel and parking spend while keeping day-to-day movement reliable.",
      },
      {
        title: "Built for everyday city life",
        desc: "Comfort-focused geometry and practical electric support for real urban routes.",
      },
    ],
    showcaseTag: "Current image treatment",
    showcaseTitle: "Built for modern movement",
    showcaseBody:
      "Even with non-studio photos, Pogon is presented with strong product framing, clean information hierarchy, and practical confidence.",
    showcaseFeatures: [
      "Electric assist tuned for stop-start city traffic",
      "Comfortable geometry for daily routes",
      "Delivery-ready setup options",
      "Practical urban design for Serbian roads",
    ],
    pathTitle: "Choose your route",
    lifestyleTitle: "For everyday riders",
    lifestyleBody: "Electric mobility for commuting, errands, and enjoying the city.",
    lifestyleCta: "See Lifestyle",
    deliveryTitle: "For delivery riders",
    deliveryBody: "Reliable electric bikes built for long shifts and daily work.",
    deliveryCta: "Delivery Solutions",
    foldableTitle: "Pogon Foldable",
    foldableBody: "Tap the image to view the sold-out page and email us about availability.",
    foldableCta: "View foldable status",
    bandTitle: "Core advantages",
    benefits: [
      { title: "Long range", subtitle: "Built for full city days" },
      { title: "Easy charging", subtitle: "Simple overnight routine" },
      { title: "Practical maintenance", subtitle: "Service-minded setup" },
      { title: "Comfortable ride", subtitle: "Stable geometry and control" },
      { title: "Urban mobility", subtitle: "Fast point-to-point movement" },
      { title: "Built for Serbia", subtitle: "Grounded local practicality" },
    ],
    storyTitle: "A better rhythm for the city",
    storyBody:
      "Pogon is not just transport. It is a cleaner, calmer way to move through work, errands, and everyday life without losing time in traffic.",
    storyPull: "Practical enough for daily use. Aspirational enough to change habits.",
    ctaTitle: "Start your new lifestyle on two wheels.",
    ctaBody: "Talk with our team and find the right setup for lifestyle or delivery use.",
    ctaPrimary: "Explore Bikes",
    ctaSecondary: "Talk to Us",
    footerTag: "Premium electric mobility for Serbian cities.",
    footerSections: {
      navigate: "Navigate",
      contact: "Contact",
      language: "Language",
    },
    footerLinks: ["Bikes", "Lifestyle", "Delivery", "About", "Contact"],
  },
  sr: {
    heroTitle: "Introduction to a New Lifestyle",
    heroSub: "Premium elektricni bicikli dizajnirani za cistije, pametnije i prijatnije gradsko kretanje.",
    heroPrimary: "Istrazi bicikle",
    heroSecondary: "Resenja za dostavu",
    heroSignal: "Veliki domet * Udobnost u gradu * Spremno za dostavu",
    heroLocal: "Dizajnirano za ulice sirom Srbije",
    whyTitle: "Zasto Pogon",
    whyCards: [
      {
        title: "Pametnije kretanje",
        desc: "Krecite se kroz grad sa manje napora, manje cekanja i vise kontrole.",
      },
      {
        title: "Nizi troskovi",
        desc: "Smanjite troskove goriva i parkinga uz pouzdano dnevno koriscenje.",
      },
      {
        title: "Za svakodnevni gradski zivot",
        desc: "Udobna geometrija i prakticna elektricna pomoc za realne gradske rute.",
      },
    ],
    showcaseTag: "Trenutna obrada fotografija",
    showcaseTitle: "Napravljen za moderno kretanje",
    showcaseBody:
      "I bez studijskih fotografija, Pogon dobija jasan premium prikaz kroz precizan raspored, kontrast i jasnu strukturu sadrzaja.",
    showcaseFeatures: [
      "Elektricna asistencija za gradski stop-start tempo",
      "Udobna geometrija za svakodnevne voznje",
      "Opcije spremne za dostavu",
      "Praktican dizajn za srpske ulice",
    ],
    pathTitle: "Izaberite svoj pravac",
    lifestyleTitle: "Za svakodnevne vozace",
    lifestyleBody: "Elektricna mobilnost za posao, obaveze i uzivanje u gradu.",
    lifestyleCta: "Lifestyle",
    deliveryTitle: "Za dostavljace",
    deliveryBody: "Pouzdani elektricni bicikli za duge smene i svakodnevni rad.",
    deliveryCta: "Resenja za dostavu",
    foldableTitle: "Pogon Foldable",
    foldableBody: "Klik na sliku vodi na sold-out stranicu i email upit za dostupnost.",
    foldableCta: "Pogledaj status modela",
    bandTitle: "Kljucne prednosti",
    benefits: [
      { title: "Veliki domet", subtitle: "Za ceo gradski dan" },
      { title: "Lako punjenje", subtitle: "Jednostavna dnevna rutina" },
      { title: "Prakticno odrzavanje", subtitle: "Servisni pristup" },
      { title: "Udobna voznja", subtitle: "Stabilna kontrola i polozaj" },
      { title: "Gradska mobilnost", subtitle: "Brze kretanje od tacke do tacke" },
      { title: "Prilagodeno Srbiji", subtitle: "Lokalna prakticnost" },
    ],
    storyTitle: "Bolji ritam za grad",
    storyBody:
      "Pogon nije samo prevoz. To je cistiji i mirniji nacin da se krecete kroz posao, obaveze i svakodnevicu, bez gubljenja vremena u guzvi.",
    storyPull: "Dovoljno prakticno za svaki dan. Dovoljno inspirativno da menja navike.",
    ctaTitle: "Pokrenite novi stil zivota na dva tocka.",
    ctaBody: "Razgovarajte sa nasim timom i pronadite pravo resenje za lifestyle ili dostavu.",
    ctaPrimary: "Istrazi bicikle",
    ctaSecondary: "Kontaktiraj nas",
    footerTag: "Premium elektricna mobilnost za gradove Srbije.",
    footerSections: {
      navigate: "Navigacija",
      contact: "Kontakt",
      language: "Jezik",
    },
    footerLinks: ["Bicikli", "Lifestyle", "Dostava", "O nama", "Kontakt"],
  },
} as const;

const benefitIcons = [BatteryCharging, Gauge, Wrench, Bike, MapPin, Building2] as const;

export default function Index() {
  const { language } = useLanguage();
  const isSerbian = language === "sr";
  const copy = isSerbian ? homeCopy.sr : homeCopy.en;

  return (
    <main className="bg-[#f4f5f1] text-[#111613]">
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/Tara.jpg"
          alt="Pogon rider in an urban-natural landscape"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(9,12,10,0.86)_0%,rgba(14,21,17,0.72)_42%,rgba(17,24,20,0.25)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(97,130,108,0.24),transparent_46%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-end px-4 pb-16 pt-44 sm:px-6 md:pb-20 md:pt-48 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#d6e0d8] backdrop-blur-sm">
              Pogon * Serbia
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-[1.02] text-[#f6f8f4] sm:text-5xl md:text-6xl lg:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-[#d5ddd5] sm:text-lg md:text-xl">{copy.heroSub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#bikes"
                className="inline-flex items-center gap-2 rounded-full bg-[#5f7f67] px-6 py-3 text-sm font-semibold text-[#f3f5f2] transition hover:bg-[#4f6a56]"
              >
                {copy.heroPrimary}
                <ArrowRight size={16} />
              </a>
              <Link
                to="/delivery"
                className="inline-flex items-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-[#f6f8f4] transition hover:bg-white/10"
              >
                {copy.heroSecondary}
              </Link>
            </div>
            <div className="mt-8 border-t border-white/20 pt-5 text-sm text-[#cfdbd0]">
              <p>{copy.heroSignal}</p>
              <p className="mt-1 text-[#b7c5b7]">{copy.heroLocal}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="bikes" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        <h2 className="text-3xl font-semibold sm:text-4xl">{copy.whyTitle}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {copy.whyCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-[#d7ded6] bg-white px-6 py-7 shadow-[0_10px_28px_rgba(16,22,18,0.06)] transition hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#425048]">{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Link to="/buy-waitlist" className="group">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7ded6] bg-[#131a16]">
              <img
                src="/Excellent 1.png"
                alt="Pogon Glide 1 bike"
                className="h-[420px] w-full object-cover object-center opacity-90 transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1412]/85 via-transparent to-transparent" />
              <span className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {copy.showcaseTag}
              </span>
              <p className="absolute bottom-6 left-6 rounded-full bg-black/40 px-3 py-1 text-xs text-[#d9e2d9]">
                {isSerbian ? "Glide 1 - Buy stranica" : "Glide 1 - Buy page"}
              </p>
            </div>
          </Link>

          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">{copy.showcaseTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-[#415048]">{copy.showcaseBody}</p>
            <ul className="mt-6 space-y-3">
              {copy.showcaseFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#233028] sm:text-base">
                  <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[#5f7f67]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
        <h2 className="text-3xl font-semibold sm:text-4xl">{copy.pathTitle}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article
            id="lifestyle"
            className="group relative overflow-hidden rounded-3xl border border-[#d6ddd5] bg-[#141a16] p-8 text-[#f3f7f2]"
          >
            <img
              src="/Excellent 2.png"
              alt="Lifestyle rider"
              className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#101713]/80 via-[#101713]/70 to-[#101713]/30" />
            <div className="relative">
              <h3 className="text-2xl font-semibold">{copy.lifestyleTitle}</h3>
              <p className="mt-3 max-w-md text-sm text-[#d3ded5] sm:text-base">{copy.lifestyleBody}</p>
              <Link to="/lifestyle" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#dbe9dd]">
                {copy.lifestyleCta}
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>

          <article
            id="delivery"
            className="group relative overflow-hidden rounded-3xl border border-[#d6ddd5] bg-[#141a16] p-8 text-[#f3f7f2]"
          >
            <img
              src="/Excellent 3.png"
              alt="Delivery rider"
              className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#101713]/80 via-[#101713]/70 to-[#101713]/30" />
            <div className="relative">
              <h3 className="text-2xl font-semibold">{copy.deliveryTitle}</h3>
              <p className="mt-3 max-w-md text-sm text-[#d3ded5] sm:text-base">{copy.deliveryBody}</p>
              <Link to="/delivery" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#dbe9dd]">
                {copy.deliveryCta}
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-[#d4dbd3] bg-white/70 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">{copy.bandTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.benefits.map((item, index) => {
              const Icon = benefitIcons[index];
              return (
                <div key={item.title} className="rounded-2xl border border-[#d5ddd4] bg-white px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-[#c7d5c9] bg-[#edf3ed] p-2 text-[#4c6954]">
                      <Icon size={16} />
                    </span>
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-[#455249]">{item.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1fr] md:py-24 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f7f67]">Pogon story</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{copy.storyTitle}</h2>
          <p className="mt-5 text-base leading-relaxed text-[#425047]">{copy.storyBody}</p>
          <p className="mt-6 text-lg font-medium text-[#1a241f]">{copy.storyPull}</p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-[#d7ded6] bg-[#131a16]">
          <img
            src="/Excellent 4.jpeg"
            alt="Pogon city riding story"
            className="h-full min-h-[300px] w-full object-cover object-center opacity-80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101713]/75 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
            Serbian urban mobility
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">{copy.foldableTitle}</h2>
            <p className="mt-4 text-base text-[#415048]">{copy.foldableBody}</p>
            <Link
              to="/bikes/foldable"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5f7f67] px-6 py-3 text-sm font-semibold text-[#f3f5f2] transition hover:bg-[#4f6a56]"
            >
              {copy.foldableCta}
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link to="/bikes/foldable" aria-label="Go to foldable bike page" className="group">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7ded6] bg-[#131a16] shadow-[0_14px_28px_rgba(16,22,18,0.15)]">
              <img
                src="/ebike111.png"
                alt="Pogon Foldable bike"
                className="h-[360px] w-full object-cover object-center transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1412]/88 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#ccd8ce]">Pogon Foldable</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{isSerbian ? "Rasprodato" : "Sold Out"}</p>
                </div>
                <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                  {isSerbian ? "Email upit" : "Email us"}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#d6ddd5] bg-[#131916] px-6 py-14 text-center text-[#f4f7f3] sm:px-10">
          <img
            src="/Excellent 1.png"
            alt="Pogon final call to action"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111813]/90 via-[#141d16]/76 to-[#111813]/90" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">{copy.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#d2ddd4]">{copy.ctaBody}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#bikes"
                className="inline-flex items-center rounded-full bg-[#5f7f67] px-6 py-3 text-sm font-semibold text-[#f1f5f1] transition hover:bg-[#4f6956]"
              >
                {copy.ctaPrimary}
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-[#f3f6f3] transition hover:bg-white/10"
              >
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d4dbd3] bg-[#ecefe9]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <img src="/Logo.png" alt="Pogon" className="h-10 w-auto" loading="lazy" />
            <p className="mt-4 max-w-xs text-sm text-[#435047]">{copy.footerTag}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">{copy.footerSections.navigate}</h3>
            <ul className="mt-4 space-y-2 text-sm text-[#435047]">
              {copy.footerLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">{copy.footerSections.contact}</h3>
            <ul className="mt-4 space-y-2 text-sm text-[#435047]">
              <li>Belgrade, Serbia</li>
              <li>+381 69 692 345</li>
              <li>adamksyed03@gmail.com</li>
              <li>@pogonbike</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">{copy.footerSections.language}</h3>
            <div className="mt-4 flex gap-2 text-sm text-[#435047]">
              <span className={`rounded-full border px-3 py-1 ${isSerbian ? "border-[#bcc8be]" : "border-[#111613] bg-[#111613] text-white"}`}>EN</span>
              <span className={`rounded-full border px-3 py-1 ${isSerbian ? "border-[#111613] bg-[#111613] text-white" : "border-[#bcc8be]"}`}>SR</span>
            </div>
          </div>
        </div>
        <div className="border-t border-[#d4dbd3] px-4 py-4 text-center text-xs text-[#556258]">
          © {new Date().getFullYear()} Pogon. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
