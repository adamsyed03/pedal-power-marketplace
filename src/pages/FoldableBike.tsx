import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export default function FoldableBike() {
  const { language } = useLanguage();
  const isSerbian = language === "sr";

  const copy = {
    title: isSerbian ? "Pogon Foldable" : "Pogon Foldable",
    subtitle: isSerbian
      ? "Kompaktni gradski e-bike za svakodnevne voznje."
      : "Compact urban e-bike for everyday movement.",
    status: isSerbian ? "Rasprodato" : "Sold Out",
    body: isSerbian
      ? "Ovaj model je trenutno rasprodat. Kliknite ispod i posaljite nam email da vas obavestimo cim bude ponovo dostupan."
      : "This model is currently sold out. Click below to email us and we will notify you when it is available again.",
    emailCta: isSerbian ? "Email us about this bike" : "Email us about this bike",
    back: isSerbian ? "Nazad na pocetnu" : "Back to homepage",
  };

  return (
    <main className="min-h-screen bg-[#f4f5f1] px-4 pb-20 pt-36 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#d7ded6] bg-[#131a16] shadow-[0_16px_32px_rgba(16,22,18,0.18)]">
          <img
            src="/ebike111.png"
            alt="Pogon foldable bike"
            className="h-[420px] w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1412]/88 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#cfd9d1]">Pogon Foldable</p>
            <p className="mt-2 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
              {copy.status}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d7ded6] bg-white p-8">
          <h1 className="text-3xl font-semibold text-[#111613] sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 text-base text-[#405046]">{copy.subtitle}</p>
          <p className="mt-6 text-sm leading-relaxed text-[#445249] sm:text-base">{copy.body}</p>

          <a
            href="mailto:adamksyed03@gmail.com?subject=Pogon%20Foldable%20Availability&body=Hi%20Pogon%20team,%20please%20notify%20me%20when%20the%20foldable%20bike%20is%20available."
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#5f7f67] px-6 py-3 text-sm font-semibold text-[#f3f5f2] transition hover:bg-[#4d6954]"
          >
            <Mail size={16} />
            {copy.emailCta}
          </a>

          <div className="mt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f2a23] hover:opacity-70">
              <ArrowLeft size={15} />
              {copy.back}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
