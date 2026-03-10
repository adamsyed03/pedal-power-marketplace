import { useLocation } from "react-router-dom";
import { ArrowRight, Bike, MapPin, ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ProductShowcase } from "@/components/ProductShowcase";

type Lang = "en" | "sr";

type Copy = {
  heroTitle: string;
  heroSub: string;
  heroPrimary: string;
  heroSecondary: string;
  trustTitle: string;
  trustItems: string[];
  whyTitle: string;
  whyCards: { title: string; desc: string }[];
  modernTitle: string;
  modernBody: string;
  modernPoints: string[];
  identityTitle: string;
  identityBody: string;
  identityPull: string;
  finalTitle: string;
  finalBody: string;
  finalPrimary: string;
  finalSecondary: string;
  footerTag: string;
  footerSections: { navigate: string; contact: string; language: string };
  footerLinks: string[];
};

const WHATSAPP_BASE = "https://wa.me/381631505003";

const homeCopy: Record<Lang, Copy> = {
  en: {
    heroTitle: "Progress is impossible without change",
    heroSub: "Electric bikes designed for people building their future.",
    heroPrimary: "Explore Bikes",
    heroSecondary: "Lifestyle",
    trustTitle: "Trusted by riders across Serbia",
    trustItems: ["Long-lasting battery", "2-year guarantee", "Anti-theft systems and GPS", "Premium safety features"],
    whyTitle: "Why Pogon",
    whyCards: [
      { title: "Smarter commuting", desc: "Move through the city with less effort, less waiting, and better daily rhythm." },
      { title: "Lower running costs", desc: "Cut fuel and parking spend while keeping day-to-day movement reliable." },
      { title: "Built for everyday city life", desc: "Comfort-focused geometry and practical electric support for real urban routes." },
    ],
    modernTitle: "Built for modern movement",
    modernBody: "Even with non-studio photos, Pogon is presented with strong product framing, clean information hierarchy, and practical confidence.",
    modernPoints: [
      "Electric assist tuned for stop-start city traffic",
      "Comfortable geometry for daily routes",
      "Efficient setup for daily commuting",
      "Practical urban design for Serbian roads",
    ],
    identityTitle: "For People Going Somewhere",
    identityBody: "Pogon is for young professionals, entrepreneurs, students, and builders who move every day with purpose.",
    identityPull: "A bike brand for people working hard to build their future.",
    finalTitle: "Start Building Your Future on Two Wheels",
    finalBody: "Choose your model and talk directly with our team on WhatsApp.",
    finalPrimary: "Explore Bikes",
    finalSecondary: "Talk to Us on WhatsApp",
    footerTag: "Premium electric mobility for Serbian cities.",
    footerSections: { navigate: "Navigate", contact: "Contact", language: "Language" },
    footerLinks: ["Bikes", "Lifestyle", "About", "Contact"],
  },
  sr: {
    heroTitle: "Napredak je nemoguc bez promene",
    heroSub: "Elektricni bicikli za ljude koji svaki dan rade na svom napretku.",
    heroPrimary: "Istrazi bicikle",
    heroSecondary: "Lifestyle",
    trustTitle: "Poverenje vozaca sirom Srbije",
    trustItems: ["Dugotrajna baterija", "2 godine garancije", "Anti-theft sistemi i GPS", "Premium bezbednosne funkcije"],
    whyTitle: "Zasto Pogon",
    whyCards: [
      { title: "Pametnije kretanje", desc: "Krecite se kroz grad sa manje napora, manje cekanja i boljim dnevnim ritmom." },
      { title: "Nizi troskovi", desc: "Smanjite troskove goriva i parkinga uz pouzdano dnevno koriscenje." },
      { title: "Za svakodnevni gradski zivot", desc: "Udobna geometrija i prakticna elektricna pomoc za realne gradske rute." },
    ],
    modernTitle: "Napravljeno za moderno kretanje",
    modernBody: "I bez studijskih fotografija, Pogon je predstavljen kroz jak proizvodni fokus, jasnu hijerarhiju informacija i prakticno poverenje.",
    modernPoints: [
      "Elektricna pomoc za gradski stop-start saobracaj",
      "Udobna geometrija za dnevne rute",
      "Efikasan setup za svakodnevno kretanje",
      "Praktican urbani dizajn za puteve Srbije",
    ],
    identityTitle: "Za ljude koji idu napred",
    identityBody: "Pogon je za mlade profesionalce, preduzetnike, studente i sve koji svaki dan rade na svojoj buducnosti.",
    identityPull: "Brend za one koji rade ozbiljno i krecu se sa ciljem.",
    finalTitle: "Pokreni svoju buducnost na dva tocka",
    finalBody: "Izaberi model i pisi nam direktno na WhatsApp.",
    finalPrimary: "Istrazi bicikle",
    finalSecondary: "Javi se na WhatsApp",
    footerTag: "Premium elektricna mobilnost za gradove Srbije.",
    footerSections: { navigate: "Navigacija", contact: "Kontakt", language: "Jezik" },
    footerLinks: ["Bicikli", "Lifestyle", "O nama", "Kontakt"],
  },
};

const trustIcons = [Star, ShieldCheck, Bike, MapPin] as const;

function getWhatsAppHref(message: string) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export default function Index() {
  const { language } = useLanguage();
  const location = useLocation();
  const lang: Lang = language === "sr" ? "sr" : "en";
  const copy = homeCopy[lang];
  const initialModel = new URLSearchParams(location.search).get("model") ?? undefined;

  return (
    <main className="bg-[#f4f5f1] text-[#111613]">
      <section className="relative min-h-screen overflow-hidden">
        <img src="/Tara.jpg" alt="Pogon hero" className="absolute inset-0 h-full w-full object-cover object-center" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(8,12,10,0.9)_0%,rgba(13,18,16,0.7)_45%,rgba(13,18,16,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(93,124,102,0.26),transparent_45%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-end px-4 pb-28 pt-44 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#d6e0d8] backdrop-blur-sm">
              Designed for the streets of Serbia
            </p>
            <h1 className="max-w-[18ch] text-[2.24rem] font-semibold leading-[1.02] text-[#f6f8f4] sm:max-w-none sm:text-5xl md:text-6xl lg:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-[#d5ddd5] sm:text-lg md:text-xl">{copy.heroSub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#bikes" className="inline-flex items-center gap-2 rounded-full bg-[#5f7f67] px-6 py-3 text-sm font-semibold text-[#f3f5f2] transition hover:bg-[#4f6a56]">
                {copy.heroPrimary}
                <ArrowRight size={16} />
              </a>
              <a href="#lifestyle" className="inline-flex items-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-[#f6f8f4] transition hover:bg-white/10">
                {copy.heroSecondary}
              </a>
            </div>

            <div className="mt-6 max-w-xl">
              <p className="mb-3 text-sm font-semibold text-white">{copy.trustTitle}</p>
              <div className="flex flex-wrap gap-2">
                {copy.trustItems.map((item, idx) => {
                  const Icon = trustIcons[idx];
                  return (
                    <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-[#ecf3ec] backdrop-blur-sm">
                      <Icon size={12} />
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        <h2 className="text-3xl font-semibold sm:text-4xl">{copy.whyTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {copy.whyCards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-[#d7ded6] bg-white px-6 py-7 shadow-[0_10px_28px_rgba(16,22,18,0.06)]">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#425048]">{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="lifestyle" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <a href="/?model=glide-1#bikes" className="group relative overflow-hidden rounded-3xl border border-[#d6ddd5] bg-[#e8ece8] p-4 shadow-[0_12px_32px_rgba(16,22,18,0.08)]">
            <img src="/Excellent 1.png" alt="Glide" className="h-[360px] w-full object-contain transition duration-500 group-hover:scale-[1.02]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111613]/35 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs text-white backdrop-blur">Glide - Buy page</span>
          </a>

          <div>
            <h2 className="text-3xl font-semibold sm:text-5xl">{copy.modernTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-[#3f4c44]">{copy.modernBody}</p>
            <ul className="mt-6 space-y-3">
              {copy.modernPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-[#223029]">
                  <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[#5f7f67]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ProductShowcase initialModel={initialModel} />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1fr] md:py-24 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f7f67]">Pogon identity</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{copy.identityTitle}</h2>
          <p className="mt-5 text-base leading-relaxed text-[#425047]">{copy.identityBody}</p>
          <p className="mt-6 text-lg font-medium text-[#1a241f]">{copy.identityPull}</p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-[#d7ded6] bg-[#131a16]">
          <img src="/Excellent 4.jpeg" alt="Pogon identity" className="h-full min-h-[320px] w-full object-cover object-center opacity-80" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101713]/78 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
            <MapPin size={12} className="mr-1 inline-block" />
            Serbia urban mobility
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#d6ddd5] bg-[#131916] px-6 py-14 text-center text-[#f4f7f3] sm:px-10">
          <img src="/Excellent 1.png" alt="Pogon final CTA" className="absolute inset-0 h-full w-full object-cover opacity-35" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111813]/90 via-[#141d16]/76 to-[#111813]/90" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#d2ddd4]">{copy.finalBody}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#bikes" className="inline-flex items-center rounded-full bg-[#5f7f67] px-6 py-3 text-sm font-semibold text-[#f1f5f1] transition hover:bg-[#4f6956]">
                {copy.finalPrimary}
              </a>
              <a
                href={getWhatsAppHref(lang === "sr" ? "Zdravo, zainteresovan sam za Pogon bicikle." : "Hello, I'm interested in Pogon bikes.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-[#f3f6f3] transition hover:bg-white/10"
              >
                {copy.finalSecondary}
              </a>
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
              <li>+381 63 1505003</li>
              <li>pogonmobility@gmail.com</li>
              <li>@pogonrs</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">{copy.footerSections.language}</h3>
            <div className="mt-4 flex gap-2 text-sm text-[#435047]">
              <span className={`rounded-full border px-3 py-1 ${lang === "en" ? "border-[#111613] bg-[#111613] text-white" : "border-[#bcc8be]"}`}>EN</span>
              <span className={`rounded-full border px-3 py-1 ${lang === "sr" ? "border-[#111613] bg-[#111613] text-white" : "border-[#bcc8be]"}`}>SR</span>
            </div>
          </div>
        </div>
        <div className="border-t border-[#d4dbd3] px-4 py-4 text-center text-xs text-[#556258]">© {new Date().getFullYear()} Pogon. All rights reserved.</div>
      </footer>
    </main>
  );
}
