import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const navLabels = {
  en: {
    bikes: "Bikes",
    lifestyle: "Lifestyle",
    about: "About",
    contact: "Contact",
    cta: "Talk to Us",
  },
  sr: {
    bikes: "Bicikli",
    lifestyle: "Lifestyle",
    about: "O nama",
    contact: "Kontakt",
    cta: "Javi se",
  },
} as const;

const trustPoints = {
  en: [
    "2-year warranty",
    "Nationwide support",
    "Service and support network",
    "Flexible payment inquiry",
  ],
  sr: [
    "2 godine garancije",
    "Isporuka širom Srbije",
    "Servis i podrška",
    "Fleksibilne opcije plaćanja",
  ],
} as const;

const languages = [
  { code: "en", label: "EN" },
  { code: "sr", label: "SR" },
] as const;

type HomeAnchor = "bikes" | "lifestyle";

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBottomStripVisible, setIsBottomStripVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);

      if (location.pathname !== "/") {
        setIsBottomStripVisible(false);
        return;
      }

      const whySection = document.getElementById("why");
      setIsBottomStripVisible(!whySection || whySection.getBoundingClientRect().top > window.innerHeight - 96);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash || location.pathname !== "/") {
      return;
    }

    const target = document.getElementById(hash);
    if (target) {
      const navOffset = 112;
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [location]);

  const labels = useMemo(() => {
    if (language === "sr") return navLabels.sr;
    return navLabels.en;
  }, [language]);
  const strip = useMemo(() => {
    if (language === "sr") return trustPoints.sr;
    return trustPoints.en;
  }, [language]);

  const goHomeAnchor = (id: HomeAnchor) => {
    if (location.pathname === "/") {
      const target = document.getElementById(id);
      if (target) {
        const navOffset = 112;
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      navigate(`/#${id}`);
    }
    setIsMobileMenuOpen(false);
  };

  const baseNavClass =
    location.pathname === "/" && !isScrolled
      ? "bg-[#0f1412]/35 text-[#f7f8f4] border-white/15"
      : "bg-[#f4f5f1]/90 text-[#111613] border-[#d4d9d3] shadow-[0_8px_26px_rgba(16,22,18,0.08)]";

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className={`border-b transition-all duration-300 ${baseNavClass}`} aria-label="Primary">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Logo.png" alt="Pogon" className="h-14 w-auto md:h-16" loading="eager" />
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <button onClick={() => goHomeAnchor("bikes")} className="text-sm tracking-wide hover:opacity-70">
              {labels.bikes}
            </button>
            <button onClick={() => goHomeAnchor("lifestyle")} className="text-sm tracking-wide hover:opacity-70">
              {labels.lifestyle}
            </button>
            <Link to="/about-us" className="text-sm tracking-wide hover:opacity-70">
              {labels.about}
            </Link>
            <Link to="/contact" className="text-sm tracking-wide hover:opacity-70">
              {labels.contact}
            </Link>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full border border-current/25 px-2.5 py-1 text-xs font-semibold"
                aria-label="Select language"
              >
                {language === "sr" ? "SR" : "EN"}
                <ChevronDown size={14} />
              </button>
              {isLangOpen ? (
                <div className="absolute right-0 mt-2 w-20 overflow-hidden rounded-xl border border-[#d4d9d3] bg-white text-[#111613] shadow-lg">
                  {languages.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => {
                        setLanguage(option.code as "en" | "sr");
                        setIsLangOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-[#edf1eb]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Link
              to="/contact"
              className="inline-flex min-w-[5.5rem] justify-center rounded-full bg-[#5f7f67] px-3 py-1.5 text-sm font-semibold text-[#f3f5f2] transition hover:bg-[#4d6954]"
            >
              {labels.cta}
            </Link>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-md p-2 lg:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-current/15 bg-[#f4f5f1] px-4 py-4 text-[#111613] lg:hidden">
            <div className="flex flex-col gap-3">
              <button onClick={() => goHomeAnchor("bikes")} className="text-left text-sm">
                {labels.bikes}
              </button>
              <button onClick={() => goHomeAnchor("lifestyle")} className="text-left text-sm">
                {labels.lifestyle}
              </button>
              <Link to="/about-us" onClick={() => setIsMobileMenuOpen(false)} className="text-sm">
                {labels.about}
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm">
                {labels.contact}
              </Link>
              <div className="mt-2 flex items-center gap-2">
                {languages.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => setLanguage(option.code as "en" | "sr")}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      language === option.code ? "border-[#111613] bg-[#111613] text-white" : "border-[#c7cdc5]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 rounded-full bg-[#5f7f67] px-4 py-2 text-center text-sm font-semibold text-[#f3f5f2]"
              >
                {labels.cta}
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 h-14 overflow-hidden border-t border-white/15 bg-[#111613]/92 text-[#f4f7f3] shadow-[0_-12px_30px_rgba(8,12,10,0.28)] backdrop-blur transition duration-300 sm:h-16 ${
        isBottomStripVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
      aria-label={language === "sr" ? "Pogon pogodnosti" : "Pogon benefits"}
    >
      <div className="flex h-full w-max animate-marquee items-center">
        {[0, 1].map((group) => (
          <div key={group} className="flex h-full shrink-0 items-center">
            {strip.map((item) => (
              <div key={`${group}-${item}`} className="flex h-full w-72 shrink-0 items-center justify-center gap-5 px-5 sm:w-96 sm:px-8">
                <span className="h-2 w-2 rounded-full bg-[#8fb798]" />
                <span className="whitespace-nowrap text-center text-sm font-semibold tracking-wide sm:text-base">{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
